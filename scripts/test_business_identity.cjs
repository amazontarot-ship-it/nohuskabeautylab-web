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
assert.equal([...barcelona.matchAll(/<img\b[^>]*src="\.\.\/assets\/nanoblading-cejas-antes-despues-nohuska\.jpg"/g)].length,1,'Barcelona must show its existing case once, not duplicate it');
assert(barcelona.indexOf('src="../assets/nanoblading-cejas-antes-despues-nohuska.jpg"')<barcelona.indexOf('<div class="facts">'),'Barcelona must show the real case in the hero');
assert(barcelona.includes('id="caso-nanoblading"'),'Keep the existing case-context fragment');
const regionalBrows=fs.readFileSync(path.join(root,'tratamientos/cejas-valles-oriental.html'),'utf8');
assert(regionalBrows.includes('href="nohuska-natural-brow-granollers.html">Natural Brow: diseño, laminado y tinte'));
assert(regionalBrows.includes('55 € · aproximadamente 1 hora')&&regionalBrows.includes('Repaso no incluido'));
const generalBrows=fs.readFileSync(path.join(root,'tratamientos/cejas-granollers.html'),'utf8');
assert(!generalBrows.includes('href="nohuska-natural-brow-granollers.html#laminado-tinte"'),'Enter the service at its offer and evidence, rather than skipping them');
const regionalLashes=fs.readFileSync(path.join(root,'tratamientos/pestanas-valles-oriental.html'),'utf8');
const regionalLashGraph=JSON.parse(regionalLashes.match(/type="application\/ld\+json"[^>]*>([^]*?)<\/script>/i)[1])['@graph'];
const regionalTint=regionalLashGraph.find(v=>v['@type']==='FAQPage').mainEntity.find(v=>v.name==='¿El lifting coreano incluye tinte?').acceptedAnswer.text;
assert.equal(regionalLashes.match(/<summary>¿El lifting coreano incluye tinte\?<\/summary><p>([^]*?)<\/p>/)[1],regionalTint,'Regional visible and structured tint inclusion must agree');
assert(regionalTint.includes('incluye tinte vegano por 55 €'));
assert(regionalLashes.includes('href="../resultados.html#lifting-coreano"'));
for(const file of ['micropigmentacion-cejas-barcelona.html','micropigmentacion-capilar-barcelona.html']){
 const html=fs.readFileSync(path.join(root,'tratamientos',file),'utf8');
 const graph=JSON.parse(html.match(/type="application\/ld\+json"[^>]*>([^]*?)<\/script>/i)[1])['@graph'];
 const answer=graph.find(v=>v['@type']==='FAQPage').mainEntity.find(v=>v.name==='¿Cómo llego desde Barcelona?').acceptedAnswer.text;
 assert.equal(html.match(/<summary>¿Cómo llego desde Barcelona\?<\/summary><p>([^]*?)<\/p>/)[1],answer,file+' visible and structured travel instructions');
 assert(answer.includes('La R8 no pasa por Barcelona ciudad')&&answer.includes('verifica horarios y alteraciones'));
}
for(const file of ['micropigmentacion-cejas-barcelona.html','micropigmentacion-capilar-barcelona.html','micropigmentacion-capilar-granollers.html','micropigmentacion-barcelona.html']){
 const html=fs.readFileSync(path.join(root,'tratamientos',file),'utf8');
 assert(!html.includes('R2 Nord o R8 hasta'),file+' misleading direct Barcelona route');
 assert(html.includes('https://rodalies.gencat.cat/ca/alteracions_del_servei'),file+' official travel updates');
}
for(const file of ['micropigmentacion-cejas-barcelona.html','cejas-valles-oriental.html','pestanas-valles-oriental.html','limpieza-facial-valles-oriental.html'])assert(menu.includes('href="'+file+'"'),'Treatment guide must link to '+file);
const comarca=fs.readFileSync(path.join(root,'tratamientos/micropigmentacion-valles-oriental.html'),'utf8');
assert(comarca.includes('href="micropigmentacion-cejas-granollers.html"'));
assert(!comarca.match(/<meta name="description"[^>]+>/)[0].includes('Natural Brow'),'Natural Brow is not micropigmentation');
assert(menu.includes('285 €')&&menu.includes('pelo a pelo, 55 €')&&menu.includes('Click Lash, 35 €, cita de unos 30 minutos'));
assert(llms.includes('pelo a pelo 55 €, volumen 60 €')&&llms.includes('relleno 45 €, retirada 15 €, Click Lash 35 €'));
const extensions=fs.readFileSync(path.join(root,'tratamientos/extensiones-pestanas-granollers.html'),'utf8');
const extensionsGraph=JSON.parse(extensions.match(/type="application\/ld\+json"[^>]*>([^]*?)<\/script>/i)[1])['@graph'];
for(const [fragment,price] of [['pelo-a-pelo','55.00'],['click-lash','35.00']]){const service=extensionsGraph.find(v=>(v['@id']||'').endsWith('#'+fragment));assert.equal(service.offers.price,price);assert.equal(service.offers.priceCurrency,'EUR');}
const extensionsPrice=extensionsGraph.find(v=>v['@type']==='FAQPage').mainEntity.find(v=>v.name==='¿Cuánto cuestan las extensiones y cuánto dura la cita?').acceptedAnswer.text;
assert.equal(extensions.match(/<summary>¿Cuánto cuestan las extensiones y cuánto dura la cita\?<\/summary><p>([^]*?)<\/p>/)[1].replace(/<[^>]+>/g,''),extensionsPrice,'Visible and structured extension prices must agree');
assert(extensionsPrice.includes('Pelo a pelo: 55 €. Volumen (cualquier estilo): 60 €. Relleno: 45 €. Retirada: 15 €. Click Lash: 35 €'));
assert(extensionsPrice.includes('cita de unos 30 minutos'));
const lashes=fs.readFileSync(path.join(root,'tratamientos/pestanas-granollers.html'),'utf8');
const lashesGraph=JSON.parse(lashes.match(/type="application\/ld\+json"[^>]*>([^]*?)<\/script>/i)[1])['@graph'];
const clickAnswer=lashesGraph.find(v=>v['@type']==='FAQPage').mainEntity.find(v=>v.name==='¿Qué es Click Lash?').acceptedAnswer.text;
assert.equal(lashes.match(/<summary>¿Qué es Click Lash\?<\/summary><p>([^]*?)<\/p>/)[1],clickAnswer,'Visible and structured Click Lash price must agree');
assert(clickAnswer.includes('La tarifa es de 35 €.')&&clickAnswer.includes('30 minutos'));
assert(home.includes('no reseñas de Google ni una puntuación agregada'));assert(home.includes('href="opina.html"'));assert(home.includes('Click Lash</span>'));assert(home.includes('Extensiones de pestañas pelo a pelo</span>'));
const results=fs.readFileSync(path.join(root,'resultados.html'),'utf8');
const resultGraph=JSON.parse(results.match(/type="application\/ld\+json"[^>]*>([^]*?)<\/script>/i)[1])['@graph'];
const caseList=resultGraph.find(v=>v['@type']==='ItemList');
assert.equal(caseList.numberOfItems,caseList.itemListElement.length,'Case count must match structured entries');
assert.equal(caseList.numberOfItems,[...results.matchAll(/<figure\b[^>]*\bid="/g)].length,'Every listed case must have a visible figure');
for(const item of caseList.itemListElement)assert(results.includes('id="'+new URL(item.url).hash.slice(1)+'"'),'Case fragment must exist');
assert(results.includes('href="tratamientos/micropigmentacion-cejas-granollers.html#resultado-nanoblading"'));
assert(brow.includes('href="../resultados.html#nanoblading"'),'Existing brow case must connect to the collection');
const extensionOptions=extensionsGraph.find(v=>v['@type']==='FAQPage').mainEntity.find(v=>v.name==='¿Qué opciones de pestañas postizas ofrecéis en Granollers?').acceptedAnswer.text;
assert.equal(extensions.match(/<summary>¿Qué opciones de pestañas postizas ofrecéis en Granollers\?<\/summary><p>([^]*?)<\/p>/)[1],extensionOptions,'Visible and structured extension choices must agree');
assert(!extensions.includes('Dos opciones para añadir presencia'),'Three active extension services must not be introduced as two');
for(const file of ['nohuska-natural-brow-granollers.html','lifting-pestanas-granollers.html','limpieza-facial-coreana-granollers.html']){
 const html=fs.readFileSync(path.join(root,'tratamientos',file),'utf8');
 assert(/\d+ reseñas del centro/.test(html),file+' must label the rating as business-wide');
 assert(/<time datetime="\d{4}-\d{2}-\d{2}">/.test(html),file+' must date the Google snapshot');
 assert(!/"@type"\s*:\s*"(?:Review|AggregateRating)"/.test(html),file+' must not turn its own reviews into rich-result markup');
}
console.log(`PASS: ${files} public HTML; ${mapsLinks} Maps references; official place ID, address and phone; no foreign identity or self-serving review schema; direct review route and active eyelash choices.`);
