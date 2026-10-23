# Ejecución competitiva — 23 de octubre de 2026

## Alcance y reversión

Lote de siete HTML sobre `cecd41a`. Copia anterior: rama `backup/competitive-catalog-20261022`. No se crean páginas ni se cambian URLs, canonical, títulos SEO, metadescripciones o H1. La reversión consiste en revertir el commit de este lote, sin tocar trabajos posteriores.

## Diferencias observadas y cambios nuevos

| Archivo en tratamientos/ | Antes | Cambio de este lote | Consulta o necesidad |
| --- | --- | --- | --- |
| guia-tratamientos-nohuska.html | 30 tarjetas sin acceso individual a fichas; faltaban servicios activos; retorno a fragmento inexistente | 33 tarjetas enlazadas; índice táctil de siete categorías; Click Lash/extensiones, Henna Lips y Ritual incluidos; precios y tiempos confirmados; acceso a Results Lab; retorno corregido; medición compartida existente incorporada | Elegir servicio desde el enlace del Perfil de Empresa sin recorrer todo el catálogo |
| nohuska-natural-brow-granollers.html | Información principal sin tiempo; sección final repetía la adecuación | 55 € / una hora; preparación y mantenimiento concretos; caso autorizado enlazado; FAQ de duración y Offer coherente | Natural Brow, laminado y tinte de cejas; distinguir duración de cita y del efecto |
| lifting-pestanas-granollers.html | Sin duración confirmada de la cita | 55 € / una hora en información principal; FAQ y datos estructurados coherentes | Lifting de pestañas Granollers; planificación de cita |
| nohuska-korean-gaze-granollers.html | Sin duración confirmada de la cita | 85 € / 90 minutos, frente a 110 € por separado; FAQ y Offer coherentes | Entender el pack de Natural Brow y lifting con tinte |
| limpieza-facial-coreana-granollers.html | Sin tiempo concreto de cita | Una hora en información principal y FAQ; no se inventa precio | Higiene y limpieza facial Granollers; saber qué tiempo reservar |
| pestanas-granollers.html | Comparativa de opciones sin enlace desde cada nombre | Acceso a Click Lash, pelo a pelo, lifting y Korean Gaze desde su comparación | Separar pestaña natural y fibras añadidas y llegar a la ficha adecuada |
| extensiones-pestanas-granollers.html | Foto de lifting junto a extensiones; barra móvil consultaba lifting/Korean Gaze | Imagen corporativa sin atribuir un lifting a extensiones; barra móvil solicita Click Lash/pelo a pelo al WhatsApp oficial | Evitar confusión de técnica y de solicitud |

Los tiempos fueron confirmados por la propietaria: Natural Brow 60 minutos, lifting 60, Korean Gaze 90 y limpieza facial 60. No se añade disponibilidad ficticia ni una tarifa facial sin confirmar.

## Evidencia competitiva y límites

- [AStudio laminado](https://astudio.es/laminado-de-cejas/) y [lifting](https://astudio.es/lifting-de-pestanas/): variantes, duración de cita, preparación y mantenimiento claramente explicados. La respuesta de Nohuska se basa en su propio servicio y tiempos, no en copiar los protocolos del competidor. Las imágenes que AStudio identifica como ilustrativas no equivalen a pruebas de casos propios.
- [Jordi Ponce en Treatwell](https://www.treatwell.es/establecimiento/jordi-ponce-beauty-center/): categorías y variantes con tiempos y precios; equipo, portfolio y reseñas vinculadas al tratamiento. No se han confundido esas reseñas con las de Google.
- L'Atelier: lectura directa de la web bloqueada con 403; no se le atribuyen ventajas técnicas no verificadas.
- Pecas: [Carolina de la Rosa](https://caroldelarosa.com/micropigmentacion-de-pecas-freckling/) diferencia técnicas y fotografías cicatrizadas. La mejora diferencial de Nohuska requiere confirmar técnica aplicada, fecha/evolución del caso y condiciones de revisión. No se inventa esa información ni se añade otro bloque genérico.
- Capilar femenina: [Carolina de la Rosa](https://caroldelarosa.com/micropigmentacion/micropigmentacion-capilar-mujeres/) responde sobre cabello largo y coloración. Nohuska ya trata el pelo largo en su guía; antes de ampliar la landing conviene documentar el protocolo propio de coloración y cuidados.

Estas diferencias son observaciones de contenido, no causas demostradas del ranking. Este lote no demuestra posiciones locales exactas ni una recuperación de reservas.

## Pruebas realizadas antes de publicar

- Revisión independiente por un segundo agente de las siete HTML.
- JSON-LD analizable, IDs únicos, enlaces y fragmentos locales existentes, fotografías y scripts presentes.
- Títulos, metadescripciones, H1 y canonical idénticos al estado anterior.
- Precios, tiempos y FAQ visibles coherentes con los datos estructurados. Sin precio facial inventado.
- WhatsApp oficial `34624011715` y teléfono `+34624011715` en las siete páginas.
- Prueba visual a 390 × 844 y 1280 × 900, sin desbordamiento horizontal en las fichas modificadas.
- Índice del catálogo: siete anclajes existentes y superficies táctiles de al menos 44 px.
- Recorrido interactivo catálogo → extensiones → WhatsApp: abre Nohuska Beauty Lab con Click Lash/pelo a pelo y referencia del tratamiento. No se envía ningún mensaje ni se cuenta como contacto comercial.
- `node scripts/test_contact_tracking.cjs`, comprobación de sintaxis del script compartido y `git diff --check`: correctos.

## Google Business Profile

Tras recargar el perfil y abrir su información, el enlace de servicios muestra `https://nohuska.com/tratamientos/guia-tratamientos-nohuska.html`, sin aviso de cambio pendiente ni la anterior URL de Booksy. Es una aprobación verificada en el panel del propietario; no equivale a medir la visibilidad del Local Pack desde diferentes ubicaciones.

No se repite la edición ya autorizada ni se publican posts duplicados. La búsqueda de marca muestra publicaciones previas de Henna Lips y Ritual; no se presentan como nuevas.

## Autoridad externa — preparado, no enviado

### 1. Páginas Amarillas

AStudio tiene [una ficha con enlace a su web](https://www.paginasamarillas.es/f/granollers/astudio-everlasting-beauty_234336790_000000001.html). [Alta básica oficial](https://areanegocios.beedigital.es/auth/new_company), enlazada como «Incluye tu negocio gratis». No localizar una ficha indexada de Nohuska no demuestra que no exista: comprobar duplicados antes del alta. No se crea una cuenta ni se aceptan servicios de pago.

Mensaje final para el canal oficial:

> Solicito comprobar si existe una ficha de Nohuska Beauty Lab y, si no existe, indicar el procedimiento de alta básica gratuita. Datos públicos: Avinguda Sant Esteve, 40, 08402 Granollers; +34 624 011 715; https://nohuska.com/. Servicios: cejas, lifting de pestañas, micropigmentación e higiene facial. Queremos mantener una sola ficha, con identidad y enlaces correctos. No solicitamos servicios de pago.

### 2. Revista Digital del Vallès

Destinatario público: `revista@revistadelvalles.es`. [Contacto verificado](https://revistadelvalles.es/contacto-3/). Publicación sujeta al criterio editorial; no hay enlace conseguido.

Asunto: Propuesta local: elegir tratamientos de cejas con información clara

> Hola, somos Nohuska Beauty Lab, estudio de Granollers. Os proponemos una colaboración editorial práctica para las lectoras del Vallès: diferencias entre diseño, laminado y micropigmentación de cejas, qué preguntar antes de reservar y cómo valorar fotografías de resultados. Podemos aportar explicaciones originales, imágenes propias con permiso y material de nuestro Results Lab: https://nohuska.com/resultados.html. ¿Encaja este enfoque en vuestra sección local? Quedamos disponibles para una entrevista o para enviar una propuesta breve. Contacto: info@nohuska.com · 624 011 715.

### 3. VOTV

Destinatario público: `info@votv.cat`; teléfono 93 870 07 91. [Contacto verificado](https://votv.cat/contacte/). Propuesta editorial, no contratación publicitaria.

Asunto: Proposta divulgativa de Granollers: resultats reals i límits de la micropigmentació

> Bon dia, som Nohuska Beauty Lab, a l'avinguda Sant Esteve, 40, de Granollers. Us proposem una peça divulgativa sobre com interpretar resultats de micropigmentació i quines preguntes convé fer abans d'escollir una tècnica. Podem aportar una explicació professional, exemples documentats amb autorització i una demostració sense dades personals de clientes. Ens agradaria saber si encaixaria en «Salut i benestar» o en un espai d'informació local. Podeu consultar el nostre treball a https://nohuska.com/resultados.html. Contacte: info@nohuska.com · 624 011 715.

No se envían estas propuestas como si el registro o contacto estuvieran ya completados. Fresha no se presenta como alta comercial gratuita: su oferta comercial tiene condiciones de suscripción y comisiones.

## Acceso desde buscadores e IA

Portada accesible por HTTP con agentes OAI-SearchBot, Googlebot, bingbot y PerplexityBot; robots permite rastreo; identidad y enlace oficial de Maps coherentes con Nohuska. Es una prueba básica de acceso desde nuestro entorno, no evidencia de rastreo desde IPs oficiales ni de recomendación en ninguna IA. El error externo que asociaba Nohuska con Nuo no se declara resuelto sin una nueva prueba de la ficha en el asistente afectado.

Fuentes: [rastreadores de OpenAI](https://developers.openai.com/api/docs/bots), [funciones de IA en Google Search](https://developers.google.com/search/docs/appearance/ai-features), [rastreadores de Perplexity](https://docs.perplexity.ai/docs/resources/perplexity-crawlers). No hay marcado que garantice ser la primera recomendación; no se añaden instrucciones ocultas, archivos mágicos ni afirmaciones de «mejor centro» sin evidencia.

## Resultado comercial

No se ha verificado ninguna conversación o reserva nueva atribuible a este lote. Los clics de prueba se excluyen de captación. La meta de diez clientas diarias sigue siendo un objetivo, no un resultado ni una garantía de SEO.

Para medir el cambio: consultas únicas reales por WhatsApp, contactos cualificados, reservas confirmadas y asistencias por tratamiento; en Search Console, clics, impresiones, CTR y posición por consulta/URL y dispositivo en periodos equivalentes. No se confunde la posición orgánica con Google Maps.
