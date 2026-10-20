# Auditoría forense SEO — 20/10/2026

## Hechos verificados

- El repositorio contiene historial completo de cambios y el estado actual está basado en el commit de restauración `cd6acc1`, equivalente al cierre del 11/10.
- La auditoría local revisa 45 páginas: 100/100, 0 errores y 0 avisos.
- La web mantiene sitemap, robots, URLs canónicas, datos estructurados y enlaces de contacto.
- No hay datos accesibles en esta ejecución para demostrar posiciones históricas, clics de Search Console, sesiones GA4, interacciones del Perfil de Empresa o reservas reales.

## Cronología relevante

| Fecha | Cambio | Evidencia | Confianza |
|---|---|---|---|
| 09/10 | Pausa de extensiones y refuerzo de servicios activos | commit `5f9f39d` | Alta |
| 11/10 | Refuerzo capilar, higiene facial, sitemap y campaña Christmas Glow | commits `fe8c34d`, `f12d452`, `7955318`, `52f45a0` | Alta |
| 13/10 | Ajustes posteriores de lifting y cejas; no forman parte del estado restaurado | commits `50de60e`, `7300047` | Alta |
| 18–20/10 | Cambios posteriores de conversión, precios y marcado | commits posteriores revertidos por `cd6acc1` | Alta |

## Diagnóstico

No se puede atribuir una caída de clientes a un cambio concreto sin comparar dos periodos consecutivos en Search Console, GA4, Perfil de Empresa y registro comercial. La auditoría técnica no muestra un bloqueo de rastreo o indexación. Las hipótesis que quedan por comprobar son visibilidad local, demanda, conversión de WhatsApp y autoridad externa.

## Acciones ejecutadas

1. Restauración reversible al estado del 11/10 (`cd6acc1`).
2. Copia de seguridad en la rama `backup-before-oct11-rollback-20261020`.
3. Conexión de Instagram, Facebook y Booksy oficiales en `sameAs` (`358e378`).
4. Despliegue de GitHub Pages verificado como correcto.

## Pendiente de datos

- Search Console: dos ventanas consecutivas de 28 días por consulta y página.
- GA4: sesiones orgánicas, `generate_lead`, clics de WhatsApp y duplicados.
- Perfil de Empresa: visualizaciones, llamadas, rutas, web y publicaciones.
- Registro comercial: personas, tratamiento, canal, reserva y asistencia.

## Plan de validación

Medir del 20 al 27/10 sin nuevos cambios masivos. Si existe una pérdida demostrada, corregir solo el componente afectado y conservar la copia de seguridad.
