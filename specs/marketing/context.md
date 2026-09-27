# context.md — marketing Destino Final

> Estado vivo del plan de marketing. El plan completo está en
> `PLAN_MAESTRO_MARKETING.md`; el spec de referencia en `../# MASTER_MARKETING_RESEARCH_SPEC.md`.

## Estado

- **📦 Proyecto:** Marketing Destino Final — ejecución del spec maestro en 6 fases (F0–F5)
- **📍 Fase:** `F0 · linea_base` — 🟡 en progreso, **no cerrada** (2 de 4 criterios booleanos pendientes, ver `00_linea_base.md` §5-§6)
- **🎯 Objetivo:** aumentar ventas y ticket promedio (S/ 25 estimado → **S/ 50.55 real según POS**, meta final a fijar en F3 con más historial)
- **💰 Presupuesto:** S/ 300–800 / mes
- **✅ Último avance (2026-07-09):**
  - ✅ Plan maestro creado (`PLAN_MAESTRO_MARKETING.md`) con fases, modelos de datos,
    criterios booleanos y decisiones D-M1…D-M8
  - ✅ Datos base confirmados por Jean (ubicación, ticket, aforo, días, activos)
  - ✅ **Plan unificado a v1.1 y APROBADO por Jean** (2026-07-09): integra F0 + D-M9
    (automatización transversal, prioridad contenido, herramienta vía ADR en F4)
  - ✅ **F0 ejecutado parcialmente** → `00_linea_base.md` creado:
    - Ticket promedio real del POS: **S/ 50.55** (33 órdenes, venta real confirmada por Jean)
    - Horario fin de semana confirmado: hasta 1am+ · Margen: cerveza 62.7%, alitas 43.75% (resto del mix sin costear)
    - Instagram auditado (24 seguidores, 2 posts) · GBP auditado (⚠️ **sin reclamar**, nombre con typo "FInal", sin horario/reseñas/fotos)
    - Facebook confirmado inactivo (en creación) · TikTok y WhatsApp Business **no verificables remotamente** (pendiente confirmación manual de Jean)
  - ⚠️ **Bloqueadores abiertos (impiden cerrar F0):**
    1. Historial del POS es de solo ~2.5 semanas / 6 días con actividad, no las 4-8 semanas del spec
    2. Auditoría de activos incompleta (falta TikTok y WhatsApp Business)

- **📝 Próximas acciones:**
  0. ✅ Plan v1.1 aprobado — ya no bloquea nada.
  1. **Jean decide:** ¿esperar 2-3 semanas más de POS antes de cerrar F0, o avanzar a F1 con línea base preliminar y repetir el corte antes de fijar metas SMART en F3?
  2. Jean/content manager: pasar cifras de TikTok `@gys.021` (seguidores, videos) y confirmar estado de WhatsApp Business.
  3. Acción de bajo costo recomendada ya: reclamar el GBP "Destino FInal Restobar", corregir el nombre, cargar horario y fotos (S/ 0, no depende de otra fase).
  4. **Hilo nuevo → F1:** investigación (mercado, geografía SJL, consumidor, digital,
     ≥10 competidores, benchmark) — solo cuando Jean confirme cómo proceder con el punto 1.

- **⏰ Hito externo:** Fiestas Patrias 28–29 jul — absorbido por Campaña 0 (semana 3).

## 🚀 Campaña 0 (excepción D-M10, aprobada 2026-07-09)

- **Qué:** "Julio es en Destino Final" — 3 semanas (sáb 11 jul – vie 31 jul) en TikTok/IG/FB.
  Ejes: partidos del Mundial (cuartos 11, semis 14–15, final 19) y Liga 1 (desde el 17),
  happy hour lun–jue 4–8pm 2x1, 10% universitario, gente de SJL, Club DF. Sábados: orquesta.
- **Pauta:** S/ 300 en Meta Ads, 4 ads separados (v1.1): AD-1 partidos S/120 (ancla) ·
  AD-2 happy hour S/70 · AD-3 universitario S/50 · AD-4 patrias S/60 (condicionado al corte
  de AD-1 el 20 jul).
- **Docs:** plan v1.1 en `campana-0/plan_campana_0.md` · calendario ejecutable para el asistente
  en `campana-0/CALENDARIO_CONTENIDO_CAMPANA_0_v1.1.xlsx` (27 piezas, video-first 70/20/10,
  CTAs con palabra clave, 5 hojas incl. checklist pre-lanzamiento).
  ⚠️ El archivo `CALENDARIO_CONTENIDO_CAMPANA_0.xlsx` (sin sufijo) quedó corrupto por un
  bloqueo de Excel durante la actualización: eliminarlo, la v1.1 es la vigente.
- **Cierre:** 2 ago — reporte vs criterios booleanos del plan §6; aprendizajes alimentan F2/F3.
- **Nota:** NO reemplaza F1–F4; metas de campaña son de aprendizaje, no las SMART de F3.

## Progreso por fase

| Fase | Entregables | Estado |
|---|---|---|
| F0 Línea base | `00_linea_base.md` | 🟡 en progreso — 2/4 criterios cumplidos |
| F1 Investigación | `investigacion/01–07` | ⬜ pendiente |
| F2 Síntesis | `sintesis/08–10` | ⬜ pendiente |
| F3 Estrategia | `estrategia/11–14` | ⬜ pendiente |
| F4 Planes | `ejecucion/15–19` | ⬜ pendiente |
| F5 Ejecución | `reportes/` | ⬜ pendiente |

## Cómo retomar en una nueva sesión

1. Leer este archivo + `PLAN_MAESTRO_MARKETING.md` (NO releer el spec maestro completo salvo
   que la fase lo requiera; el plan ya lo mapea).
2. Identificar la fase pendiente en la tabla de progreso y ejecutar SOLO esa fase.
3. Prompt sugerido: *"Retoma el plan de marketing de Destino Final: lee
   `specs/marketing/context.md` y ejecuta la fase F0 (línea base desde el POS vía Supabase)."*
4. Al cerrar la fase: marcar criterios booleanos en el plan, actualizar tabla de progreso,
   "Último avance" y "Próximas acciones" aquí.

Requisito F0: MCP de Supabase conectado (proyecto `kknvrufoelhdtouprcvm`) para extraer
órdenes/pagos de las últimas 4–8 semanas. ✅ Hecho, pero el POS solo tenía ~2.5 semanas de historial.

Preguntas ya respondidas por Jean (2026-07-09): horario sáb/dom (1am+) · margen (cerveza 62.7%,
alitas 43.75%) · handles (`@destinofinalrestobar` IG, `@gys.021` TikTok, FB en creación) ·
base de clientes WhatsApp (confirmado desde POS: tabla `clientes`, 8 registros).

Preguntas nuevas abiertas (surgidas en F0): ¿esperar más historial de POS o avanzar a F1 ya? ·
cifras de TikTok (bloqueado por anti-bot) · estado real de WhatsApp Business · ¿el teléfono del
GBP (930 171 200) es el mismo número de WhatsApp Business?

## Decisiones (resumen — detalle en plan §8)

- D-M1 fases secuenciales · D-M2 pauta solo Meta Ads · D-M3 POS = fuente de verdad ·
  D-M4 ventas>awareness · D-M5 subcarpeta propia · D-M6 nunca asumir datos de campo ·
  D-M7 content manager + IA · D-M8 un hilo nuevo por fase · **D-M9 (2026-07-09)
  automatización transversal, prioridad #1 = contenido (generación+programación),
  herramienta vía ADR en F4 (no se asume), presupuesto de la herramienta sin decidir**

## Revisión v1.1 (2026-07-09) — ✅ APROBADA por Jean

Jean pidió unificar `# MASTER_MARKETING_RESEARCH_SPEC.md` + `PLAN_MAESTRO_MARKETING.md` en
un solo plan a lanzar, con automatización como eje transversal. Ambos archivos subidos eran
idénticos a los ya existentes (sin cambios de contenido). Se actualizó `PLAN_MAESTRO_MARKETING.md`
a v1.1: integra resultados de F0, agrega D-M9, y suma criterios booleanos en F4 para el ADR de
herramienta de automatización de contenido. **Jean aprobó v1.1 (2026-07-09).** Sigue pendiente
(no bloquea la aprobación): decidir si el costo de la herramienta de automatización sale del
presupuesto de marketing o es aparte — se resuelve cuando se presente el ADR en F4.
