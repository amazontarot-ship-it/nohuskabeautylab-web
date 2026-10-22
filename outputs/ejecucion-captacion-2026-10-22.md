# Ejecución de captación — 22 octubre 2026

Base: `fbdafd1`. Respaldo: rama `backup/whatsapp-recovery-20261022` en esa revisión. No se han cambiado URL, canonical, titles ni metadescripciones. No se crean páginas comerciales.

## Incidencias y cambios

| Área | Antes | Después | Verificación |
| --- | --- | --- | --- |
| Portada móvil | A 390 px, `.hero-copy` medía 512 px y el contenido quedaba cortado. | Columna `minmax(0,1fr)`, hijos con `min-width:0`, titular adaptable. WhatsApp primero, resultados después. | Medición DOM y prueba visual antes/después. |
| Historial del fallo móvil | `cc25a53` incluyó una corrección el 18/10; la restauración `cd6acc1` del 20/10 retiró sus reglas de ancho mínimo y ajuste de texto. | Se recuperan las reglas necesarias para la portada, con tamaño de titular legible. | Comparación Git. No explica por sí solo el inicio del descenso el 18/10. |
| WhatsApp | Clic emitía `generate_lead` y `nohuska_lead`. | Emite solo `click_whatsapp`, una vez por clic consentido. | Prueba de comportamiento con consentimiento, rechazo, retirada, almacenamiento bloqueado y carga doble. |
| Atribución | Origen por defecto «web-directa» y mensajes que afirmaban venir de Google. | «directo-o-desconocido» cuando no consta origen; cejas y lifting sin origen inventado en el mensaje. Campañas GBP conocidas conservadas. | Pruebas de UTM, referrer, parámetros y referencia WhatsApp. |
| Cejas | Cinco explicaciones de selección de técnica y nota interna de SEO. | Decisión de diseño, preparación, cuidados y FAQ sobre trabajo previo; 15 → 11 secciones. | Un H1, metadatos conservados y enlaces útiles. |
| Lifting | Precio variable en FAQ pese a tarifa confirmada; preparación repetida. | 55 € y Korean Gaze 85 € / 110 € separados, FAQ y marcado coherentes; 15 → 12 secciones. | JSON-LD y contenido visible coincidentes. |
| Centro | Tarjetas de especialidades sin paso directo al servicio. | Enlaces por objetivo a las páginas correspondientes y casos reales. | Destinos y fragmentos existentes. |
| Facial | Diagnóstico repetido, dos tablas equivalentes y explicación dirigida a SEO. | Una explicación de higiene/limpieza/K-Beauty y preparación/cuidados útiles; 1.065 → 795 palabras. | Intención comercial y URL conservadas. |
| Pecas Barcelona | Enumeración de búsquedas y bloques repetidos. | Comparación de técnicas, orientación antes de desplazarse y acceso al caso `#pecas`. | Ubicación real Granollers; sin resultado curado inventado. |
| Capilar | Metatexto sobre landing e intención local; instrucciones duplicadas. | Acceso al caso `#capilar`, guía útil y contenido más compacto; 1.535 → 1.411 palabras. | Se conservan video, límites, proceso y FAQ. |
| Results Lab | Casos sin anclas, figuras inválidas, consulta genérica. | Anclas por caso, figuras y ItemList coherentes, consulta por tratamiento, fotografía completa y márgenes móviles. | Casos existentes, sin nuevos testimonios, fechas de evolución ni resultados añadidos. |

La actualización de la versión del script en 41 HTML es mecánica para renovar la caché. No equivale a optimizar semánticamente 41 páginas.

## Comparación comercial y límites

Se reutiliza el diagnóstico de AStudio (adecuación, preparación y cuidados), Jordi Ponce/Treatwell (variantes y claridad comercial) y los directorios (servicio, precio y acceso a reserva). Las mejoras resuelven esas diferencias; no prueban que Nohuska haya adelantado posiciones.

Los 19 clics de Search Console del 10–17/10 y los 4 del 18–22/10 no permiten explicar por sí solos cinco conversaciones diarias. El segundo periodo contiene datos parciales. Maps, enlaces directos de WhatsApp, recomendaciones y otras fuentes requieren sus propios registros.

## Registro separado de resultados reales

Para cada conversación comercial única, registrar una referencia local sin nombre ni teléfono, fecha de inicio, referencia WEB si existe, canal declarado, tratamiento, cualificación, reserva confirmada, fecha de cita, asistencia e ingreso. Una conversación puede tener varios mensajes y clics; se cuenta una sola vez. Una reserva se acredita en agenda o confirmación comercial, no con Analytics. El cuadro diario existente es `outputs/cuadro-mando-captacion.csv`.

GA4 mide `click_whatsapp`, `click_call` y `click_booksy`. No se emite `generate_lead` sin una solicitud verificable. No se inventa un evento de reserva desde una web estática que no recibe confirmación de Booksy. Los datos anteriores a esta corrección no son directamente comparables con los nuevos eventos de contacto.

Prueba interna identificada: `utm_source=internal-test&utm_medium=qa&utm_campaign=whatsapp-qa-20261022`; emite `debug_mode:true` y `test_event:true`. Se debe excluir de resultados comerciales. Nunca se envía un mensaje ni se confirma una reserva durante esta prueba.

## Reversión

Para revertir, preparar un `git revert` de los commits de esta intervención después de revisar sus cambios. El estado completo anterior permanece en la rama de respaldo. No usar reset destructivo ni tocar la migración.

## Pendientes externos

- Confirmar origen de conversaciones antiguas mediante WhatsApp Business y métricas diarias del Perfil de Empresa. Los clics de Search Console no incluyen todos los contactos directos de Maps.
- Mantener el Perfil de Empresa configurado; no hay una categoría nueva justificada en esta intervención.
- Reporte de asociación incorrecta de ChatGPT preparado en `outputs/reporte-identidad-chatgpt-nohuska.md`; no enviado.
- Precios y duración no confirmados continúan sujetos a consulta. No se publican cifras inventadas.
