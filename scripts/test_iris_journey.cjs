"use strict";
// Usa los enlaces y opciones reales; DOM simulado, sin red ni mensajes.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const script = read("assets/nohuska-recorrido.js");
let cases = 0;
for (const file of ["cejas-granollers.html", "extensiones-pestanas-granollers.html", "micropigmentacion-cejas-granollers.html"]) {
  const html = read("tratamientos/" + file);
  assert.match(html, /<label for="consultation-choice">/);
  assert.ok(html.indexOf("nohuska-conversiones.js") < html.indexOf("nohuska-recorrido.js"));
  const options = [...html.matchAll(/<option value="([^"]*)">([^<]*)<\/option>/g)].map(m => ({ value: m[1], textContent: m[2] }));
  if (file === "extensiones-pestanas-granollers.html") {
    for (const label of ["Relleno de extensiones · 35 €", "Retirada de extensiones · 15 €"]) {
      assert.ok(options.some(option => option.textContent === label && option.value === "extensiones-pestanas"), "Maintenance choices must retain the existing extensions family");
    }
  }
  for (const withReference of [false, true]) {
    const links = [...html.matchAll(/<a\b([^>]*href="https:\/\/wa.me\/34624011715[^>]+)>([^<]*)<\/a>/g)].map(m => {
      const service = m[1].match(/data-service="([^"]+)"/)?.[1] || "cejas";
      const contactIntent = m[1].match(/data-contact-intent="([^"]+)"/)?.[1];
      const url = new URL(m[1].match(/href="([^"]+)"/)[1]);
      if (withReference) url.searchParams.set("text", url.searchParams.get("text") + "\n\nReferencia: WEB-" + service.toUpperCase() + "-GRANOLLERS-INSTAGRAM-SOCIAL");
      const keepMessage = m[1].includes("data-keep-message") ? "" : undefined;
      return { href: url.toString(), textContent: m[2], dataset: { service, contactIntent, keepMessage, ctaPosition: "conservada", source: "instagram-social" } };
    });
    assert.ok(links.length >= 2);
    const originals = links.map(link => ({ ...link, dataset: { ...link.dataset } }));
    const pmuActions = ["Enviar mis fotografías", "Solicitar valoración"];
    if (file === "micropigmentacion-cejas-granollers.html") {
      for (const label of pmuActions) assert.equal(originals.filter(link => link.textContent === label).length, 1);
    }
    if (file === "extensiones-pestanas-granollers.html") assert.ok(originals.some(link => link.textContent === "Consultar volumen y estilos"));
    const listeners = {};
    const choice = { options, selectedIndex: 0, get value() { return options[this.selectedIndex].value; }, set value(v) { this.selectedIndex = options.findIndex(o => o.value === v); }, addEventListener: (name, fn) => { listeners[name] = fn; } };
    const sections = new Map([...html.matchAll(/<section\b[^>]*id="([^"]+)"[^>]*data-consultation-value="([^"]+)"/g)].map(m => [m[1], { dataset: { consultationValue: m[2] } }]));
    const location = { hash: "" };
    const start = () => vm.runInNewContext(script, { URL, document: { querySelector: () => choice, querySelectorAll: () => links, getElementById: id => sections.get(id) }, window: { location, addEventListener: (name, fn) => { listeners[name] = fn; } } });
    if (file === "extensiones-pestanas-granollers.html") {
      for (const [fragment, service] of [["pelo-a-pelo","extensiones-pelo-a-pelo"], ["volumen","extensiones-volumen"], ["click-lash","click-lash"], ["cuidados-extensiones",""]]) {
        location.hash = "#" + fragment;
        start();
        assert.equal(choice.value, service, "Catalogue links must keep the technique, without guessing for care enquiries");
        if (service) for (const [i, link] of links.entries()) {
          if (originals[i].dataset.service === "extensiones-volumen") assert.deepEqual(link, originals[i]);
          else {
            const text = new URL(link.href).searchParams.get("text");
            assert(text.includes(choice.options[choice.selectedIndex].textContent));
            if (withReference) assert(text.endsWith("Referencia: WEB-" + service.toUpperCase() + "-GRANOLLERS-INSTAGRAM-SOCIAL"));
          }
        }
        location.hash = "#volumen"; listeners.hashchange();
        assert.equal(choice.value, "extensiones-volumen");
        choice.value = "click-lash"; listeners.change();
        location.hash = "#pelo-a-pelo"; listeners.hashchange(); listeners.pageshow();
        assert.equal(choice.value, "click-lash", "A manual choice wins over a section visited afterwards");
        choice.selectedIndex = 0; listeners.change();
        location.hash = "#volumen"; listeners.hashchange(); listeners.pageshow();
        assert.deepEqual(links, originals, "Browsing a section must not override an explicit request for general advice");
      }
      location.hash = "";
    }
    start();
    for (let i = 1; i < options.length; i++) {
      choice.selectedIndex = i;
      listeners.change();
      listeners.pageshow();
      for (const [index, link] of links.entries()) {
        const url = new URL(link.href);
        assert.equal(url.origin + url.pathname, "https://wa.me/34624011715");
        if (originals[index].textContent === "Consultar volumen y estilos") {
          assert.deepEqual(link, originals[index], "El enlace de la sección de volumen debe conservar su modalidad, mensaje y referencia");
          continue;
        }
        assert.ok(url.searchParams.get("text").includes(options[i].textContent));
        if (file === "micropigmentacion-cejas-granollers.html" && pmuActions.includes(originals[index].textContent)) {
          assert.equal(link.textContent, originals[index].textContent, "No sustituir la acción de fotografías o presupuesto por una consulta genérica");
          const originalText = new URL(originals[index].href).searchParams.get("text").split("\n\nReferencia: WEB-")[0];
          assert.equal(url.searchParams.get("text").split("\n\nReferencia: WEB-")[0], originalText + "\nMe interesa: " + options[i].textContent + ".");
        } else if (link.dataset.contactIntent === "valuation") {
          assert.ok(url.searchParams.get("text").includes("una valoración gratuita de "));
          assert.equal(link.textContent, "Valoración gratuita: " + options[i].textContent);
        } else if (link.dataset.contactIntent === "appointment") {
          assert.ok(url.searchParams.get("text").includes("solicitar cita para "));
          assert.equal(link.textContent, "Solicitar cita de " + options[i].textContent);
        } else {
          assert.equal(link.textContent, "Consultar " + options[i].textContent + " por WhatsApp");
        }
        assert.equal(link.dataset.service, options[i].value);
        assert.equal(link.dataset.ctaPosition, "conservada");
        assert.equal(link.dataset.source, "instagram-social");
        if (withReference) assert.ok(url.searchParams.get("text").endsWith("Referencia: WEB-" + options[i].value.toUpperCase() + "-GRANOLLERS-INSTAGRAM-SOCIAL"));
      }
      cases++;
    }
    choice.selectedIndex = 0;
    listeners.change();
    assert.deepEqual(links, originals);
  }
}
const lashGuide = read("guias/lifting-o-extensiones-pestanas.html");
const lashClosing = lashGuide.match(/<section class="cta">([\s\S]*?)<\/section>/)[1];
assert(lashClosing.includes('href="../tratamientos/extensiones-pestanas-granollers.html"') && lashClosing.includes('>Consultar lifting con tinte</a>'), "Offer extensions without relabelling a lifting enquiry");
assert(new URL(lashGuide.match(/class="mobile-contact"[^>]*href="([^"]+)"/)[1]).searchParams.get("text").includes("volumen"));
const home = read("index.html");
for (const treatment of ["Laminado de cejas", "Tinte de pestañas", "Lifting de pestañas con tinte", "Click Lash", "Extensiones de pestañas pelo a pelo"]) {
  assert.ok(home.includes("Consultar " + treatment + " por WhatsApp"));
}
assert.match(home, /Una consulta por WhatsApp no confirma una reserva/);
for (const file of fs.readdirSync(path.join(__dirname, "../tratamientos")).filter(f => f.endsWith(".html"))) {
  const html = read("tratamientos/" + file);
  if (html.includes('<section class="cta"')) assert.match(html, /Una consulta por WhatsApp no confirma una reserva/, file);
  assert.doesNotMatch(html, /<a\b[^>]*href="https:\/\/wa.me\/[^>]*>Reservar[^<]*<\/a>/, file);
}
console.log(`PASS: ${cases} modality/attribution variants, all page WhatsApp links including mobile, reset, pageshow, treatment CTAs and consultation notices. DOM simulation; no browser rendering.`);

let contacts = 0;
for (const file of fs.readdirSync(path.join(__dirname, "../tratamientos")).filter(f => f.endsWith(".html"))) {
  for (const match of read("tratamientos/" + file).matchAll(/<a\b[^>]*href="(https:\/\/wa.me\/[^\"]+)"[^>]*>/g)) {
    const url = new URL(match[1]);
    assert.equal(url.origin + url.pathname, "https://wa.me/34624011715", file);
    assert.ok(url.searchParams.get("text")?.trim(), file + ": missing treatment context");
    contacts++;
  }
}
const lashes = read("tratamientos/pestanas-granollers.html");
assert.match(lashes, /data-service="extensiones-pestanas" data-cta-position="hero-extensiones"/);
assert.match(lashes, /data-service="pestanas" data-cta-position="alternativa-pestanas"/);
const browPage = read("tratamientos/micropigmentacion-cejas-granollers.html");
const browHero = browPage.match(/href="(https:\/\/wa.me\/[^\"]+)"/)[1];
assert.match(new URL(browHero).searchParams.get("text"), /valoración gratuita de cejas.*microblading, nanoblading/);
assert.doesNotMatch(browPage, /sin disponibilidad confirmada|sin confirmar su disponibilidad|sin dar por confirmada|no confirma que se realicen/);
const browSchema = JSON.parse(browPage.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
for (const technique of ["Microblading manual", "Nanoblading manual"]) {
  assert.ok(browPage.includes('value="micropigmentacion-cejas">' + technique + '</option>'));
  assert.ok(browSchema["@graph"].find(node => node["@type"] === "Service").serviceType.includes(technique));
}
assert.ok(home.includes('data-service="tinte-cejas"'));
console.log(`PASS: ${contacts} treatment WhatsApp destinations with predefined context; specific modality tags and confirmed manual microblading/nanoblading offer.`);
