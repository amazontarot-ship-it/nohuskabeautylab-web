"use strict";
// Public identity regression checks. Does not access accounts or send reviews.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const directories=['','tratamientos','guias','pecas'];
const officialFeature='0x12a4c77ebd55dc5b:0x75c96dffffd853b8';
const officialPlace='ChIJW9xVvX7HpBIRuFPY__9tyXU';
const reviewUrl='https://g.page/r/CbhT2P__bcl1EBM/review';
const walk=(v,fn)=>{if(Array.isArray(v))v.forEach(x=>walk(x,fn));else if(v&&typeof v==='object'){fn(v);Object.values(v).forEach(x=>walk(x,fn));}};
let files=0,mapsLinks=0;
for(const dir of directories){for(const name of fs.readdirSync(path.join(root,dir))){if(!name.endsWith('.html'))continue;const file=path.join(dir,name),html=fs.readFileSync(path.join(root,file),'utf8');files++;
 assert(!/nuodermoestetica|Nuo Dermo|Plaça de la Porxada|931\s*41\s*48\s*60/i.test(html),file+' foreign business identity');
 for(const m of html.matchAll(/https?:\/\/[^"<>\s]+/g)){const url=m[0];if(/google\.com\/maps|maps\.google\.com/.test(url)){mapsLinks++;for(const id of url.matchAll(/0x[0-9a-f]+:0x[0-9a-f]+/gi))assert.equal(id[0],officialFeature,file+' Maps feature');const place=url.match(/(?:query_place_id|placeid)=([^&]+)/i);if(place)assert.equal(place[1],officialPlace,file+' place ID');}}
 for(const block of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([^]*?)<\/script>/gi)){walk(JSON.parse(block[1]),v=>{const types=[].concat(v['@type']||[]);if(v['@id']==='https://nohuska.com/#business'){if(v.name)assert.equal(v.name,'Nohuska Beauty Lab');if(v.telephone)assert.equal(v.telephone,'+34624011715');}if(types.some(t=>['BeautySalon','HealthAndBeautyBusiness','LocalBusiness','Organization'].includes(t))){assert(!v.aggregateRating&&!v.review,file+' self-serving business review markup');}if(types.includes('PostalAddress')){assert.equal(v.streetAddress,'Avinguda Sant Esteve, 40',file+' street');assert.equal(v.addressLocality,'Granollers',file+' city');if(v.postalCode)assert.equal(v.postalCode,'08402',file+' postcode');}});}
}}
const home=fs.readFileSync(path.join(root,'index.html'),'utf8'),opina=fs.readFileSync(path.join(root,'opina.html'),'utf8');
const business=JSON.parse(home.match(/type="application\/ld\+json"[^>]*>([^]*?)<\/script>/i)[1]);assert.equal(business.identifier.value,officialPlace);assert(business.hasMap.includes(officialFeature));
assert.equal(business.address.postalCode,'08402');
assert(business.sameAs.some(u=>u.includes('maps.apple.com/place?place-id=IDBEF4062C5D5DD17')),'verified Apple identity');
assert(opina.includes('href="'+reviewUrl+'"'));assert(opina.includes('noindex,follow'));assert(opina.includes('No necesitas seguir un guion ni incluir palabras clave'));
assert(home.includes('no reseñas de Google ni una puntuación agregada'));assert(home.includes('href="opina.html"'));assert(home.includes('Click Lash</span>'));assert(home.includes('Extensiones de pestañas pelo a pelo</span>'));
console.log(`PASS: ${files} public HTML; ${mapsLinks} Maps references; official place ID, address and phone; no foreign identity or self-serving review schema; direct review route and active eyelash choices.`);
