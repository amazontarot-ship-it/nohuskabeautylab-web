"use strict";
// Public identity regression checks. Does not access accounts or send reviews.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const internalFiles=require('node:child_process').execFileSync('git',['ls-files','outputs/','docs/','backups/','SEO-*.md','ANTES-DE-PUBLICAR.md'],{cwd:root,encoding:'utf8'}).trim();
assert.equal(internalFiles,'','Internal documents and backups must not be deployed from this public repository');
const directories=['','tratamientos','guias','pecas'];
const officialFeature='0x12a4c77ebd55dc5b:0x75c96dffffd853b8';
const officialPlace='ChIJW9xVvX7HpBIRuFPY__9tyXU';
const reviewUrl='https://g.page/r/CbhT2P__bcl1EBM/review';
const walk=(v,fn)=>{if(Array.isArray(v))v.forEach(x=>walk(x,fn));else if(v&&typeof v==='object'){fn(v);Object.values(v).forEach(x=>walk(x,fn));}};
let files=0,mapsLinks=0;
for(const dir of directories){for(const name of fs.readdirSync(path.join(root,dir))){if(!name.endsWith('.html'))continue;const file=path.join(dir,name),html=fs.readFileSync(path.join(root,file),'utf8');files++;
 assert(!/nuodermoestetica|Nuo Dermo|Plaça de la Porxada|931\s*41\s*48\s*60/i.test(html),file+' foreign business identity');
 // The owner has not authorized publishing a replacement opening schedule.
 assert(!/openingHoursSpecification|horario habitual.{0,20}lunes a sábado/i.test(html),file+' unapproved opening hours');
 for(const m of html.matchAll(/https?:\/\/[^"<>\s]+/g)){const url=m[0];if(/google\.com\/maps|maps\.google\.com/.test(url)){mapsLinks++;for(const id of url.matchAll(/0x[0-9a-f]+:0x[0-9a-f]+/gi))assert.equal(id[0],officialFeature,file+' Maps feature');const place=url.match(/(?:query_place_id|destination_place_id|placeid)=([^&]+)/i);if(place)assert.equal(place[1],officialPlace,file+' place ID');}}
 for(const block of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([^]*?)<\/script>/gi)){walk(JSON.parse(block[1]),v=>{const types=[].concat(v['@type']||[]);if(v['@id']==='https://nohuska.com/#business'){if(v.name)assert.equal(v.name,'Nohuska Beauty Lab');if(v.telephone)assert.equal(v.telephone,'+34624011715');}if(types.some(t=>['BeautySalon','HealthAndBeautyBusiness','LocalBusiness','Organization'].includes(t))){assert(!v.aggregateRating&&!v.review,file+' self-serving business review markup');}if(types.includes('PostalAddress')){assert.equal(v.streetAddress,'Avinguda Sant Esteve, 40',file+' street');assert.equal(v.addressLocality,'Granollers',file+' city');if(v.postalCode)assert.equal(v.postalCode,'08402',file+' postcode');}});}
}}
const home=fs.readFileSync(path.join(root,'index.html'),'utf8'),opina=fs.readFileSync(path.join(root,'opina.html'),'utf8');
const business=JSON.parse(home.match(/type="application\/ld\+json"[^>]*>([^]*?)<\/script>/i)[1]);assert.equal(business.identifier.value,officialPlace);assert(business.hasMap.includes(officialFeature));
assert.equal(business.address.postalCode,'08402');
assert(business.sameAs.some(u=>u.includes('maps.apple.com/place?place-id=IDBEF4062C5D5DD17')),'verified Apple identity');
assert(opina.includes('href="'+reviewUrl+'"'));assert(opina.includes('noindex,follow'));assert(opina.includes('No necesitas seguir un guion ni incluir palabras clave'));
assert(opina.includes('href="https://www.treatwell.es/establecimiento/nohuska-beauty-lab/"'));
assert(opina.includes('no un formulario directo de reseña'));
const brow=fs.readFileSync(path.join(root,'tratamientos/micropigmentacion-cejas-granollers.html'),'utf8');
const browGraph=JSON.parse(brow.match(/type="application\/ld\+json"[^>]*>([^]*?)<\/script>/i)[1])['@graph'];
const nano=browGraph.find(v=>v['@id']==='https://nohuska.com/tratamientos/micropigmentacion-cejas-granollers.html#nanoblading');
assert.equal(nano.serviceType,'Nanoblading manual');assert.equal(nano.offers.price,'297.00');assert.equal(nano.offers.priceCurrency,'EUR');
assert(brow.includes('id="nanoblading"'));
const priceAnswer=browGraph.find(v=>v['@type']==='FAQPage').mainEntity.find(v=>v.name==='¿Cuánto cuesta la micropigmentación de cejas?').acceptedAnswer.text;
const visiblePrice=brow.match(/<summary>¿Cuánto cuesta la micropigmentación de cejas\?<\/summary><p>([^]*?)<\/p>/)[1].replace(/<[^>]+>/g,'');
assert.equal(visiblePrice,priceAnswer,'Visible and structured brow prices must agree');
assert(priceAnswer.includes('El microblading manual tiene una tarifa de referencia de 350 €. El nanoblading manual tiene una tarifa de referencia de 297 €'));
assert(priceAnswer.includes('Ninguno de los dos tratamientos incluye retoque'));
const menu=fs.readFileSync(path.join(root,'tratamientos/guia-tratamientos-nohuska.html'),'utf8');
assert(menu.includes('Nanoblading: 297 €, retoque no incluido'));
const llms=fs.readFileSync(path.join(root,'llms.txt'),'utf8');
assert(llms.includes('Microblading 350 € y nanoblading 297 € de referencia (retoque no incluido)'));
const barcelona=fs.readFileSync(path.join(root,'tratamientos/micropigmentacion-cejas-barcelona.html'),'utf8');
const barcelonaGraph=JSON.parse(barcelona.match(/type="application\/ld\+json"[^>]*>([^]*?)<\/script>/i)[1])['@graph'];
const offers=barcelonaGraph.find(v=>v['@type']==='Service').offers;
for(const [name,price] of [['Nanoblading manual','297'],['Microblading manual','350']]){const offer=offers.find(v=>v.name===name);assert.equal(offer.price,price);assert.equal(offer.priceCurrency,'EUR');assert(offer.description.includes('Retoque no incluido'));}
const barcelonaPrice=barcelonaGraph.find(v=>v['@type']==='FAQPage').mainEntity.find(v=>v.name==='¿Cuánto cuesta el nanoblading?').acceptedAnswer.text;
assert.equal(barcelona.match(/<summary>¿Cuánto cuesta el nanoblading\?<\/summary><p>([^]*?)<\/p>/)[1],barcelonaPrice,'Visible and structured Barcelona prices must agree');
assert(barcelonaPrice.includes('nanoblading manual tiene una tarifa de referencia de 297 €; el microblading manual, de 350 €'));
assert(barcelonaPrice.includes('no incluyen retoque'));
assert(barcelona.includes('content="Microblading 350 € y nanoblading 297 € de referencia para Barcelona'));
assert(menu.includes('285 €')&&menu.includes('pelo a pelo, 60 €'));
assert(home.includes('no reseñas de Google ni una puntuación agregada'));assert(home.includes('href="opina.html"'));assert(home.includes('Click Lash</span>'));assert(home.includes('Extensiones de pestañas pelo a pelo</span>'));
console.log(`PASS: ${files} public HTML; ${mapsLinks} Maps references; official place ID, address and phone; no foreign identity or self-serving review schema; direct review route and active eyelash choices.`);
