#!/usr/bin/env python3
"""Auditor SEO estático de Nohuska Beauty Lab, sin dependencias externas."""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse

ROOT = Path(__file__).resolve().parents[1]
DOMAIN = "https://nohuskabeautylab.com"
EXCLUDED = {"404.html", "aviso-legal.html", "cookies.html", "privacidad.html"}


class SEOParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.title = ""
        self.description = ""
        self.canonical = ""
        self.h1: list[str] = []
        self.h1_count = 0
        self.images: list[dict[str, str]] = []
        self.links: list[str] = []
        self.schemas: list[str] = []
        self._capture = ""
        self._schema = ""

    def handle_starttag(self, tag, attrs):
        data = dict(attrs)
        if tag in {"title", "h1"}:
            self._capture = tag
            if tag == "h1":
                self.h1_count += 1
        elif tag == "meta" and data.get("name", "").lower() == "description":
            self.description = data.get("content", "").strip()
        elif tag == "link" and "canonical" in data.get("rel", "").lower():
            self.canonical = data.get("href", "").strip()
        elif tag == "img":
            self.images.append({"src": data.get("src", ""), "alt": data.get("alt", "").strip()})
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
        text = " ".join(data.split())
        if not text:
            return
        if self._capture == "title":
            self.title += text
        elif self._capture == "h1":
            self.h1.append(text)
        elif self._capture == "schema":
            self._schema += data


def public_url(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    return DOMAIN + ("/" if rel == "index.html" else f"/{rel}")


def local_target(source: Path, href: str) -> Path | None:
    if href.startswith(("#", "mailto:", "tel:", "javascript:", "https://wa.me/")):
        return None
    parsed = urlparse(href)
    if parsed.netloc and parsed.netloc not in {"nohuskabeautylab.com", "www.nohuskabeautylab.com"}:
        return None
    raw = parsed.path
    if parsed.netloc:
        candidate = ROOT / raw.lstrip("/")
    else:
        candidate = source.parent / raw
    if not raw or raw.endswith("/"):
        candidate = candidate / "index.html"
    return candidate.resolve()


def issue(level: str, path: Path, message: str) -> dict[str, str]:
    return {"level": level, "page": path.relative_to(ROOT).as_posix(), "message": message}


def audit() -> dict:
    pages = sorted(ROOT.rglob("*.html"))
    issues: list[dict[str, str]] = []
    records = []
    for path in pages:
        parser = SEOParser()
        parser.feed(path.read_text(encoding="utf-8"))
        is_indexable = path.name not in EXCLUDED
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
        for schema in parser.schemas:
            try:
                json.loads(schema)
            except json.JSONDecodeError as exc:
                issues.append(issue("error", path, f"JSON-LD no válido: {exc.msg}"))
        missing_alt = [img["src"] for img in parser.images if not img["alt"]]
        if missing_alt:
            issues.append(issue("error", path, f"Imágenes sin texto alternativo: {', '.join(missing_alt)}"))
        for href in parser.links:
            target = local_target(path, href)
            if target and ROOT.resolve() in target.parents and not target.exists():
                issues.append(issue("error", path, f"Enlace interno roto: {href}"))
        records.append({"path": path.relative_to(ROOT).as_posix(), "title": parser.title,
                        "description": parser.description, "canonical": parser.canonical})

    for field, label in (("title", "título"), ("description", "descripción")):
        counts = Counter(r[field] for r in records if r[field])
        for value, count in counts.items():
            if count > 1:
                issues.append({"level": "warning", "page": "varias", "message": f"{label.capitalize()} duplicado en {count} páginas: {value}"})

    sitemap_path = ROOT / "sitemap.xml"
    sitemap = sitemap_path.read_text(encoding="utf-8") if sitemap_path.exists() else ""
    for path in pages:
        if path.name not in EXCLUDED and public_url(path) not in sitemap:
            issues.append(issue("error", path, "La página no está incluida en sitemap.xml"))

    errors = sum(i["level"] == "error" for i in issues)
    warnings = sum(i["level"] == "warning" for i in issues)
    score = max(0, 100 - errors * 8 - warnings * 2)
    return {"generated_at": datetime.now(timezone.utc).isoformat(), "domain": DOMAIN,
            "pages_checked": len(pages), "score": score, "errors": errors,
            "warnings": warnings, "issues": issues}


def markdown(report: dict) -> str:
    lines = ["# Informe automático SEO — Nohuska Beauty Lab", "",
             f"- Puntuación técnica: **{report['score']}/100**",
             f"- Páginas revisadas: **{report['pages_checked']}**",
             f"- Errores: **{report['errors']}**", f"- Avisos: **{report['warnings']}**", ""]
    if not report["issues"]:
        lines.append("✅ No se han detectado incidencias técnicas.")
    else:
        lines += ["## Prioridades", ""]
        for item in report["issues"]:
            icon = "❌" if item["level"] == "error" else "⚠️"
            lines.append(f"- {icon} `{item['page']}` — {item['message']}")
    lines += ["", "> Este control mejora la base técnica, pero no garantiza posiciones. El SEO local también depende de contenido útil, reseñas, autoridad y Search Console.", ""]
    return "\n".join(lines)


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    result = audit()
    out = ROOT / "seo-report"
    out.mkdir(exist_ok=True)
    (out / "report.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    (out / "report.md").write_text(markdown(result), encoding="utf-8")
    print(markdown(result))
    sys.exit(1 if result["errors"] else 0)
