"use strict";

// Behavioral checks with a minimal DOM; no network, Analytics request or message is sent.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const script = fs.readFileSync(path.join(__dirname, "../assets/nohuska-conversiones.js"), "utf8");

function createPage(options = {}) {
  const elements = [];
  class Element {
    constructor(tag, href) {
      this.tagName = tag;
      this.href = href;
      this.dataset = {};
      this.listeners = {};
      this.children = [];
      this.textContent = "Consultar disponibilidad";
      elements.push(this);
    }
    setAttribute(name, value) { this[name] = value; }
    getAttribute(name) { return this[name] || null; }
    appendChild(child) { this.children.push(child); }
    addEventListener(name, listener) { (this.listeners[name] ||= []).push(listener); }
    click() { (this.listeners.click || []).forEach(listener => listener({})); }
    remove() { this.removed = true; }
    querySelectorAll() {
      if (this.id !== "nohuska-cookie-banner") return [];
      if (!this.choices) this.choices = ["denied", "granted"].map(choice => {
        const button = new Element("button");
        button.dataset.cookieChoice = choice;
        return button;
      });
      return this.choices;
    }
  }
  const wa = new Element("a", "https://wa.me/34624011715?text=" + encodeURIComponent(options.message || "Hola, quiero información de lifting."));
  const phone = new Element("a", "tel:+34624011715");
  const booksy = new Element("a", "https://booksy.com/es-es/192632_nohuska-beauty-lab");
  const maps = new Element("a", "https://www.google.com/maps/place/Nohuska");
  const storage = (initial, blocked) => {
    const values = { ...initial };
    return {
      values,
      reads: 0,
      writes: 0,
      getItem(key) { this.reads++; if (blocked) throw new Error("Storage blocked"); return values[key] || null; },
      setItem(key, value) { this.writes++; if (blocked) throw new Error("Storage blocked"); values[key] = value; },
      removeItem(key) { if (blocked) throw new Error("Storage blocked"); delete values[key]; }
    };
  };
  const location = new URL(options.url || "https://nohuska.com/tratamientos/lifting-pestanas-granollers.html");
  const document = {
    head: new Element("head"),
    body: new Element("body"),
    referrer: options.referrer || "",
    cookie: "",
    createElement(tag) { return new Element(tag); },
    getElementById(id) { return elements.find(element => element.id === id && !element.removed) || null; },
    querySelectorAll(selector) {
      if (selector.includes('a[href^="https://wa.me/')) return [wa];
      if (selector.includes('a[href^="tel:')) return [phone];
      if (selector.includes('a[href*="booksy.com')) return [booksy];
      if (selector.includes("maps")) return [maps];
      return [];
    }
  };
  const window = {
    location,
    localStorage: storage({ nohuska_analytics_consent: options.consent }, options.blockLocal),
    sessionStorage: storage(options.session, options.blockSession)
  };
  const context = vm.createContext({ window, document, URL, URLSearchParams, Date });
  const run = () => vm.runInContext(script, context);
  run();
  return {
    window, document, wa, phone, booksy, maps, run,
    events: () => (window.dataLayer || []).filter(entry => entry[0] === "event"),
    choose(value) {
      const banner = document.getElementById("nohuska-cookie-banner");
      assert.ok(banner, "Consent dialog must exist");
      banner.querySelectorAll().find(button => button.dataset.cookieChoice === value).click();
    },
    reopen() { elements.find(element => element.className === "nohuska-cookie-settings").click(); },
    scripts: () => document.head.children.filter(element => element.tagName === "script")
  };
}

const granted = createPage({
  consent: "granted",
  url: "https://nohuska.com/tratamientos/lifting-pestanas-granollers.html?utm_source=google&utm_medium=organic&utm_campaign=perfil_empresa_granollers"
});
[granted.wa, granted.phone, granted.booksy, granted.maps].forEach(link => link.click());
assert.deepEqual(Array.from(granted.events(), event => event[1]), ["click_whatsapp", "click_call", "click_booksy", "maps_click"]);
assert.equal(granted.events()[0][2].source, "google-organic");
assert.equal(granted.events()[0][2].campaign, "perfil_empresa_granollers");
const campaignConfig = granted.window.dataLayer.find(entry => entry[0] === "config")[2];
assert.equal(campaignConfig.campaign_source, "google");
assert.equal(campaignConfig.campaign_medium, "organic");
assert.equal(campaignConfig.campaign_name, "perfil_empresa_granollers");
assert.equal(granted.events()[0][2].service, "lifting-pestanas");
assert.equal(granted.events()[0][2].page_path, "/tratamientos/lifting-pestanas-granollers.html");
assert.equal(granted.scripts().length, 1);
assert.equal(new URL(granted.wa.href).pathname, "/34624011715");
assert.match(new URL(granted.wa.href).searchParams.get("text"), /Referencia: WEB-LIFTING-PESTANAS-GRANOLLERS-GOOGLE-ORGANIC-PERFIL_EMPRESA_GRANOLLERS/);
assert.equal((granted.window.dataLayer || []).filter(entry => entry.event).length, 0, "No second dataLayer event alongside gtag");
granted.run();
granted.wa.click();
assert.equal(granted.events().length, 5, "Loading script twice must not attach duplicate handlers");
assert.equal(granted.scripts().length, 1);

const denied = createPage({ consent: "denied" });
[denied.wa, denied.phone, denied.booksy, denied.maps].forEach(link => link.click());
assert.equal(denied.events().length, 0);
assert.equal(denied.scripts().length, 0);
assert.equal(denied.window.sessionStorage.reads, 0);
assert.equal(denied.window.sessionStorage.writes, 0);
assert.match(new URL(denied.wa.href).searchParams.get("text"), /DIRECTO-O-DESCONOCIDO/);

const blocked = createPage({ blockLocal: true, blockSession: true, referrer: "https://www.google.es/search?q=lifting" });
assert.equal(blocked.wa.listeners.click.length, 1, "Blocked storage must not prevent contact handlers");
blocked.wa.click();
assert.equal(blocked.events().length, 0);
blocked.choose("granted");
blocked.wa.click();
assert.equal(blocked.events().length, 1, "Consent works for this visit even if saving it fails");
assert.equal(blocked.events()[0][2].source, "google-organico");
blocked.reopen();
blocked.choose("denied");
blocked.wa.click();
assert.equal(blocked.events().length, 1, "Revoking consent stops subsequent contact events");
assert.equal(blocked.window["ga-disable-G-EV7CGL8W75"], true);
assert.equal(new URL(blocked.wa.href).hostname, "wa.me");

const privateUtm = createPage({
  consent: "granted",
  url: "https://nohuska.com/?utm_source=ana%40example.com&utm_campaign=34666777888&email=ana%40example.com",
  referrer: "https://instagram.com/direct/ana@example.com"
});
privateUtm.wa.click();
const transmitted = JSON.stringify(privateUtm.window.dataLayer);
assert.doesNotMatch(transmitted, /ana@|34666777888|example\.com|email=/);
assert.equal(privateUtm.events()[0][2].source, "campana-otra");
assert.equal(privateUtm.events()[0][2].campaign, "campana-otra");
const config = privateUtm.window.dataLayer.find(entry => entry[0] === "config");
assert.equal(config[2].page_location, "https://nohuska.com/");
assert.equal(config[2].page_referrer, "https://instagram.com");

const continued = createPage({ consent: "granted", referrer: "https://nohuska.com/", session: { nohuska_source: "instagram", nohuska_campaign: "perfil_empresa_granollers" } });
continued.wa.click();
assert.equal(continued.events()[0][2].source, "instagram");
assert.equal(continued.events()[0][2].campaign, "perfil_empresa_granollers");
const internalUnknown = createPage({ consent: "granted", referrer: "https://nohuska.com/" });
internalUnknown.wa.click();
assert.equal(internalUnknown.events()[0][2].source, "directo-o-desconocido");
const spoofed = createPage({ consent: "granted", referrer: "https://google.es.attacker.example/?instagram.com" });
spoofed.wa.click();
assert.equal(spoofed.events()[0][2].source, "referencia-web");
const existingReference = createPage({ message: "Hola\n\nReferencia: WEB-CAPILAR-HERO", consent: "granted" });
assert.equal((new URL(existingReference.wa.href).searchParams.get("text").match(/Referencia:/g) || []).length, 1);
const qa = createPage({ consent: "granted", url: "https://nohuska.com/?utm_source=internal-test&utm_medium=qa&utm_campaign=whatsapp-qa-20261022" });
qa.wa.click();
assert.equal(qa.events()[0][2].source, "internal-test-qa");
assert.equal(qa.events()[0][2].campaign, "whatsapp-qa-20261022");
assert.equal(qa.events()[0][2].debug_mode, true);
assert.equal(qa.events()[0][2].test_event, true);
assert.equal(qa.window.dataLayer.find(entry => entry[0] === "config")[2].debug_mode, true);
for (const page of [granted, denied, blocked, privateUtm, continued, internalUnknown, spoofed, existingReference]) {
  assert.ok(page.events().every(event => !["generate_lead", "nohuska_lead"].includes(event[1])));
}
console.log("PASS: contact events, one event per click, consent/revocation, blocked storage, honest attribution, private parameters and working WhatsApp references.");
