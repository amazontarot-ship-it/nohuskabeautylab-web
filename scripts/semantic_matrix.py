from pathlib import Path
import csv, re, json
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'outputs'
pages = sorted(ROOT.rglob('*.html'))
rows = []

def clean(s):
    return re.sub(r'\s+', ' ', s or '').strip()

def infer(title, h1, path):
    text = ' '.join([title, h1, path]).lower()
    locality = 'Barcelona' if 'barcelona' in text else ('Vallès Oriental' if 'valles-oriental' in text or 'vallès oriental' in text else ('Granollers' if 'granollers' in text else 'General'))
    if path.endswith('/index.html') or path in ('index.html','404.html') or any(x in path for x in ['aviso-legal','cookies','privacidad']): primary='marca / información general'
    elif 'micropigmentacion-granollers' in path or 'micropigmentacion-valles-oriental' in path: primary='micropigmentación general'
    elif 'natural-brow' in text or 'natural brow' in text: primary='Natural Brow / laminado de cejas'
    elif 'lifting' in text or 'pestanas' in text or 'pestañas' in text: primary='lifting de pestañas / pestañas'
    elif 'capilar' in text: primary='micropigmentación capilar'
    elif 'pecas' in text or 'freckles' in text: primary='micropigmentación de pecas / freckles'
    elif 'labios' in text or 'lip blush' in text: primary='micropigmentación de labios'
    elif 'limpieza-facial' in text or 'facial' in text: primary='higiene / limpieza facial'
    elif 'cejas' in text or 'brows' in text: primary='cejas / micropigmentación de cejas'
    elif 'micropigmentacion' in text or 'micropigmentación' in text: primary='micropigmentación'
    else: primary='informativa / marca'
    intent = 'informativa' if '/guias/' in ('/'+path) or '/pecas/como-' in ('/'+path) or path.endswith('404.html') or any(x in path for x in ['aviso-legal','cookies','privacidad']) else 'comercial'
    return primary, intent, locality

def recommendation(path, primary, intent):
    p = path.lower()
    rules = [
        ('nohuska-natural-brow', 'Natural Brow Granollers'),
        ('micropigmentacion-cejas-granollers', 'Micropigmentación de cejas Granollers'),
        ('powder-brows-granollers', 'Powder Brows Granollers'),
        ('tinte-hibrido-cejas-granollers', 'Tinte híbrido de cejas Granollers'),
        ('cejas-granollers', 'Cejas Granollers'),
        ('lifting-pestanas-granollers', 'Lifting de pestañas Granollers'),
        ('nohuska-korean-gaze', 'Korean Gaze Granollers'),
        ('pestanas-granollers', 'Pestañas Granollers'),
        ('extensiones-pestanas', 'Extensiones de pestañas (pausadas)'),
        ('micropigmentacion-capilar-granollers', 'Micropigmentación capilar Granollers'),
        ('micropigmentacion-capilar-mujer', 'Micropigmentación capilar femenina'),
        ('freckles-barcelona', 'Freckles Barcelona'),
        ('freckles-espana', 'Freckles España'),
        ('freckles-valles-oriental', 'Freckles Vallès Oriental'),
        ('micropigmentacion-pecas-granollers', 'Micropigmentación de pecas Granollers'),
        ('limpieza-facial-coreana-granollers', 'Higiene facial Granollers'),
        ('limpieza-facial-valles-oriental', 'Limpieza facial Vallès Oriental'),
    ]
    for needle, kw in rules:
        if needle in p: return kw
    if intent == 'informativa': return 'Consulta informativa relacionada con ' + primary
    return primary

def status_for(path, primary):
    p = path.lower()
    if any(x in p for x in ['cejas-', 'natural-brow', 'powder-brows', 'tinte-hibrido', 'lifting-', 'pestanas-', 'korean-gaze', 'freckles', 'micropigmentacion-pecas', 'micropigmentacion-capilar', 'limpieza-facial']):
        return 'Investigar' if primary in ('cejas / micropigmentación de cejas','lifting de pestañas / pestañas','micropigmentación de pecas / freckles','micropigmentación capilar','higiene / limpieza facial') else 'Mantener'
    return 'Mantener'

class Parser(HTMLParser):
    def __init__(self): super().__init__(); self.tag=None; self.attrs={}; self.buf=[]; self.data={k:[] for k in ['title','h1','h2','h3']}; self.meta={}; self.links=[]; self.schema=[]
    def handle_starttag(self, tag, attrs):
        self.tag=tag; self.attrs=dict(attrs)
        if tag=='meta' and self.attrs.get('name')=='description': self.meta['description']=self.attrs.get('content','')
        if tag=='link' and self.attrs.get('rel')=='canonical': self.meta['canonical']=self.attrs.get('href','')
        if tag=='a' and self.attrs.get('href','').endswith('.html'): self.links.append(self.attrs['href'])
        if tag=='script' and self.attrs.get('type')=='application/ld+json': self.schema.append('JSON-LD')
    def handle_endtag(self, tag): self.tag=None
    def handle_data(self, data):
        if self.tag in self.data: self.data[self.tag].append(data)

for p in pages:
    parser=Parser(); parser.feed(p.read_text(encoding='utf-8', errors='ignore'))
    title = clean(' '.join(parser.data['title']))
    desc = clean(parser.meta.get('description','')); canon = parser.meta.get('canonical','')
    h1 = clean(' '.join(parser.data['h1'])); h2 = ' | '.join(clean(x) for x in [' '.join(parser.data['h2'])] if x); h3 = ' | '.join(clean(x) for x in [' '.join(parser.data['h3'])] if x)
    links = parser.links
    inbound_key = str(p.relative_to(ROOT)).replace('\\','/')
    primary, intent, locality = infer(title, h1, inbound_key)
    recommended = recommendation(inbound_key, primary, intent)
    status = status_for(inbound_key, primary)
    conflict = 'Solapamiento temático potencial; confirmar con consulta×página de Search Console' if status == 'Investigar' else 'No detectado por contenido'
    action = 'Cruzar consultas y páginas; diferenciar intención solo si los datos confirman alternancia' if status == 'Investigar' else 'Mantener y medir'
    schemas = sorted(set(parser.schema))
    rows.append({'url':'/'+inbound_key,'title':title,'description':desc,'h1':h1,'h2':h2,'h3':h3,'canonical':canon,'keyword_principal_inferida':primary,'keyword_recomendada':recommended,'conflicto_seo':conflict,'accion':action,'estado':status,'intencion':intent,'localidad':locality,'enlaces_salientes_html':len(links),'tipos_schema':';'.join(schemas)})

OUT.mkdir(exist_ok=True)
with (OUT/'matriz-semantica-45-paginas.csv').open('w', newline='', encoding='utf-8-sig') as f:
    w=csv.DictWriter(f, fieldnames=rows[0].keys()); w.writeheader(); w.writerows(rows)
with (OUT/'matriz-semantica-45-paginas.md').open('w', encoding='utf-8') as f:
    f.write('# Matriz semántica de páginas HTML\n\n')
    f.write(f'Páginas analizadas: {len(rows)}. Keyword principal inferida por título/H1/URL; no sustituye datos de Search Console.\n\n')
    f.write('| URL | Keyword actual | Keyword recomendada | Conflicto SEO | Acción | Estado | Intención | Localidad | H1 | Enlaces | Schema |\n|---|---|---|---|---|---|---|---|---|---:|---|\n')
    for r in rows:
        f.write('| {url} | {keyword_principal_inferida} | {keyword_recomendada} | {conflicto_seo} | {accion} | {estado} | {intencion} | {localidad} | {h1} | {enlaces_salientes_html} | {tipos_schema} |\n'.format(**r).replace('|','\\|'))
print(f'Generated {len(rows)} pages')
