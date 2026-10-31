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
  for (const withReference of [false, true]) {
    const links = [...html.matchAll(/<a\b([^>]*href="https:\/\/wa.me\/34624011715[^>]+)>([^<]*)<\/a>/g)].map(m => {
      const service = m[1].match(/data-service="([^"]+)"/)?.[1] || "cejas";
      const url = new URL(m[1].match(/href="([^"]+)"/)[1]);
      if (withReference) url.searchParams.set("text", url.searchParams.get("text") + "\n\nReferencia: WEB-" + service.toUpperCase() + "-GRANOLLERS-INSTAGRAM-SOCIAL");
      return { href: url.toString(), textContent: m[2], dataset: { service, ctaPosition: "conservada", source: "instagram-social" } };
    });
    assert.ok(links.length >= 2);
    const originals = links.map(link => ({ ...link, dataset: { ...link.dataset } }));
    const listeners = {};
    const choice = { options, selectedIndex: 0, get value() { return options[this.selectedIndex].value; }, addEventListener: (name, fn) => { listeners[name] = fn; } };
    vm.runInNewContext(script, { URL, document: { querySelector: () => choice, querySelectorAll: () => links }, window: { addEventListener: (name, fn) => { listeners[name] = fn; } } });
    for (let i = 1; i < options.length; i++) {
      choice.selectedIndex = i;
      listeners.change();
      listeners.pageshow();
      for (const link of links) {
        const url = new URL(link.href);
        assert.equal(url.origin + url.pathname, "https://wa.me/34624011715");
        assert.ok(url.searchParams.get("text").includes(options[i].textContent));
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
assert.match(lashes, /data-service="extensiones-pelo-a-pelo"/);
assert.match(lashes, /data-service="pestanas" data-cta-position="alternativa-pestanas"/);
const browHero = read("tratamientos/micropigmentacion-cejas-granollers.html").match(/href="(https:\/\/wa.me\/[^\"]+)"/)[1];
assert.match(new URL(browHero).searchParams.get("text"), /información comparativa de microblading y nanoblading, sin dar por confirmada su disponibilidad/);
assert.ok(home.includes('data-service="tinte-cejas"'));
console.log(`PASS: ${contacts} treatment WhatsApp destinations with predefined context; specific modality tags and informational microblading/nanoblading wording.`);
