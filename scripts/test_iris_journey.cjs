"use strict";
// Usa los enlaces y opciones reales; DOM simulado, sin red ni mensajes.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
const script = read("assets/nohuska-recorrido.js");
let cases = 0;
for (const file of ["cejas-granollers.html", "extensiones-pestanas-granollers.html", "micropigmentacion-cejas-granollers.html", "lifting-pestanas-granollers.html", "nohuska-natural-brow-granollers.html", "nohuska-men-granollers.html"]) {
  const html = read("tratamientos/" + file);
  assert.match(html, /<label for="consultation-choice">/);
  assert.ok(html.indexOf("nohuska-conversiones.js") < html.indexOf("nohuska-recorrido.js"));
  const options = [...html.matchAll(/<option\b([^>]*)>([^<]*)<\/option>/g)].map(m => ({ id: m[1].match(/id="([^"]+)"/)?.[1], value: m[1].match(/value="([^"]*)"/)[1], textContent: m[2], dataset: { bookingDetail: m[1].match(/data-booking-detail="([^"]+)"/)?.[1] } }));
  const priced = /<select\b[^>]*\bdata-priced-options\b/.test(html);
  const pmu = file === "micropigmentacion-cejas-granollers.html";
  const lifting = file === "lifting-pestanas-granollers.html";
  const brow = file === "nohuska-natural-brow-granollers.html";
  assert.equal(priced, pmu || lifting || brow || file === "extensiones-pestanas-granollers.html" || file === "nohuska-men-granollers.html");
  if (priced) {
    assert.equal(options[0].value, ""); assert.doesNotMatch(options[0].textContent, /€/);
    const hero = html.match(/<section class="hero">([\s\S]*?)<\/section>/)[1];
    assert.match(hero, /<\/h1>[\s\S]*data-consultation-choice[\s\S]*data-contact-intent="appointment"[\s\S]*<img/);
  }
  if (file === "extensiones-pestanas-granollers.html") {
    assert.deepEqual(options.slice(1).map(o => [o.value, o.textContent]), [
      ["extensiones-pelo-a-pelo", "Extensiones pelo a pelo · 55 €"], ["extensiones-volumen", "Extensiones de volumen · 55 €"],
      ["click-lash", "Click Lash · 35 €"], ["extensiones-pestanas", "Relleno de extensiones · 35 €"],
      ["extensiones-pestanas", "Retirada de extensiones · 15 €"]
    ]);
  } else if (lifting) {
    assert.deepEqual(options.slice(1).map(o => [o.id, o.value, o.textContent]), [
      ["opcion-lifting-sin-tinte", "lifting-pestanas", "Lifting coreano sin tinte · 45 €"],
      ["opcion-lifting-con-tinte", "lifting-pestanas", "Lifting coreano con tinte vegano · 55 €"]
    ]);
  } else if (brow) {
    assert.deepEqual(options.slice(1).map(o => [o.id, o.value, o.textContent]), [
      ["opcion-laminado-sin-tinte", "laminado-cejas", "Laminado sin tinte · 45 €"],
      ["opcion-natural-brow-con-tinte", "nohuska-brow", "Natural Brow con tinte · 55 €"]
    ]);
    for (const o of options.slice(1)) assert.match(o.dataset.bookingDetail, /visagismo, diseño personalizado, depilación(?: y|,) laminado/);
    assert.doesNotMatch(options[1].dataset.bookingDetail, /tinte/);
    assert.match(options[2].dataset.bookingDetail, /tinte/);
    assert.match(html, /data-consultation-finish[^>]*maxlength="120"|maxlength="120"[^>]*data-consultation-finish/);
  } else if (pmu) {
    assert.deepEqual(options.slice(1).map(o => o.textContent).sort(), [
      "Micropigmentación de cejas · 230 €", "Microblading manual · 297 €", "Nanoblading manual · 297 €",
      "Corrección de un trabajo antiguo · A valorar", "Hair Stroke · A valorar", "Powder Brows · A valorar",
      "Repaso de un trabajo de Nohuska · A valorar", "Trabajo de otro centro · A valorar"
    ].sort());
  }
  for (const withReference of [false, true]) {
    const links = [...html.matchAll(/<a\b([^>]*href="https:\/\/wa.me\/34624011715[^>]+)>([^<]*)<\/a>/g)].map(m => {
      const service = m[1].match(/data-service="([^"]+)"/)?.[1] || "cejas";
      const contactIntent = m[1].match(/data-contact-intent="([^"]+)"/)?.[1];
      const url = new URL(m[1].match(/href="([^"]+)"/)[1]);
      if (withReference) url.searchParams.set("text", url.searchParams.get("text") + "\n\nReferencia: WEB-" + service.toUpperCase() + "-GRANOLLERS-INSTAGRAM-SOCIAL");
      const keepMessage = m[1].includes("data-keep-message") ? "" : undefined;
      const fixedConsultation = m[1].includes("data-fixed-consultation") ? "" : undefined;
      return { href: url.toString(), textContent: m[2], dataset: { service, contactIntent, keepMessage, fixedConsultation, ctaPosition: "conservada", source: "instagram-social" } };
    });
    assert.ok(links.length >= 2);
    const originals = links.map(link => ({ ...link, dataset: { ...link.dataset } }));
    const pmuActions = ["Consultar mi repaso en Nohuska", "Valorar un trabajo de otro centro", "Valorar una posible corrección"];
    if (pmu) {
      for (const label of pmuActions) {
        const matches=originals.filter(link=>link.textContent===label);assert.equal(matches.length,1);
        const link=matches[0];assert.equal(link.dataset.fixedConsultation,"");assert.equal(link.dataset.contactIntent,"valuation");
        assert.match(new URL(link.href).searchParams.get("text"),/valoración gratuita/);
        assert.doesNotMatch(new URL(link.href).searchParams.get("text"),/solicitar cita|\d+\s*€/);
      }
    }
    if (priced) {
      if (file === "extensiones-pestanas-granollers.html") assert.ok(originals.some(link => link.textContent === "Consultar volumen y estilos"));
      const general = originals.filter(link => link.dataset.contactIntent === "appointment" && link.dataset.fixedConsultation === undefined);
      assert.equal(general.length, 2);
      for (const link of general) assert.doesNotMatch(link.textContent + new URL(link.href).searchParams.get("text"), /€/, "Do not quote a price before choosing a technique");
    }
    const listeners = {};
    const finish = brow ? { value: "", addEventListener: (name, fn) => { listeners["finish-" + name] = fn; } } : null;
    const choice = { options, dataset: priced ? { pricedOptions: "" } : {}, selectedIndex: 0, get value() { return options[this.selectedIndex].value; }, set value(v) { this.selectedIndex = options.findIndex(o => o.value === v); }, addEventListener: (name, fn) => { listeners[name] = fn; } };
    const sections = new Map([...html.matchAll(/<(?:section|div|p|tr|span)\b[^>]*id="([^"]+)"[^>]*data-consultation-value="([^"]+)"/g)].map(m => [m[1], { dataset: { consultationValue: m[2] } }]));
    const location = { hash: "" };
    const start = () => vm.runInNewContext(script, { URL, document: { querySelector: selector => selector === "[data-consultation-choice]" ? choice : finish, querySelectorAll: () => links, getElementById: id => sections.get(id) }, window: { location, addEventListener: (name, fn) => { listeners[name] = fn; } } });
    if (brow) {
      for (const [hash, index] of [["#laminado-sin-tinte", 1], ["#natural-brow-con-tinte", 2]]) {
        location.hash = hash; start();
        assert.equal(choice.selectedIndex, index, "An official offer link selects that modality, not a default 55 € package");
        const text = new URL(links.find(l => l.dataset.contactIntent === "appointment").href).searchParams.get("text");
        assert(text.includes(options[index].textContent) && text.includes(options[index].dataset.bookingDetail));
        choice.selectedIndex = 0; listeners.change(); listeners.hashchange();
        assert.deepEqual(links, originals);
      }
      location.hash = ""; start();
      for (const index of [0, 1, 2]) {
        choice.selectedIndex = index; listeners.change();
        finish.value = "  Más elevadas\n  & fluffy <sin decidir>  "; listeners["finish-input"](); listeners.pageshow();
        for (const [i, link] of links.entries()) {
          if (originals[i].dataset.fixedConsultation !== undefined) { assert.deepEqual(link, originals[i]); continue; }
          const text = new URL(link.href).searchParams.get("text");
          assert(text.includes("\nAcabado que busco: Más elevadas & fluffy <sin decidir>"));
          assert.equal((text.match(/Acabado que busco:/g) || []).length, 1);
          assert.equal(link.dataset.contactIntent, originals[i].dataset.contactIntent);
          if (!index) { assert.doesNotMatch(text, /€/); assert(text.includes("con tinte") && text.includes("sin tinte")); }
          else assert(text.includes(options[index].textContent.split(" · ")[0]));
          if (withReference) assert(text.endsWith("Referencia: WEB-" + (index ? options[index].value : originals[i].dataset.service).toUpperCase() + "-GRANOLLERS-INSTAGRAM-SOCIAL"));
        }
        finish.value = "x".repeat(200); listeners["finish-input"]();
        assert(new URL(links[0].href).searchParams.get("text").includes("Acabado que busco: " + "x".repeat(120)));
        assert(!new URL(links[0].href).searchParams.get("text").includes("x".repeat(121)));
        finish.value = ""; listeners["finish-input"]();
      }
      choice.selectedIndex = 0; listeners.change(); assert.deepEqual(links, originals);
    }
    if (lifting) {
      for (const [hash, label] of [["#lifting-sin-tinte", "Lifting coreano sin tinte · 45 €"], ["#lifting-con-tinte", "Lifting coreano con tinte vegano · 55 €"]]) {
        location.hash = hash; start();
        assert.equal(options[choice.selectedIndex].textContent, label, "Keep the lifting variant when both share an attribution code");
        for (const [i, link] of links.entries()) {
          if (originals[i].dataset.fixedConsultation !== undefined) { assert.deepEqual(link, originals[i]); continue; }
          const message = new URL(link.href).searchParams.get("text");
          assert(message.includes(label.split(" · ")[0]));
          if (link.dataset.contactIntent === "appointment") assert(message.includes(label));
          if (withReference) assert(message.endsWith("Referencia: WEB-LIFTING-PESTANAS-GRANOLLERS-INSTAGRAM-SOCIAL"));
        }
        choice.selectedIndex = 1; listeners.change();
        location.hash = "#lifting-con-tinte"; listeners.hashchange(); listeners.pageshow();
        assert.equal(choice.selectedIndex, 1, "A manual lifting choice wins over later section navigation");
        choice.selectedIndex = 0; listeners.change();
        listeners.hashchange(); listeners.pageshow();
        assert.deepEqual(links, originals, "Returning to advice must not force a tint option or price");
      }
      location.hash = "";
    }
    if (file === "extensiones-pestanas-granollers.html") {
      for (const [fragment, service] of [["pelo-a-pelo","extensiones-pelo-a-pelo"], ["volumen","extensiones-volumen"], ["click-lash","click-lash"], ["relleno","extensiones-pestanas"], ["cuidados-extensiones",""]]) {
        location.hash = "#" + fragment;
        start();
        assert.equal(choice.value, service, "Catalogue links must keep the technique, without guessing for care enquiries");
        if (service) for (const [i, link] of links.entries()) {
          if (originals[i].dataset.service === "extensiones-volumen" || originals[i].dataset.fixedConsultation !== undefined) assert.deepEqual(link, originals[i]);
          else {
            const text = new URL(link.href).searchParams.get("text");
            const label = choice.options[choice.selectedIndex].textContent;
            if (fragment === "relleno") assert.equal(label, "Relleno de extensiones · 35 €");
            assert(text.includes(link.dataset.contactIntent === "appointment" ? label : label.split(" · ")[0]));
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
    if (file === "cejas-granollers.html") {
      const guide=read("tratamientos/guia-tratamientos-nohuska.html");
      for (const [hash,label] of [["#diseno-cejas","Diseño de cejas"],["#depilacion-cejas","Depilación de cejas"]]) {
        assert(guide.includes('href="cejas-granollers.html'+hash+'"'));
        location.hash=hash; start();
        assert.equal(options[choice.selectedIndex].textContent,label);
        const booking=links.find(link=>link.dataset.contactIntent==="appointment");
        assert(new URL(booking.href).searchParams.get("text").includes("solicitar cita para "+label));
        choice.selectedIndex=0; listeners.change(); assert.deepEqual(links,originals);
      }
      location.hash="";
    }
    if (pmu) {
      for (const [hash,label] of [["#microblading","Microblading manual"], ["#nanoblading","Nanoblading manual"], ["#resultado-nanoblading","Nanoblading manual"], ["#hair-stroke","Hair Stroke"], ["#repaso-nohuska","Repaso de un trabajo de Nohuska"], ["#trabajo-otro-centro","Trabajo de otro centro"], ["#correccion","Corrección de un trabajo antiguo"]]) {
        location.hash = hash; start();
        const [name, price] = options[choice.selectedIndex].textContent.split(" · ");
        assert.equal(name,label,"Keep the technique even when its reporting code is shared");
        for (const [i,link] of links.entries()) {
          const message = new URL(link.href).searchParams.get("text");
          if (link.dataset.fixedConsultation !== undefined) { assert.deepEqual(link,originals[i]); continue; }
          assert(message.includes(label) && link.dataset.service === "micropigmentacion-cejas");
          if (originals[i].dataset.contactIntent === "appointment") assert(message.includes(price === "A valorar" ? "presupuesto" : "solicitar cita"));
          if (withReference) assert(message.endsWith("Referencia: WEB-MICROPIGMENTACION-CEJAS-GRANOLLERS-INSTAGRAM-SOCIAL"));
        }
        choice.selectedIndex = options.findIndex(o=>o.textContent.startsWith("Hair Stroke · ")); listeners.change();
        location.hash = "#resultado-nanoblading"; listeners.hashchange(); listeners.pageshow();
        assert.match(options[choice.selectedIndex].textContent,/^Hair Stroke · /);
        choice.selectedIndex=0; listeners.change(); assert.deepEqual(links,originals);
      }
      location.hash="";
      start();
      for (const [label,intent] of [["Repaso de un trabajo de Nohuska","quote"],["Nanoblading manual","appointment"],["Trabajo de otro centro","quote"],["Microblading manual","appointment"],["Corrección de un trabajo antiguo","quote"],["Micropigmentación de cejas","appointment"]]) {
        choice.selectedIndex = options.findIndex(o=>o.textContent.startsWith(label+" · "));
        listeners.change(); listeners.pageshow();
        for (const [i,link] of links.entries()) if (originals[i].dataset.contactIntent === "appointment") assert.equal(link.dataset.contactIntent,intent);
      }
      choice.selectedIndex=0; listeners.change(); assert.deepEqual(links,originals);
    }
    start();
    for (let i = 1; i < options.length; i++) {
      choice.selectedIndex = i;
      listeners.change();
      listeners.pageshow();
      for (const [index, link] of links.entries()) {
        const url = new URL(link.href);
        assert.equal(url.origin + url.pathname, "https://wa.me/34624011715");
        if (originals[index].textContent === "Consultar volumen y estilos" || originals[index].dataset.fixedConsultation !== undefined) {
          assert.deepEqual(link, originals[index], "Cada enlace fijo debe conservar su modalidad, mensaje y referencia");
          continue;
        }
        if (priced) {
          const [name, price] = options[i].textContent.split(" · ");
          const message = url.searchParams.get("text").split("\n\nReferencia: WEB-")[0];
          const original = originals[index];
          if (original.dataset.keepMessage !== undefined) {
            assert(pmuActions.includes(original.textContent) || (lifting && original.textContent === "Consultar mi caso"));
            assert.equal(link.textContent, original.textContent, "Preserve the action to send photographs or request a quote");
            assert.equal(message, new URL(original.href).searchParams.get("text").split("\n\nReferencia: WEB-")[0] + "\nMe interesa: " + name + ".");
          } else if (original.dataset.contactIntent === "appointment" && price === "A valorar") {
            assert.equal(link.dataset.contactIntent, "quote");
            assert.equal(link.textContent, "Pedir presupuesto tras valoración");
            assert.equal(message, "Hola Nohuska, quiero una valoración gratuita de " + name + " en Granollers para conocer mi presupuesto.");
          } else if (original.dataset.contactIntent === "appointment") {
            assert.equal(link.dataset.contactIntent, "appointment");
            assert.equal(link.textContent, price + " · Reservar " + name);
            const detail = options[i].dataset.bookingDetail;
            assert.equal(message, "Hola Nohuska, quiero solicitar cita para " + options[i].textContent + " en Granollers." + (detail ? " Incluye " + detail + ". ¿Qué disponibilidad hay?" : ""));
          } else if (original.dataset.contactIntent === "valuation") {
            assert.equal(link.dataset.contactIntent, "valuation");
            assert.equal(link.textContent, "Valoración gratuita: " + name);
            assert.equal(message, "Hola Nohuska, quiero una valoración gratuita de " + name + " en Granollers.");
          } else {
            assert.equal(link.textContent, "Consultar " + name + " por WhatsApp");
            assert.equal(message, "Hola Nohuska, quiero consultar " + name + " en Granollers.");
          }
        } else if (link.dataset.contactIntent === "valuation") {
          assert.ok(url.searchParams.get("text").includes("una valoración gratuita de " + options[i].textContent));
          assert.equal(link.textContent, "Valoración gratuita: " + options[i].textContent);
        } else if (link.dataset.contactIntent === "appointment") {
          assert.ok(url.searchParams.get("text").includes("solicitar cita para " + options[i].textContent));
          assert.equal(link.textContent, "Solicitar cita de " + options[i].textContent);
        } else {
          assert.ok(url.searchParams.get("text").includes(options[i].textContent));
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
const pmuHero=read("tratamientos/micropigmentacion-cejas-granollers.html").match(/<section class="hero">([\s\S]*?)<\/section>/)[1];
assert(pmuHero.includes('href="nohuska-natural-brow-granollers.html">¿Buscabas laminado') && pmuHero.indexOf('¿Buscabas laminado')<pmuHero.indexOf('https://wa.me/'),'Provide the no-pigment route before a visitor starts a PMU enquiry');
const lashGuide = read("guias/lifting-o-extensiones-pestanas.html");
const lashClosing = lashGuide.match(/<section class="cta">([\s\S]*?)<\/section>/)[1];
assert(lashClosing.includes('href="../tratamientos/extensiones-pestanas-granollers.html"') && lashClosing.includes('>Consultar lifting con o sin tinte</a>'), "Offer extensions without relabelling a lifting enquiry");
assert(new URL(lashGuide.match(/class="mobile-contact"[^>]*href="([^"]+)"/)[1]).searchParams.get("text").includes("volumen"));
const home = read("index.html");
const heroActions=home.match(/<div class="hero-actions">([\s\S]*?)<\/div>/)[1];
for(const [pos,intent] of [["portada","valoración gratuita"],["portada-cita","solicitar cita"]]){
  const href=heroActions.match(new RegExp('data-cta-position="'+pos+'" href="([^"]+)"'))[1], wa=new URL(href);
  assert.equal(wa.origin+wa.pathname,"https://wa.me/34624011715"); assert(wa.searchParams.get("text").includes(intent));
}
assert(!home.includes('Tu primera visita es gratuita') && home.includes('href="resultados.html"'));
const catalogue=JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i)[1]).hasOfferCatalog.itemListElement;
for(const [slug,words] of [["cejas-granollers",/diseño y depilación/i],["nohuska-natural-brow-granollers",/laminado de cejas sin tinte.*Natural Brow™ con tinte/i],["micropigmentacion-cejas-granollers",/microblading y nanoblading manuales/i],["lifting-pestanas-granollers",/lifting coreano.*tinte/i],["extensiones-pestanas-granollers",/pelo a pelo, volumen y Click Lash/i]]){
  const path="tratamientos/"+slug+".html",url="https://nohuska.com/"+path,entries=catalogue.filter(item=>item.url===url);
  assert.equal(entries.length,1);assert.match(entries[0].name,words);assert(home.includes('href="'+path+'"'));assert(read(path).includes('rel="canonical" href="'+url+'"'));
}
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
assert.match(lashes, /data-service="extensiones-pestanas" data-cta-position="alternativa-pestanas"/);
const maintenanceMessage=new URL(lashes.match(/data-cta-position="alternativa-pestanas"[^>]*href="([^"]+)"/)[1]).searchParams.get('text');
assert(/relleno/.test(maintenanceMessage) && /retirada/.test(maintenanceMessage),'Maintenance enquiries must not become a new first placement');
for(const [position,service,words] of [['cierre-guia-extensiones','extensiones-pestanas',/solicitar cita.*pelo a pelo o volumen/],['cierre-guia-lifting','lifting-pestanas',/consultar.*lifting.*con tinte o sin tinte/]]){
 const link=lashGuide.match(new RegExp('<a[^>]*data-cta-position="'+position+'"[^>]*>'))[0];
 assert(link.includes('data-service="'+service+'"') && link.includes('data-fixed-consultation'));
 assert.match(new URL(link.match(/href="([^"]+)"/)[1]).searchParams.get('text'),words);
}
const browPage = read("tratamientos/micropigmentacion-cejas-granollers.html");
const browHero = pmuHero.match(/data-cta-position="hero-micropigmentacion-cejas-granollers-valoracion"[^>]*href="([^"]+)"/)[1];
assert.match(new URL(browHero).searchParams.get("text"), /valoración gratuita de cejas.*microblading, nanoblading/);
assert.doesNotMatch(browPage, /sin disponibilidad confirmada|sin confirmar su disponibilidad|sin dar por confirmada|no confirma que se realicen/);
const browSchema = JSON.parse(browPage.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert(browPage.includes('data-fixed-consultation') && browPage.includes('Pedir valoración gratuita de nanoblading'));
for (const [key,price] of [["microblading","297"],["nanoblading","297"]]) {
  const service=browSchema["@graph"].find(n => n["@type"]==="Service" && n["@id"]?.endsWith("#"+key));
  assert(service && service.offers.price === price+".00" && service.offers.priceCurrency==="EUR" && service.description.includes("repaso no incluido"));
  assert(browPage.includes('id="'+key+'" data-consultation-value="opcion-'+key+'"><strong>') && browPage.includes(' '+price+' €</strong>'));
}
assert(read("tratamientos/micropigmentacion-granollers.html").includes('href="micropigmentacion-cejas-granollers.html#nanoblading"'));
for (const technique of ["Microblading manual", "Nanoblading manual"]) {
  assert.ok(browPage.includes('value="micropigmentacion-cejas">' + technique + ' · 297 €</option>'));
  assert.ok(browSchema["@graph"].find(node => node["@type"] === "Service").serviceType.includes(technique));
}
assert.ok(home.includes('data-service="tinte-cejas"'));
console.log(`PASS: ${contacts} treatment WhatsApp destinations with predefined context; specific modality tags and confirmed manual microblading/nanoblading offer.`);
