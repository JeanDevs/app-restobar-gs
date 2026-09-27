# 00_linea_base.md — F0 · Línea base y auditoría (Destino Final)

Fecha: 2026-07-09 · Fuente de verdad ventas: POS Supabase (D-M3) · Estado: **preliminar, con bloqueadores abiertos** (ver §5-§6)

## 1. Resumen

Se extrajo la línea base de ventas desde el POS (Supabase, proyecto `kknvrufoelhdtouprcvm`) y se auditaron los activos digitales disponibles. Dos de los cuatro criterios booleanos de F0 **no se cumplen todavía** — no se cierra la fase, se documentan como bloqueadores para decisión de Jean (§6).

## 2. Línea base de ventas (POS)

### 2.1 Advertencia sobre el alcance de los datos

- El POS solo tiene **~2.5 semanas de historial** (primera orden: 2026-06-21; última: 2026-07-09), muy por debajo de las 4–8 semanas que pide el spec.
- De 15 días calendario en ese rango, **solo 6 días tuvieron alguna orden** (21-jun, 22-jun, 26-jun, 30-jun, 4-jul, 5-jul); el resto están en cero.
- Jean confirmó (2026-07-09) que las 33 órdenes cerradas/pagadas son **venta real**, no pruebas — el negocio operó el POS solo esos días. No se descarta ni se asume nada adicional (D-M6).
- **Conclusión: esta es una línea base preliminar, no la línea base de 4-8 semanas que exige el criterio de F0.**

### 2.2 Métricas generales

| Métrica | Valor |
|---|---|
| Órdenes totales | 35 (33 cerradas/pagadas · 1 anulada · 1 abierta) |
| Ticket promedio real | **S/ 50.55** (vs. S/ 25 estimado en el plan maestro — casi el doble) |
| Ventas totales del período | S/ 1,668.00 |
| Rango de fechas con datos | 2026-06-21 → 2026-07-09 (6 días activos) |

### 2.3 Ventas por día (hora local Lima)

| Fecha | Día | N° órdenes | Ventas (S/) |
|---|---|---|---|
| 2026-06-21 | Domingo | 7 | 470.50 |
| 2026-06-22 | Lunes | 1 | 137.00 |
| 2026-06-26 | Viernes | 1 | 80.00 |
| 2026-06-30 | Martes | 1 | 49.00 |
| 2026-07-04 | Sábado | 8 | 320.50 |
| 2026-07-05 | Domingo | 15 | 611.00 |

Nota: con solo 1-2 observaciones para lunes/martes/viernes, no hay muestra suficiente para un patrón por día de semana confiable. Domingo concentra 45 de las 33 órdenes... *(22 de 33, ~67%)* — pero corresponde a 2 fechas puntuales, no a un patrón validado.

### 2.4 Distribución por hora (Lima)

| Hora local | N° órdenes | Ventas (S/) |
|---|---|---|
| 00:00–03:00 | 15 | 611.00 |
| 18:00 | 1 | 137.00 |
| 20:00–23:00 | 17 | 920.00 |

La mayoría de órdenes se cierran de madrugada (00–03h), consistente con un flujo que empieza en la noche y el registro de cierre ocurre horas después.

### 2.5 Mix de productos (unidades y venta, órdenes cerradas/pagadas)

| Producto | Categoría | Unidades | Venta (S/) |
|---|---|---|---|
| Cerveza (5 und) | Cervezas | 14 | 910.00 |
| Cerveza (3 und) | Cervezas | 7 | 280.00 |
| Cerveza (1 und) | Cervezas | 6 | 90.00 |
| Cigarro Lucky (1 caja) | Cigarros | 2 | 64.00 |
| Pisco Sour | Cócteles | 3 | 45.00 |
| Cerveza 3 Cruces (1 und) | Cervezas | 5 | 40.00 |
| Cerveza día familiar | Cervezas | 4 | 36.00 |
| Coca Cola (500 mL) | Gaseosas | 5 | 25.00 |
| Promo sábado cerveza 25 | Cervezas | 1 | 25.00 |
| Gaseosa familiar 1.5 L | Cervezas* | 2 | 20.00 |
| San Mateo (625 mL) | Aguas | 5 | 17.50 |
| Agua Cielo (625 mL) | Aguas | 5 | 15.00 |
| Cerveza 3 Cruces (2 und) | Cervezas | 1 | 15.00 |
| Piña Colada / Cuba Libre / Laguna Azul / Mojito | Cócteles | 1 c/u | 15.00 c/u |
| San Luis (625 mL) | Aguas | 3 | 10.50 |
| Inka Cola (500 mL) | Gaseosas | 2 | 10.00 |
| Cigarro Lucky (1 und) | Cigarros | 2 | 5.00 |

\* Categoría mal etiquetada en el catálogo (`items.categoria`) — bug menor a corregir en el POS, no afecta el análisis de marketing.

**Hallazgo clave: la cerveza es ~85% de la venta del período (S/ 1,416 de S/ 1,668).** Cócteles, únicos productos S/15 con mejor margen relativo, casi no se venden (7 unidades en total). Esto es una oportunidad directa para F2/F3 (upsell de cócteles = palanca de ticket promedio, ya prevista en el plan maestro §6).

### 2.6 Medios de pago

| Tipo | N° | Monto (S/) |
|---|---|---|
| Yape | 25 | 830.50 |
| Efectivo | 16 | 587.00 |
| Tarjeta | 3 | 253.50 |

## 3. Confirmaciones de Jean (0.2)

| Dato | Respuesta de Jean (2026-07-09) |
|---|---|
| Horario fin de semana | Hasta la 1am o más (vs. 4pm-11pm entre semana) |
| Margen aproximado | Cerveza: costo S/5.60 → venta S/15 (**62.7%**). Alitas: costo S/9 → venta S/16 (**43.75%**). No se dio margen del resto del mix (cócteles, gaseosas, cigarros, aguas) |
| Handles redes | IG: `@destinofinalrestobar` · TikTok: `@gys.021` · Facebook: aún en creación (no activo) |
| Base de clientes con teléfono | Ya confirmado desde el POS: tabla `clientes` (Club DF) con 8 registros y WhatsApp cada uno — no fue necesario preguntarlo |

**Nota sobre margen:** dado que la cerveza es ~85% de las ventas, el margen ponderado del negocio está probablemente cerca de 60%, pero esto es una extrapolación de 2 productos, no un costeo completo del mix. No se usará como dato duro en F3 sin un costeo real del resto de la carta.

## 4. Auditoría de activos digitales (0.3)

| Activo | Estado | Métricas |
|---|---|---|
| **Instagram** `@destinofinalrestobar` | Activo | 24 seguidores · 48 seguidos · 2 publicaciones. Bio: "Hamburguesas artesanales, alitas, tragos de autor", "mejor ambiente en SJL", "Atención M-D sábados: Orquesta". Link en bio → `destinofinal.vercel.app` |
| **TikTok** `@gys.021` | **No verificable** | TikTok bloqueó el acceso automatizado (pantalla "Please wait" indefinida) — no se pudo leer seguidores/videos. Pendiente: Jean o el content manager debe pasar el dato manualmente (captura de pantalla o cifras) |
| **Facebook** | Inactivo | Confirmado por Jean: página aún en creación, sin actividad. Cuenta como activo digital "en cero" para el mix actual |
| **Google Business Profile** | Activo pero **sin reclamar** | Nombre listado: "Destino FInal Restobar" (⚠️ error tipográfico — "FInal" con I mayúscula). Categoría: Pub restaurante. Dirección y sitio web correctos. Teléfono listado: **930 171 200** (confirmar si es el mismo de WhatsApp Business). **Sin horario cargado, sin reseñas/calificación visible, sin fotos.** Botón "Reclamar este negocio" activo → el negocio no lo administra actualmente |
| **WhatsApp Business** | **No verificable remotamente** | Requiere que Jean confirme directamente en la app: catálogo activo, horario configurado, mensaje de bienvenida/ausencia, si el número coincide con el de GBP (930 171 200) |

**Criterio F0 de auditoría (5 activos con métricas numéricas): cumplido parcialmente — 3 de 5** (Instagram y GBP con datos duros, Facebook confirmado en cero; TikTok y WhatsApp Business pendientes de confirmación manual de Jean).

## 5. Criterios de aprobación F0 (booleanos)

- [x] Existe ticket promedio real calculado desde el POS (no el estimado de S/ 25) — **S/ 50.55**, confirmado como venta real
- [ ] **Existe tabla de ventas por día de semana de ≥4 semanas** — NO cumplido: solo ~2.5 semanas de historial y 6 días con actividad
- [ ] **Los 5 activos digitales están auditados con métricas numéricas** — NO cumplido completo: 3/5 (falta TikTok por bloqueo técnico y WhatsApp Business por acceso directo de Jean)
- [x] Horario de fin de semana y margen confirmados por Jean — confirmado (margen parcial/estimado, ver §3)

**F0 no cierra todavía — 2 de 4 criterios pendientes.** Ver §6 para decisión de Jean.

## 6. Bloqueadores y hallazgos para decisión de Jean

1. **Historial de POS insuficiente (bloqueador del criterio de línea base):** opciones — (a) esperar 2-3 semanas más de operación para acumular las 4 semanas que pide el spec antes de fijar metas SMART en F3, o (b) avanzar a F1 con esta línea base preliminar y repetir el corte de ventas al cierre de F0 informalmente antes de F3. D-M1 (fases secuenciales) no obliga a parar todo el plan, pero si se fija una meta SMART en F3 sobre datos de 6 días, el número será poco confiable.
2. **GBP sin reclamar + error de nombre:** acción de bajo costo y alto impacto (S/ 0) — reclamar el perfil, corregir "FInal" → "Final", cargar horario y fotos. Se puede resolver esta semana sin esperar a F1.
3. **TikTok no auditado:** pedir a Jean/content manager captura de seguidores, videos y fecha de última publicación.
4. **WhatsApp Business no auditado:** pedir a Jean confirmar catálogo, horario y si el número es el mismo que aparece en GBP (930 171 200).
5. **Cócteles subvendidos (7 unidades vs. 27 de cerveza):** hallazgo para F2/F3, ya alineado con la hipótesis de upsell del plan maestro §6.

## 7. Fuentes

- Supabase MCP, proyecto `kknvrufoelhdtouprcvm`, tablas `ordenes`, `orden_items`, `pagos`, `clientes`, `items` (consultas SQL 2026-07-09)
- [Instagram @destinofinalrestobar](https://www.instagram.com/destinofinalrestobar/)
- Google Maps, ficha "Destino FInal Restobar" (consultada 2026-07-09)
- Confirmación directa de Jean en chat (2026-07-09): naturaleza de los datos, horario, margen, handles
