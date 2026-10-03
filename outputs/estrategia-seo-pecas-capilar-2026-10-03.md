# Estrategia SEO de pecas y micropigmentación capilar — Nohuska

Fecha de auditoría: 3 de octubre de 2026  
Negocio: Nohuska Beauty Lab · Avinguda Sant Esteve, 40, 08402 Granollers

## Diagnóstico ejecutivo

- Base técnica: 100/100 tras los cambios; 43 páginas revisadas, 0 errores y 0 avisos.
- Search Console, últimos 28 días disponibles (2–29 de septiembre): 60 clics, 1.420 impresiones, CTR 4,2 % y posición media 9,3.
- Micropigmentación capilar: 4 impresiones, 0 clics, posición media 5,3. La URL es muy nueva y todavía no tiene amplitud de consultas.
- Freckles: las páginas locales suman visibilidad pequeña y todavía no convierten en clics. Barcelona tuvo 39 impresiones y posición 11,5; España 16 y posición 9,8; Granollers 7 y posición 9,3; Vallès Oriental 14 y posición 60,4.
- Core Web Vitals: Search Console no dispone todavía de suficiente tráfico real de Chrome para móvil ni ordenador en los últimos 90 días. Esto no es un error técnico.
- Sitemap: correcto, leído por Google el 30 de septiembre antes de esta ampliación.
- Indexación: el informe disponible estaba actualizado a 21 de septiembre: 25 URLs indexadas y 14 pendientes. No debe interpretarse como estado actual de las URLs publicadas después de esa fecha.

La oportunidad principal no es crear más páginas de ciudades. Es construir autoridad temática, captar búsquedas de descubrimiento y llevarlas a las páginas comerciales de Granollers y Barcelona.

## Arquitectura y asignación de intención

### Cluster de pecas y freckles

| URL | Intención principal | Consultas objetivo |
|---|---|---|
| `/pecas/index.html` | Hub mixto, descubrimiento y decisión | pecas, freckles, micropigmentación de pecas, pecas semipermanentes |
| `/pecas/como-tener-pecas-naturales.html` | Informacional con puente comercial | cómo tener pecas, pecas sin maquillaje, pecas falsas naturales, fake freckles |
| `/tratamientos/micropigmentacion-pecas-granollers.html` | Comercial local | micropigmentación de pecas Granollers, freckles Granollers, tatuaje de pecas Granollers |
| `/tratamientos/freckles-barcelona.html` | Comercial provincial | freckles Barcelona, micropigmentación de pecas Barcelona, pecas semipermanentes Barcelona |
| `/guias/micropigmentacion-pecas-curacion-cuidados.html` | Postratamiento y consideración | curación pecas micropigmentadas, cuidados freckles, cuánto duran las pecas |
| `/tratamientos/freckles-valles-oriental.html` | Local comarcal | freckles Vallès Oriental, pecas semipermanentes Vallès Oriental |
| `/tratamientos/freckles-espana.html` | Consulta y desplazamiento | especialista pecas España, freckles España |

No se crearán páginas repetidas para cada municipio. Las URLs existentes se mantienen porque ya tienen impresiones y se observarán por separado antes de consolidar cualquier contenido.

### Cluster capilar

| URL | Intención principal | Consultas objetivo |
|---|---|---|
| `/tratamientos/micropigmentacion-capilar-granollers.html` | Comercial local | micropigmentación capilar Granollers, tricopigmentación Granollers, efecto densidad Granollers, SMP Granollers |
| `/guias/micropigmentacion-capilar-precio-duracion-sesiones.html` | Consideración y compra | precio micropigmentación capilar, sesiones, duración, mantenimiento, densidad femenina, entradas |

El siguiente contenido capilar solo debe crearse cuando exista un caso real propio y autorizado. Prioridad: caso de efecto densidad femenino o entradas, con contexto, valoración, proceso y evolución; no una página genérica adicional.

## Investigación semántica priorizada

### Pecas: descubrimiento

- cómo tener pecas naturales
- cómo tener pecas sin maquillaje
- pecas falsas naturales
- freckles naturales
- pecas temporales o semipermanentes
- cómo hacer que las pecas falsas parezcan reales
- maquillaje de pecas vs micropigmentación
- tatuaje de pecas natural

### Pecas: compra

- micropigmentación de pecas Granollers
- micropigmentación de pecas Barcelona
- freckles Barcelona / Granollers
- pecas semipermanentes Barcelona
- dónde hacerse pecas semipermanentes
- cuánto duran las pecas micropigmentadas
- precio micropigmentación de pecas
- especialista en freckles

### Capilar: compra

- micropigmentación capilar Granollers
- tricopigmentación Granollers
- micropigmentación capilar mujer Granollers
- efecto densidad capilar Granollers
- micropigmentación entradas mujer
- micropigmentación cuero cabelludo Vallès Oriental
- precio micropigmentación capilar
- cuántas sesiones de micropigmentación capilar
- micropigmentación capilar cerca de mí

## Qué muestran los competidores

- En freckles, las páginas fuertes explican elección de tono, distribución, curación y muestran un método propio. Nohuska debe diferenciarse con casos reales identificados por fase y el concepto Signature Freckles, no con más repeticiones de la palabra clave.
- En capilar, la competencia más visible cubre casos por problema y perfil —mujer, densidad, entradas, línea, cicatriz— y publica casos completos. Nohuska ya dispone de una landing clara, pero necesita evidencia visual propia y más profundidad de casos.
- Los resultados informacionales de pecas están dominados por medios y tutoriales de maquillaje. El nuevo hub permite captar esa demanda antes de que la persona conozca el tratamiento.

## Cambios implementados hoy

1. Nuevo centro temático `/pecas/index.html` con opciones, casos reales, preguntas y enlaces a todas las páginas del cluster.
2. Nueva guía `/pecas/como-tener-pecas-naturales.html` para captar demanda informacional sin canibalizar la página de reserva.
3. Nueva guía `/guias/micropigmentacion-capilar-precio-duracion-sesiones.html` con intención de compra, límites honestos y CTA de valoración.
4. Enlaces contextuales desde portada, mapa del sitio, landing de pecas, landing de Barcelona, guía de curación y landing capilar.
5. Sitemap actualizado con fechas reales del 3 de octubre de 2026.
6. Datos estructurados CollectionPage, Article, Service, BreadcrumbList y FAQPage donde corresponden.
7. Seguimiento de conversiones: las nuevas URLs de pecas quedan agrupadas en la categoría `pecas`; la guía capilar conserva `micropigmentacion-capilar`.
8. No se cambiaron ni eliminaron URLs que ya tenían impresiones.

## Plan de ejecución

### Próximas 72 horas

- Confirmar que GitHub Pages sirve las tres URLs nuevas con código 200.
- Confirmar que sitemap y robots siguen accesibles.
- Publicar en Perfil de Empresa una foto real de freckles y otra del procedimiento capilar, cada una con descripción factual y enlace a la landing correspondiente.
- Añadir a Servicios del Perfil de Empresa “Micropigmentación de pecas” y “Micropigmentación capilar” si todavía no aparecen exactamente como servicios reales.
- No solicitar reseñas con texto impuesto. Pedir que cada clienta describa libremente el servicio recibido y su experiencia.

### Semanas 1–4

- Subir un caso real semanal, alternando freckles y capilar solo cuando exista material propio y autorización.
- Para cada caso: foto original, nombre de archivo descriptivo, alt factual, fase de la fotografía y enlace hacia la landing comercial.
- Crear una publicación semanal en el Perfil de Empresa: duda frecuente, proceso o caso. No repetir el mismo texto.
- Conseguir dos menciones locales reales: colaboración con peluquería, comercio o medio de Granollers/Vallès Oriental, enlazando a la página relevante.
- Revisar Search Console por consulta y página cada lunes. Priorizar URLs con posición 4–20 e impresiones crecientes.

### Días 31–60

- Si el hub recibe impresiones para preguntas concretas, ampliar solo la sección correspondiente o publicar una guía única con demanda demostrada.
- Si capilar recibe consultas de mujer/densidad, publicar el primer caso real de densidad femenina. Si la demanda es de entradas, priorizar ese caso.
- Crear una comparación visual “antes / recién realizado / asentado” únicamente con material real y fechas claras.
- Auditar solapamiento entre Barcelona, Granollers, Vallès Oriental y España. Consolidar solo si Search Console muestra canibalización real.

### Días 61–90

- Reforzar las URLs que se encuentren entre posiciones 4 y 10 con casos, enlaces locales y respuestas nuevas; no reescribir por completo una página que ya sube.
- Conseguir una colaboración editorial o entrevista local sobre técnica, seguridad y diseño personalizado.
- Crear un segundo contenido capilar o de freckles únicamente a partir de consultas reales de Search Console y preguntas de clientas.
- Evaluar conversiones por tratamiento y retirar CTAs o contenidos que atraigan tráfico sin solicitudes cualificadas.

## SEO visual

Para cada imagen nueva:

1. Utilizar una fotografía propia, autorizada y sin filtros que alteren el resultado.
2. Nombrar el archivo por contenido, por ejemplo `freckles-resultado-asentado-nohuska-granollers.webp`.
3. Comprimir a WebP cuando sea posible, manteniendo detalle suficiente.
4. Escribir alt factual, no una lista de palabras clave.
5. Acompañar con pie de foto que indique si es antes, recién realizado o resultado asentado.
6. Reutilizar de forma coherente en web, Perfil de Empresa, Instagram y Pinterest; adaptar el texto, no copiarlo literalmente.

## Google Business Profile y autoridad local

- Mantener siempre: Nohuska Beauty Lab, Avinguda Sant Esteve 40, 08402 Granollers, +34 624 011 715 y horarios reales.
- Categoría principal: la que mejor describa el negocio real; no añadir categorías irrelevantes para captar tráfico.
- Servicios prioritarios: micropigmentación de pecas, micropigmentación capilar, efecto densidad capilar, micropigmentación de cejas, labios y lifting.
- Subir casos nuevos con regularidad, responder todas las reseñas y utilizar lenguaje natural.
- Enlaces locales seguros: asociaciones, directorios fiables, colaboraciones y medios locales. Evitar compras de enlaces, redes privadas y páginas duplicadas por municipio.

## Cuadro de mando semanal

Separar dos embudos:

### Freckles

- Impresiones y posición de `/pecas/`, guía informacional y landings locales.
- Consultas de descubrimiento frente a consultas de reserva.
- Clics a WhatsApp, llamadas y formularios etiquetados como `pecas`.
- Contactos, valoraciones y reservas confirmadas.

### Capilar

- Impresiones y posición de landing y guía.
- Consultas por perfil: mujer, densidad, entradas, línea, precio y sesiones.
- Clics a WhatsApp, llamadas y formularios `micropigmentacion-capilar`.
- Valoraciones realizadas y reservas confirmadas.

Objetivo de 90 días: aumentar consultas cualificadas y reservas, no perseguir una posición aislada. Ninguna acción garantiza el puesto 1; la tendencia se evalúa con Search Console, Perfil de Empresa y reservas reales.
