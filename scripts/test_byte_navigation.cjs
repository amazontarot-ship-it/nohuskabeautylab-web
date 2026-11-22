"use strict";

// Local markup regression checks; no external contact or analytics request.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const home = read("index.html");
assert.match(home, /id="firmas"/);
assert.match(home, /id="firmas"><span id="estrellas"/);
const guide = read("guias/lifting-o-extensiones-pestanas.html");
const mobileGuide = guide.match(/<a\b[^>]*class="mobile-contact"[^>]*>/)[0];
assert.match(mobileGuide, /data-service="pestanas"/);
const guideMessage = new URL(mobileGuide.match(/href="([^"]+)"/)[1]).searchParams.get("text");
for (const modality of ["lifting", "Click Lash", "extensiones pelo a pelo"]) assert.ok(guideMessage.includes(modality));
// Resolve every local fragment link in the affected pages against the actual file.
for (const file of ["guias/lifting-o-extensiones-pestanas.html", "tratamientos/facial-contouring-granollers.html", "tratamientos/micropigmentacion-blush-granollers.html", "tratamientos/pestanas-granollers.html", "tratamientos/extensiones-pestanas-granollers.html", "tratamientos/lifting-pestanas-granollers.html", "tratamientos/nohuska-natural-brow-granollers.html", "tratamientos/cejas-valles-oriental.html", "tratamientos/micropigmentacion-cejas-barcelona.html", "tratamientos/guia-tratamientos-nohuska.html", "opina.html", "tratamientos/nohuska-men-granollers.html", "tratamientos/laminado-bigote-granollers.html", "tratamientos/cejas-granollers.html", "tratamientos/micropigmentacion-cejas-granollers.html", "tratamientos/limpieza-facial-coreana-granollers.html", "tratamientos/micropigmentacion-capilar-granollers.html"]) {
  for (const match of read(file).matchAll(/href="([^":]*#[^"]+)"/g)) {
    const [target, fragment] = match[1].split("#");
    const resolved = target ? path.posix.normalize(path.posix.join(path.posix.dirname(file), target)) : file;
    assert.ok(read(resolved).includes('id="' + fragment + '"'), file + ": " + match[1]);
  }
}
for (const file of fs.readdirSync(path.join(root, "tratamientos")).filter(file => file.endsWith(".html"))) {
  assert.doesNotMatch(read("tratamientos/" + file), /href="[^"]*#estrellas"/, file);
}
for (const file of ["facial-contouring-granollers.html", "micropigmentacion-blush-granollers.html"]) {
  assert.match(read("tratamientos/" + file), /href="\.\.\/index\.html#firmas"/);
}
for (const [file, expected] of [
  ["pestanas-granollers.html", /pestañas/],
  ["lifting-pestanas-granollers.html", /valoración gratuita.*lifting de pestañas.*con tinte o sin tinte/],
  ["extensiones-pestanas-granollers.html", /extensiones pelo a pelo, volumen y Click Lash/]
]) {
  const html = read("tratamientos/" + file);
  assert.match(html, /body class="has-mobile-contact/);
  const mobile = html.match(/<a\b[^>]*class="mobile-contact"[^>]*>/);
  assert.ok(mobile, file);
  const url = new URL(mobile[0].match(/href="([^"]+)"/)[1]);
  assert.equal(url.origin + url.pathname, "https://wa.me/34624011715");
  assert.match(url.searchParams.get("text"), expected, file);
  assert.doesNotMatch(url.searchParams.get("text"), /encontrado en Google/);
}
const extensionContactTags = [...read("tratamientos/extensiones-pestanas-granollers.html").matchAll(/<a\b[^>]*data-service="extensiones-pestanas"[^>]*href="(https:\/\/wa\.me\/[^\"]+)"[^>]*>/g)];
assert.ok(extensionContactTags.length > 0);
for (const tag of extensionContactTags) {
  const url = new URL(tag[1]);
  assert.equal(url.origin + url.pathname, "https://wa.me/34624011715");
  if(tag[0].includes("data-fixed-consultation")){
    const maintenance=tag[0].match(/data-cta-position="comparativa-(relleno|retirada)"/);
    const color=tag[0].match(/data-cta-position="color-(marrones|granates|otros)"/);
    const message=url.searchParams.get("text");
    assert(maintenance || color, "Every fixed consultation must have an explicit tested purpose");
    if(maintenance) assert(message.includes(maintenance[1]) && message.includes("solicitar cita"));
    else {
      assert(message.includes(color[1] === "otros" ? "tonos disponibles" : color[1]));
      assert(message.includes("consultar") && message.includes("precio") && !/\d+\s*€/.test(message), "Colors require a quote, not an assumed first-placement fee");
    }
  }else for (const modality of ["pelo a pelo", "volumen", "Click Lash"]) assert.ok(url.searchParams.get("text").includes(modality), "Generic extensions contact must retain all three choices");
}
for(const action of ["relleno","retirada"])assert(extensionContactTags.some(tag=>tag[0].includes('data-cta-position="comparativa-'+action+'"') && tag[0].includes("data-fixed-consultation")));
for(const color of ["marrones","granates","otros"]) assert.equal(extensionContactTags.filter(tag=>tag[0].includes('data-cta-position="color-'+color+'"') && tag[0].includes("data-fixed-consultation")).length,1);
assert.doesNotMatch(read("tratamientos/lifting-pestanas-granollers.html"), /data-service="lifting-coreano"/);
assert.match(read("tratamientos/lifting-pestanas-granollers.html"), /data-service="lifting-pestanas"/);
assert.match(read("tratamientos/seo-treatment.css"), /@media\(max-width:760px\).*?\.mobile-contact\{display:flex/s);
assert.match(read("tratamientos/seo-treatment.css"), /html\{scroll-padding-top:100px\}/);
// The cookie notice must clear the contact bar throughout its 760px breakpoint.
assert.ok(/@media\(max-width:760px\)\{\.nohuska-cookie-banner\{[^}]*bottom:78px/.test(read("assets/nohuska-conversiones.js")), "Cookie notice must clear the contact bar at widths up to 760px");
console.log("PASS: firmas destinations, mobile contact routes/messages, responsive rule and lifting labels (static markup).");

// Las barras fijas no deben competir con los contactos ni los campos del contenido.
for (const file of ["lifting-pestanas-granollers.html", "nohuska-natural-brow-granollers.html", "cejas-granollers.html", "micropigmentacion-cejas-granollers.html", "limpieza-facial-coreana-granollers.html", "micropigmentacion-capilar-granollers.html", "centro-estetica-granollers.html"]) {
const lifting=read("tratamientos/" + file);
assert.match(lifting, /class="mobile-contact" hidden/);
assert.match(lifting, /\.mobile-contact\[hidden\]\{display:none\}/);
assert.match(lifting, /footer \.nohuska-cookie-settings\{position:static/);
const visibility=lifting.match(/<script data-mobile-contact-visibility>([\s\S]*?)<\/script>/)[1];
if (file.startsWith("nohuska-natural")) assert(visibility.includes("main input"));
if (file === "cejas-granollers.html") assert(visibility.includes('[aria-labelledby="reserva-cejas-online"]'), 'Observe the final contact section outside main too');
const floating={hidden:true},preferences={},contacts=[{},{}],observed=[];
let callback,moved=false;
function Observer(fn,options){callback=fn;assert.equal(options.rootMargin,"-70px 0px 0px");this.observe=node=>observed.push(node);}
require("node:vm").runInNewContext(visibility,{
 window:{IntersectionObserver:Observer},IntersectionObserver:Observer,
 document:{addEventListener:(_,fn)=>fn(),querySelector:s=>s===".mobile-contact"?floating:s===".nohuska-cookie-settings"?preferences:{appendChild:n=>{assert.equal(n,preferences);moved=true;}},querySelectorAll:()=>contacts}
});
assert(moved);assert.deepEqual(observed,[...contacts,preferences]);
callback([{target:contacts[0],isIntersecting:true}]);assert(floating.hidden);
callback([{target:contacts[1],isIntersecting:true},{target:contacts[0],isIntersecting:false}]);assert(floating.hidden);
callback([{target:contacts[1],isIntersecting:false}]);assert(!floating.hidden);
callback([{target:preferences,isIntersecting:true}]);assert(floating.hidden);
}
console.log("PASS: seven treatment floating contacts yield to visible contacts, selection controls and cookie preferences.");

const menLayout=read('tratamientos/nohuska-men-granollers.html');
assert(!menLayout.match(/<div\b[^>]*id="laminado-masculino"[^>]*>/)[0].includes('data-consultation-value'),'The general male lamination section must not assume tint or no tint');
assert.match(menLayout,/footer \.nohuska-cookie-settings\{position:static/);
const menCookieScript=[...menLayout.matchAll(/<script>([\s\S]*?)<\/script>/g)].find(m=>m[1].includes('nohuska-cookie-settings'))[1];
for(const present of [true,false]){
 const existing=present?{}:null;let moved=null;
 require('node:vm').runInNewContext(menCookieScript,{document:{addEventListener:(event,fn)=>{assert.equal(event,'DOMContentLoaded');fn();},querySelector:selector=>selector==='.nohuska-cookie-settings'?existing:{appendChild:node=>{moved=node;}}}});
 assert.equal(moved,existing,'Move the existing cookie control, without cloning it or failing when absent');
}

// Dedicated men's enquiries must survive the general page selectors unchanged.
for(const [file,anchor,services,count] of [
 ["cejas-granollers.html","cejas-masculinas",["cejas"],2],
 ["nohuska-natural-brow-granollers.html","laminado-masculino",["laminado-cejas","nohuska-brow"],2],
 ["micropigmentacion-cejas-granollers.html","cejas-masculinas",["micropigmentacion-cejas"],4],
 ["limpieza-facial-coreana-granollers.html","facial-hombre",["limpieza-facial"],2],
 ["micropigmentacion-capilar-granollers.html","capilar-masculina",["micropigmentacion-capilar"],4]
]){
 const html=read("tratamientos/"+file),section=html.match(new RegExp('<section[^>]*id="'+anchor+'"[^>]*>([\\s\\S]*?)</section>'))[1];
 assert(section.includes('href="nohuska-men-granollers.html"'),file+': link to the common Men entry');
 const contacts=[...section.matchAll(/<a\b[^>]*href="(https:\/\/wa\.me\/[^\"]+)"[^>]*>/g)];
 assert.equal(contacts.length,count,file+' male contact routes');
 for(const match of contacts){
  const tag=match[0],url=new URL(match[1]),message=url.searchParams.get('text');
  assert.equal(url.origin+url.pathname,'https://wa.me/34624011715');
  assert(services.includes(tag.match(/data-service="([^"]+)"/)[1]));
  assert(tag.includes('data-fixed-consultation'),'Male fixed routes must not become another selector service');
  assert.match(message,/para hombre|masculin/i);
  const intent=tag.match(/data-contact-intent="([^"]+)"/)[1];
  if(intent==='appointment') assert.match(message,/solicitar cita/);
  else {assert(['valuation','consultation'].includes(intent));assert.doesNotMatch(message,/solicitar cita/);if(intent==='valuation')assert.match(message,/valoración gratuita/);}
 }
}
for(const [file,service,word] of [['nohuska-men-granollers.html','nohuska-men',/masculin|hombre/],['laminado-bigote-granollers.html','laminado-bigote',/bigote/]]){
 const html=read('tratamientos/'+file);
 for(const tag of html.matchAll(/<a\b[^>]*href="(https:\/\/wa\.me\/[^\"]+|tel:[^\"]+)"[^>]*>/g)){
  const href=tag[1];if(href.startsWith('tel:')){assert.equal(href,'tel:+34624011715');continue;}
  const url=new URL(href),message=url.searchParams.get('text');assert.equal(url.origin+url.pathname,'https://wa.me/34624011715');assert.match(message,word);
  if(!tag[0].includes('data-fixed-consultation'))assert(tag[0].includes('data-service="'+service+'"'));
  const intent=tag[0].match(/data-contact-intent="([^"]+)"/)[1];assert(['appointment','valuation','consultation'].includes(intent));
  if(intent==='appointment')assert.match(message,/solicitar cita/);else assert.doesNotMatch(message,/solicitar cita/);
 }
}
console.log('PASS: Men local fragments, 14 fixed male enquiries, canonical service codes, phone and consultation/appointment intent.');
