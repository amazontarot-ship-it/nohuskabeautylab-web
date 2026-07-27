#!/usr/bin/env python3
"""Auditor SEO estático y de producción de Nohuska, sin dependencias."""

from __future__ import annotations

import json
import os
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
DOMAIN = "https://nohuska.com"
EXCLUDED = {"404.html", "aviso-legal.html", "cookies.html", "privacidad.html", "opina.html"}
MAX_HTML_BYTES = 150_000
MAX_IMAGE_BYTES = 450_000
REQUIRED_SCHEMA_TYPES = {"BeautySalon", "Service", "LocalBusiness", "CollectionPage"}


class SEOParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title = ""
        self.description = ""
        self.canonical = ""
        self.robots = ""
        self.lang = ""
        self.h1_count = 0
        self.images: list[dict[str, str]] = []
        self.links: list[str] = []
        self.schemas: list[str] = []
        self._capture = ""
        self._schema = ""

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag == "html":
            self.lang = data.get("lang", "")
        if tag in {"title", "h1"}:
            self._capture = tag
            if tag == "h1":
                self.h1_count += 1
        elif tag == "meta" and data.get("name", "").lower() == "description":
            self.description = data.get("content", "").strip()
        elif tag == "meta" and data.get("name", "").lower() == "robots":
            self.robots = data.get("content", "").strip().lower()
        elif tag == "link" and "canonical" in data.get("rel", "").lower():
            self.canonical = data.get("href", "").strip()
        elif tag == "img":
            self.images.append({
                "src": data.get("src", ""),
                "alt": data.get("alt", "").strip(),
                "width": data.get("width", ""),
                "height": data.get("height", ""),
                "loading": data.get("loading", ""),
            })
        elif tag == "a" and data.get("href"):
            self.links.append(data["href"])
        elif tag == "script" and data.get("type", "").lower() == "application/ld+json":
            self._capture = "schema"
            self._schema = ""

    def handle_endtag(self, tag):
        if tag == "script" and self._capture == "schema":
            self.schemas.append(self._schema.strip())
            self._capture = ""
        elif tag == self._capture:
            self._capture = ""

    def handle_data(self, data):
        if self._capture == "title":
            self.title += " ".join(data.split())
        elif self._capture == "schema":
            self._schema += data


def public_url(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    return DOMAIN + ("/" if rel == "index.html" else f"/{rel}")


def local_target(source: Path, href: str) -> Path | None:
    if href.startswith(("#", "mailto:", "tel:", "javascript:", "https://wa.me/")):
        return None
    parsed = urlparse(href)
    if parsed.netloc and parsed.netloc not in {"nohuska.com", "www.nohuska.com"}:
        return None
    raw = parsed.path
    candidate = ROOT / raw.lstrip("/") if parsed.netloc else source.parent / raw
    if not raw or raw.endswith("/"):
        candidate /= "index.html"
    return candidate.resolve()


def issue(level: str, path: Path | str, message: str) -> dict[str, str]:
    page = path.relative_to(ROOT).as_posix() if isinstance(path, Path) else path
    return {"level": level, "page": page, "message": message}


def schema_types(value) -> set[str]:
    found: set[str] = set()
    if isinstance(value, dict):
        kind = value.get("@type")
        if isinstance(kind, str):
            found.add(kind)
        elif isinstance(kind, list):
            found.update(x for x in kind if isinstance(x, str))
        for child in value.values():
            found.update(schema_types(child))
    elif isinstance(value, list):
        for child in value:
            found.update(schema_types(child))
    return found


def live_check(url: str) -> tuple[int, str, str]:
    request = Request(url, headers={"User-Agent": "NohuskaSEOAudit/2.0"})
    with urlopen(request, timeout=20) as response:
        body = response.read(600_000).decode("utf-8", errors="replace")
        return response.status, response.geturl(), body


def audit() -> dict:
    pages = sorted(ROOT.rglob("*.html"))
    issues: list[dict[str, str]] = []
    records = []
    parsed_pages: dict[Path, SEOParser] = {}

    for path in pages:
        parser = SEOParser()
        parser.feed(path.read_text(encoding="utf-8"))
        parsed_pages[path] = parser
        is_indexable = path.name not in EXCLUDED and "noindex" not in parser.robots

        if path.stat().st_size > MAX_HTML_BYTES:
            issues.append(issue("warning", path, f"HTML pesado: {path.stat().st_size // 1024} KB"))
        if parser.lang != "es":
            issues.append(issue("warning", path, "El idioma HTML debe ser es"))
        if is_indexable:
            if not parser.title:
                issues.append(issue("error", path, "Falta el título SEO"))
            elif not 30 <= len(parser.title) <= 65:
                issues.append(issue("warning", path, f"Título de {len(parser.title)} caracteres (objetivo: 30–65)"))
            if not parser.description:
                issues.append(issue("error", path, "Falta la meta description"))
            elif not 105 <= len(parser.description) <= 165:
                issues.append(issue("warning", path, f"Descripción de {len(parser.description)} caracteres (objetivo: 105–165)"))
            if parser.h1_count != 1:
                issues.append(issue("error", path, f"Debe haber un H1; encontrados: {parser.h1_count}"))
            expected = public_url(path)
            if parser.canonical != expected:
                issues.append(issue("error", path, f"Canonical incorrecta: '{parser.canonical}' (esperada: {expected})"))
            if not parser.schemas:
                issues.append(issue("warning", path, "Faltan datos estructurados JSON-LD"))

        types: set[str] = set()
        for schema in parser.schemas:
            try:
                types.update(schema_types(json.loads(schema)))
            except json.JSONDecodeError as exc:
                issues.append(issue("error", path, f"JSON-LD no válido: {exc.msg}"))
        if is_indexable and parser.schemas and not (types & REQUIRED_SCHEMA_TYPES):
            issues.append(issue("warning", path, f"Schema sin negocio o servicio: {', '.join(sorted(types))}"))

        for image in parser.images:
            if not image["alt"]:
                issues.append(issue("error", path, f"Imagen sin texto alternativo: {image['src']}"))
            target = (path.parent / image["src"]).resolve()
            if image["src"] and ROOT.resolve() in target.parents and target.exists():
                if target.stat().st_size > MAX_IMAGE_BYTES:
                    issues.append(issue("warning", path, f"Imagen pesada: {image['src']} ({target.stat().st_size // 1024} KB)"))

        for href in parser.links:
            target = local_target(path, href)
            if target and ROOT.resolve() in target.parents and not target.exists():
                issues.append(issue("error", path, f"Enlace interno roto: {href}"))

        records.append({"path": path.relative_to(ROOT).as_posix(), "title": parser.title,
                        "description": parser.description, "canonical": parser.canonical})

    for field, label in (("title", "título"), ("description", "descripción")):
        counts = Counter(record[field] for record in records if record[field])
        for value, count in counts.items():
            if count > 1:
                issues.append(issue("warning", "varias", f"{label.capitalize()} duplicado en {count} páginas: {value}"))

    sitemap_path = ROOT / "sitemap.xml"
    sitemap = sitemap_path.read_text(encoding="utf-8") if sitemap_path.exists() else ""
    for path, parser in parsed_pages.items():
        if path.name not in EXCLUDED and "noindex" not in parser.robots and public_url(path) not in sitemap:
            issues.append(issue("error", path, "La página no está incluida en sitemap.xml"))

    live_results = []
    live_urls = () if os.environ.get("SEO_SKIP_LIVE") == "1" else (
        f"{DOMAIN}/", f"{DOMAIN}/robots.txt", f"{DOMAIN}/sitemap.xml"
    )
    for url in live_urls:
        try:
            status, final_url, body = live_check(url)
            live_results.append({"url": url, "status": status, "final_url": final_url})
            if status != 200:
                issues.append(issue("error", "producción", f"{url} responde con HTTP {status}"))
            if url.endswith("robots.txt") and f"Sitemap: {DOMAIN}/sitemap.xml" not in body:
                issues.append(issue("error", "producción", "robots.txt no declara el sitemap oficial"))
            if url.endswith("sitemap.xml") and "<urlset" not in body:
                issues.append(issue("error", "producción", "El sitemap publicado no parece XML válido"))
        except (HTTPError, URLError, TimeoutError) as exc:
            issues.append(issue("error", "producción", f"No se pudo consultar {url}: {exc}"))

    errors = sum(item["level"] == "error" for item in issues)
    warnings = sum(item["level"] == "warning" for item in issues)
    score = max(0, 100 - errors * 8 - warnings * 2)
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "domain": DOMAIN,
        "pages_checked": len(pages),
        "score": score,
        "errors": errors,
        "warnings": warnings,
        "issues": issues,
        "live_checks": live_results,
    }


def markdown(report: dict) -> str:
    lines = [
        "# Informe automático SEO — Nohuska Beauty Lab", "",
        f"- Puntuación técnica: **{report['score']}/100**",
        f"- Páginas revisadas: **{report['pages_checked']}**",
        f"- Errores: **{report['errors']}**",
        f"- Avisos: **{report['warnings']}**", "",
    ]
    if not report["issues"]:
        lines.append("✅ No se han detectado incidencias técnicas.")
    else:
        lines += ["## Prioridades", ""]
        for item in report["issues"]:
            icon = "❌" if item["level"] == "error" else "⚠️"
            lines.append(f"- {icon} `{item['page']}` — {item['message']}")
    lines += ["", "> La auditoría comprueba la base técnica. Las posiciones también dependen de utilidad, autoridad, reseñas y competencia local.", ""]
    return "\n".join(lines)


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    result = audit()
    output = ROOT / "seo-report"
    output.mkdir(exist_ok=True)
    (output / "report.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    (output / "report.md").write_text(markdown(result), encoding="utf-8")
    print(markdown(result))
    sys.exit(1 if result["errors"] else 0)
