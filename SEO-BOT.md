# Nohuska SEO Bot

El bot audita la web todos los lunes a las 09:15, hora peninsular aproximada, y después de cada publicación.

Comprueba:

- títulos, descripciones, H1 y canonical;
- páginas incluidas en el sitemap;
- enlaces internos e imágenes;
- JSON-LD de negocio y servicios;
- peso de HTML e imágenes y dimensiones visuales;
- disponibilidad real de la portada, `robots.txt` y `sitemap.xml`;
- dominios y rutas oficiales de `nohuska.com`.

El informe aparece en **GitHub → Actions → Nohuska SEO Bot** y se conserva 90 días. Si el control semanal encuentra un error crítico, crea además un aviso en **GitHub → Issues**, lo que genera una notificación de GitHub.

El bot no inventa contenido, reseñas ni enlaces. Tampoco puede garantizar posiciones: sirve para detectar fallos antes de que afecten a Google.
