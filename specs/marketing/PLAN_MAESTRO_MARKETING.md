# PLAN_MAESTRO_MARKETING.md — Destino Final

Versión: 1.1 · Fecha: 2026-07-09 · Autor: Harness (aprobado por Jean)

> **Cambios v1.1 (unificación pedida por Jean, 2026-07-09):** se integra el resultado de F0
> (`00_linea_base.md`) como dato confirmado, y se agrega la automatización como principio
> transversal del plan (D-M9), no solo como entregable de F4 §19. Sigue siendo UN solo plan —
> el `# MASTER_MARKETING_RESEARCH_SPEC.md` no cambia (es el spec de referencia, v2.0, ya
> vigente en `specs/`); este documento es el que se ejecuta y se lanza.

## 1. Nombre y descripción

**Plan de ejecución del MASTER_MARKETING_RESEARCH_SPEC para Destino Final**: convertir el documento maestro de investigación (19 secciones) en fases secuenciales, testeables y medibles, cuyo objetivo de negocio es **aumentar ventas y ticket promedio**.

## 2. Datos confirmados (fuente: Jean, 2026-07-09)

| Dato | Valor |
|---|---|
| Negocio | Destino Final (Restobar GS) · marca Club DF |
| Ubicación | Av. El Sol 527, San Juan de Lurigancho, Lima, Perú |
| Ticket promedio | ~~S/ 25 estimado~~ → **S/ 50.55 real (POS, F0)** — muestra chica, ver advertencia abajo |
| Aforo | 70 personas |
| Horario | 4:00 pm – 11:00 pm lun-vie · **fin de semana hasta 1am+ (confirmado F0)** |
| Días fuertes | Viernes y sábado |
| Días flojos | Domingo a jueves |
| Margen aproximado | Cerveza 62.7% (costo S/5.60→venta S/15) · Alitas 43.75% (S/9→S/16) — resto del mix sin costear (confirmado F0) |
| Presupuesto marketing | S/ 300 – 800 / mes (pauta + producción). Costo de herramienta de automatización: **sin decidir si sale de aquí o es presupuesto aparte** (ver D-M9) |
| Producción de contenido | Content manager propio graba |
| Activos digitales | Instagram `@destinofinalrestobar` (24 seguidores, F0) · TikTok `@gys.021` (sin auditar, bloqueo anti-bot) · Facebook (en creación, inactivo) · Google Business Profile (**sin reclamar**, typo en nombre, sin horario/reseñas/fotos) · WhatsApp Business (sin auditar) |
| Activos tecnológicos | POS propio (Supabase: órdenes, pagos, clientes), Club DF (1 sol = 1 punto), carta digital `destinofinal.vercel.app` |
| Objetivo 90 días | Aumentar ventas y ticket promedio |

**Datos que YA NO están pendientes (resueltos en F0, ver `00_linea_base.md`):** horario de fin de semana, margen aproximado (parcial), handles de redes, ticket promedio real.

**Datos que SIGUEN pendientes** (prohibido asumirlos): historial de ventas de 4-8 semanas completas (F0 solo cubre ~2.5 semanas / 6 días con actividad — F0 no está cerrada), cifras de TikTok, estado de WhatsApp Business, herramienta de automatización (D-M9).

## 3. Alcance

**Entra:**

- Ejecución completa de las 19 secciones del `# MASTER_MARKETING_RESEARCH_SPEC.md`, organizada en fases secuenciales: investigación → síntesis → estrategia → planes → ejecución.
- Investigación geográfica de radios 300 m / 500 m / 1 km / 2 km alrededor de Av. El Sol 527, SJL.
- Mínimos obligatorios del spec: ≥10 competidores, ≥20 hallazgos, ≥20 oportunidades, ≥20 hipótesis, ≥10 experimentos.
- Campañas y contenido dentro del presupuesto S/ 300–800/mes.
- Medición con el POS propio como fuente de verdad de ventas/ticket.
- **Automatización como principio transversal (D-M9):** cada fase que genere un proceso repetitivo (contenido, reportes, respuestas, vigilancia) debe evaluar si se automatiza, no solo documentarlo como recomendación al final en §18. Prioridad confirmada por Jean (2026-07-09): **primero automatizar generación + programación de contenido**; WhatsApp/CRM, reportes de KPIs y vigilancia de competencia quedan en el backlog de automatización (§18/19_automatizaciones.md) para siguientes iteraciones, no en el primer lanzamiento.

**No entra:**

- Publicar contenido o crear anuncios antes de completar F1–F4 (decisión D-M1).
- Canales pagados fuera de Meta Ads en los primeros 90 días (D-M2).
- Desarrollo de software nuevo en el POS (las automatizaciones de la sección 18 se especifican, no se implementan en este plan).
- Delivery/apps de reparto, rebranding, cambios de carta o precios (se pueden *recomendar*, no ejecutar).

## 4. Modelos de datos

Estructura de archivos (todo bajo `specs/marketing/`):

```
specs/marketing/
├── PLAN_MAESTRO_MARKETING.md      ← este archivo
├── context.md                     ← estado vivo (fase, avance, próximo paso)
├── 00_linea_base.md               ← F0
├── investigacion/                 ← F1
│   ├── 01_negocio.md
│   ├── 02_mercado.md
│   ├── 03_geografia.md
│   ├── 04_consumidor.md
│   ├── 05_digital.md
│   ├── 06_competidores.md
│   └── 07_benchmark.md
├── sintesis/                      ← F2
│   ├── 08_hallazgos.md
│   ├── 09_oportunidades.md
│   └── 10_hipotesis.md
├── estrategia/                    ← F3
│   ├── 11_estrategia.md
│   ├── 12_kpis.md
│   ├── 13_riesgos.md
│   └── 14_roadmap.md
├── ejecucion/                     ← F4
│   ├── 15_plan_campanas.md
│   ├── 16_plan_contenido.md
│   ├── 17_plan_produccion.md
│   ├── 18_experimentos.md
│   └── 19_automatizaciones.md
└── reportes/                      ← F5
    ├── RESUMEN_EJECUTIVO.md
    └── reporte_mes_N.md
```

Formatos obligatorios (campos fijos, en tablas):

- **Hallazgo**: `id (H-##) · título · descripción · evidencia (fuente/link) · impacto (alto/medio/bajo) · prioridad (P0-P2) · acción recomendada`
- **Oportunidad**: `id (O-##) · descripción · clasificación (alta/media/baja) · costo (S/) · impacto · tiempo · complejidad · ROI esperado`
- **Hipótesis**: `id (HIP-##) · hipótesis · justificación (link a H-## u O-##) · experimento · duración · costo (S/) · indicadores · resultado esperado · criterio de éxito (booleano)`
- **Competidor** (≥10 filas): `nombre · ubicación · distancia · productos · precios · promociones · redes (handles + seguidores) · publicidad · contenido · diseño/branding · servicio · eventos · reseñas · calificación GBP · FODA`
- **Experimento**: `id (EXP-##) · objetivo · hipótesis (HIP-##) · costo · duración · variables · KPIs · resultado esperado · aprendizaje esperado`
- **Contenido** (cada pieza): `objetivo · hook · copy · CTA · hashtags · horario · plataforma · métrica esperada`
- **KPI**: `nombre · definición · fórmula · fuente (POS Supabase / Meta / TikTok / GBP / WhatsApp) · frecuencia · responsable · meta`

## 5. Planificación por fases

Regla general: ninguna fase inicia sin cerrar la anterior; cada fase deja los archivos completos (nunca a medias). Semana 1 = 13–19 julio 2026.

### F0 — Línea base y auditoría (días 1–3, semana 1)

| # | Tarea | Entregable |
|---|---|---|
| 0.1 | Extraer del POS: ventas, N° órdenes, ticket promedio real, mix de productos, día/hora de las últimas 4–8 semanas | `00_linea_base.md` |
| 0.2 | Confirmar con Jean: horario fin de semana, margen aproximado, handles de redes | `00_linea_base.md` |
| 0.3 | Auditar activos: seguidores, frecuencia de publicación, estado del GBP (fotos, reseñas, categoría, horario) | `00_linea_base.md` |

**Criterios de aprobación F0 (booleanos):**
- [ ] Existe ticket promedio real calculado desde el POS (no el estimado de S/ 25)
- [ ] Existe tabla de ventas por día de semana de ≥4 semanas
- [ ] Los 5 activos digitales están auditados con métricas numéricas
- [ ] Horario de fin de semana y margen confirmados por Jean

### F1 — Investigación (semanas 1–2)

| # | Sección del spec | Entregable |
|---|---|---|
| 1.1 | §1 Comprensión del negocio (beneficio, propuesta de valor, posicionamiento, ingresos/costos, recursos) | `01_negocio.md` |
| 1.2 | §2 Mercado (tamaño, tendencias, campañas vigentes, calendario de eventos: Fiestas Patrias 28–29 jul, calendario universitario, fechas comerciales) | `02_mercado.md` |
| 1.3 | §3 Geografía (radios 300 m/500 m/1 km/2 km: universidades, institutos, gimnasios, empresas, paraderos, flujos y horas pico) | `03_geografia.md` |
| 1.4 | §4 Consumidor (buyer persona: quién/por qué/cuándo compra, música, redes, humor, objeciones, emociones) | `04_consumidor.md` |
| 1.5 | §5 Digital (IG, TikTok, FB, Google Maps, YT Shorts, Threads: top formatos, audios, horarios, CTA, reseñas, FAQs) | `05_digital.md` |
| 1.6 | §6 Competitiva (≥10 competidores con tabla comparativa completa) | `06_competidores.md` |
| 1.7 | §7 Benchmark internacional (restobares similares: qué hacen mejor, qué adaptar) | `07_benchmark.md` |

**Criterios F1:**
- [ ] Los 7 archivos existen y responden todas las preguntas de su sección del spec
- [ ] Cada afirmación tiene fuente citada (link, observación de campo o dato del POS) — cero datos asumidos
- [ ] `06_competidores.md` tiene ≥10 competidores con los 18 campos del modelo de datos
- [ ] `03_geografia.md` cubre los 4 radios con conteos numéricos

### F2 — Síntesis (semana 3)

| # | Sección | Entregable |
|---|---|---|
| 2.1 | §8 Hallazgos (≥20) | `08_hallazgos.md` |
| 2.2 | §9 Oportunidades (≥20, clasificadas) | `09_oportunidades.md` |
| 2.3 | §10 Hipótesis (≥20, medibles) | `10_hipotesis.md` |

**Criterios F2:**
- [ ] ≥20 hallazgos, cada uno con evidencia trazable a un archivo de F1
- [ ] ≥20 oportunidades con costo, impacto, tiempo, complejidad y ROI esperado
- [ ] ≥20 hipótesis con criterio de éxito booleano y costo dentro del presupuesto
- [ ] Cada hipótesis referencia al menos un hallazgo u oportunidad (trazabilidad)

### F3 — Estrategia (semana 4)

| # | Sección | Entregable |
|---|---|---|
| 3.1 | §11 Estrategia general (objetivos SMART, posicionamiento, mensajes, oferta, embudo, canales, presupuesto, remarketing, fidelización con Club DF, alianzas, SEO local, GBP, WhatsApp) | `11_estrategia.md` |
| 3.2 | §14 KPIs (los 20 del spec, con fuente y meta) | `12_kpis.md` |
| 3.3 | §16 Riesgos (comerciales, operativos, financieros, tecnológicos, marca, legales, con probabilidad/impacto/mitigación) | `13_riesgos.md` |
| 3.4 | §17 Roadmap (semanas 1–4, mes 2, 3, 6 y 12) | `14_roadmap.md` |

**Criterios F3:**
- [ ] Objetivos SMART con número, fecha y fuente de medición definidos
- [ ] Los 19 componentes de §11 están desarrollados (ninguno dice "pendiente")
- [ ] Presupuesto asignado suma ≤ S/ 800/mes con contingencia del 10–15% incluida
- [ ] Cada KPI tiene fórmula, fuente y meta numérica
- [ ] El roadmap cubre los 8 horizontes del spec (semanas 1–4, mes 2, 3, 6 y 12)

### F4 — Planes de ejecución (semana 5)

| # | Sección | Entregable |
|---|---|---|
| 4.1 | Plan de campañas (§19): campaña 1 detallada + backlog de campañas priorizado | `15_plan_campanas.md` |
| 4.2 | §12 Plan de contenido (pilares, calendario mensual/semanal/diario; cada pieza con los 8 campos del modelo) | `16_plan_contenido.md` |
| 4.3 | §13 Plan de producción (flujo content manager → IA clasifica/genera → revisión → publicación → reporte) | `17_plan_produccion.md` |
| 4.4 | §15 Experimentos (≥10, ligados a hipótesis) | `18_experimentos.md` |
| 4.5 | §18 Automatizaciones (copys, programación, respuestas, WhatsApp, reportes, vigilancia competitiva) | `19_automatizaciones.md` |

**Criterios F4:**
- [ ] Calendario editorial del mes 1 completo (cada pieza con objetivo, hook, copy, CTA, hashtags, horario, plataforma, métrica)
- [ ] ≥10 experimentos, todos ejecutables con ≤ S/ 800/mes en total
- [ ] Campaña 1 tiene fecha de inicio, presupuesto exacto, audiencia, creativos requeridos y KPI primario
- [ ] El flujo de producción define responsable y tiempo por etapa
- [ ] **(D-M9) `19_automatizaciones.md` incluye un ADR de 2-3 opciones de herramienta para automatizar generación + programación de contenido, con costo mensual explícito y de dónde sale (marketing o infraestructura)**
- [ ] La automatización de contenido queda funcionando de punta a punta (content manager sube → IA genera copy/hashtags/horario → programación automática), no solo documentada

### F5 — Ejecución y medición (meses 2–3)

| # | Tarea | Entregable |
|---|---|---|
| 5.1 | Lanzar campaña 1 + calendario editorial mes 1 | publicaciones + pauta activa |
| 5.2 | Ejecutar experimentos EXP-01…03 (los de mayor ROI esperado) | resultados en `18_experimentos.md` |
| 5.3 | Reporte mensual: KPIs vs meta, aprendizajes, reasignación de presupuesto | `reportes/reporte_mes_N.md` |
| 5.4 | Resumen ejecutivo final del ciclo de 90 días + dashboard recomendado | `reportes/RESUMEN_EJECUTIVO.md` |

**Criterios F5:**
- [ ] Campaña 1 corrió ≥4 semanas con presupuesto ejecutado registrado
- [ ] Reporte mensual publicado dentro de los 5 primeros días del mes siguiente
- [ ] Cada experimento cerró con veredicto booleano (éxito/fracaso) y aprendizaje
- [ ] Existe comparación ventas y ticket promedio vs línea base de F0

## 6. Marco preliminar de campaña (hipótesis inicial — F1 puede corregirlo)

Todo lo siguiente queda sujeto a validación por la investigación; se registra para dar dirección, no como verdad.

- **Objetivo SMART preliminar**: aumentar ventas mensuales +20% y ticket promedio de S/ 25 → S/ 28 en 90 días desde el lanzamiento de campañas, medido en el POS. *(El número final se fija en F3 con la línea base real de F0.)*
- **Palancas de ticket promedio**: combos/upsell en la carta digital, premios Club DF que incentiven consumo mayor, promociones dom–jue (días flojos) que no canibalicen vie–sáb.
- **Canales (presupuesto S/ 300–800/mes)**: orgánico IG + TikTok (content manager, costo S/ 0 en medios), GBP/SEO local (S/ 0), WhatsApp Business (S/ 0), Meta Ads geolocalizado 2–5 km (S/ 300–500), contingencia/experimentos (S/ 100–200).
- **Hito aprovechable**: Fiestas Patrias (28–29 julio) cae en F1–F2; si F0 muestra capacidad, se permite UNA acción táctica simple (promoción orgánica + GBP) sin violar D-M1, documentada como EXP-00.

## 7. Criterios de aprobación globales

- [ ] Las 19 secciones del spec maestro están cubiertas por algún entregable de F0–F5
- [ ] Ningún archivo contiene datos sin fuente ("nunca asumir")
- [ ] Todos los entregables de §19 del spec existen al cierre de F5
- [ ] El gasto mensual total registrado nunca superó S/ 800
- [ ] Ventas y ticket promedio del mes 3 son comparables contra línea base de F0 con datos del POS

## 8. Decisiones tomadas y descartadas

| ID | Decisión | Alternativa descartada | Razón |
|---|---|---|---|
| D-M1 | Fases secuenciales: investigación completa antes de campañas | Híbrido (quick wins en paralelo) | Elección de Jean (2026-07-09); el spec exige evidencia antes de recomendar. Única excepción: EXP-00 Fiestas Patrias, orgánico y de bajo riesgo |
| D-M2 | Pauta solo en Meta Ads (IG/FB) geolocalizada los primeros 90 días | Google Ads, TikTok Ads | Presupuesto ≤ S/ 800 no soporta multiplataforma; búsqueda local la cubre GBP orgánico; TikTok crece orgánico con el content manager |
| D-M3 | POS (Supabase) como fuente de verdad de ventas/ticket | Métricas de plataformas ad como proxy de ventas | El POS mide ventas reales; las plataformas solo alcance/clics. Ventaja competitiva ya construida |
| D-M4 | Objetivo primario = ventas + ticket; awareness es secundario | Campaña de awareness primero | Elección de Jean; negocio ya operativo con activos digitales existentes |
| D-M5 | Subcarpeta `specs/marketing/` separada de los specs de producto | Archivos sueltos en `specs/` | 20+ archivos de marketing contaminarían el espacio de specs del POS |
| D-M6 | Geografía, competidores y consumidor se investigan en F1, no se estiman | Rellenar con conocimiento general de SJL | Principio "nunca asumir" del spec; el conocimiento general alucina conteos y nombres |
| D-M7 | Producción: content manager graba; la IA genera título/copy/CTA/hashtags/horario según §13 | Contratar agencia | Recurso ya existente + presupuesto limitado |
| D-M8 | Cada fase se ejecuta en un hilo nuevo del harness | Un solo hilo continuo | Ahorro de tokens y contexto limpio por fase (preferencia de Jean) |
| D-M10 | (2026-07-09) **Excepción a D-M1 aprobada por Jean:** Campaña 0 "Julio es en Destino Final" (11–31 jul, TikTok/IG/FB + S/ 300 Meta Ads) se ejecuta ANTES de cerrar F1–F4, como EXP-00 ampliado con criterios booleanos propios. Plan en `campana-0/plan_campana_0.md`. F1–F4 continúan en paralelo sin cambios | Mantener D-M1 estricto (solo orgánico, o esperar a F4) | Final del Mundial (19 jul) y Fiestas Patrias (28–29 jul) son ventanas irrepetibles; riesgo acotado; el POS mide el impacto real. Jean eligió la excepción tras explicación del conflicto |
| D-M9 | (2026-07-09) Automatización es principio transversal del plan, no solo el entregable §18/19. Prioridad #1 confirmada por Jean: generación + programación de contenido. Herramienta se decide con **ADR (2-3 opciones, costo/pros/contras)** antes de implementar — el Harness no asume n8n/Make/Zapier/API oficial | Asumir una herramienta ahora (ej. n8n por defecto) | Jean eligió explícitamente que el Harness presente opciones en vez de asumir (regla "Jean decide arquitectura"); WhatsApp/CRM, reportes y vigilancia de competencia quedan en backlog, no en el primer lanzamiento. **Pendiente:** si el costo de la herramienta sale del presupuesto de marketing (S/300-800) o es presupuesto aparte de infraestructura — Jean no lo definió aún, queda abierto para cuando se presente el ADR |

## 9. Riesgos del plan (los del negocio van en `13_riesgos.md`)

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Investigación geográfica/digital limitada por herramientas (datos de campo) | Media | Alto | Combinar web + Google Maps + tarea de campo para Jean/content manager con checklist en F1 |
| Parálisis por análisis: F1–F4 se extienden y no se lanza nada | Media | Alto | Fechas fijas por fase; criterios booleanos; máximo 5 semanas hasta campaña 1 |
| Línea base del POS incompleta o sucia | Baja | Medio | F0 valida calidad de datos antes de fijar metas SMART |
| Presupuesto insuficiente para significancia en experimentos pagados | Media | Medio | Priorizar experimentos orgánicos y de oferta (sin pauta); pauta concentrada en 1 campaña |

## 10. Próximos pasos

1. ~~Jean aprueba este plan~~ → hecho (v1.0). **Jean aprueba esta revisión v1.1** (integración de F0 + D-M9 automatización) antes de seguir.
2. ~~Ejecutar F0~~ → hecho parcialmente (`00_linea_base.md`). **F0 sigue abierta**: falta decidir si se espera más historial de POS o se avanza a F1 con línea base preliminar, más TikTok y WhatsApp Business por auditar.
3. **Acción inmediata de bajo costo (no depende de fase):** reclamar el GBP "Destino FInal Restobar", corregir el nombre, cargar horario y fotos.
4. **Hilo nuevo** → F1 investigación (puede dividirse en 2 hilos: 1.1–1.4 y 1.5–1.7).
5. Cuando F1 llegue a §13/§18 (F4): presentar el ADR de herramienta de automatización de contenido (D-M9) antes de construir el flujo de producción.
6. Al cierre de cada fase: actualizar `context.md` y marcar criterios booleanos.
