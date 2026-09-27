# Spec Maestro — Sistema Final v1.0 (Destino Final · Restobar GS)

**Estado:** 🟡 BORRADOR — pendiente de aprobación de Jean (regla de oro: sin spec aprobado, no hay código)
**Fecha:** 2026-07-09
**Proyecto:** app-restobar-gs · Supabase `kknvrufoelhdtouprcvm` · prod `destinofinal.vercel.app`
**Tipo:** Roadmap v1.0 — ordena lo pendiente + lo nuevo en fases con gates. Cada fase se detalla
en su propio spec-hijo antes de codificar (este archivo es el índice y el contrato de alcance).

---

## 1. Nombre y descripción (una frase)

**Sistema Final v1.0** = consolidar el POS de Destino Final en un producto estable de 4 módulos —
**Control/Operación**, **Clientes/Club DF**, **Inventario/Stock** y **Finanzas/Reportes** — cerrando
primero la deuda técnica de lo ya construido y luego añadiendo los módulos que hoy no existen.

## 2. Alcance

### Entra (lo que v1.0 SÍ incluye)

| # | Módulo | Qué entra |
|---|---|---|
| A | **Control / Operación** | Endurecer lo existente: seguridad (quitar credenciales en claro, revisar `rol_actual()` SECURITY DEFINER), aprobación cruzada entre mozos (M-04 resto), tests Vitest de flujos críticos, reconexión Realtime, PWA instalable estable. |
| B | **Clientes / Club DF** | Cerrar P2 (sembrar `premios` + canje ya desplegado) y P3 (buscar/listar clientes desde POS + historial de puntos/canjes en `/club`). |
| C | **Inventario / Stock** | NUEVO módulo: insumos, stock por ítem, descuento automático al vender, mermas manuales, alertas de reposición. Admin-only. |
| D | **Finanzas / Reportes** | NUEVO módulo: dashboard de ventas por período, desglose por tipo de pago/mozo/categoría, márgenes (usando costo de insumos del módulo C), export contable. Admin-only. |

### No entra (descartado explícito de v1.0)

- App nativa iOS/Android de tienda (se mantiene PWA instalable).
- Multi-local / multi-sucursal (v1.0 es un solo local).
- Facturación electrónica SUNAT / integración con OSE (se evalúa en v2).
- Pasarela de pago online real (Yape/PLIN se registran manualmente como hoy).
- Notificaciones push/WhatsApp automáticas al cliente (fuera de alcance, ver spec Club P3).
- Reservas de mesa y KDS de cocina (backlog v2 — no forman parte de este roadmap).
- Contabilidad de doble partida / conciliación bancaria (Finanzas es reporting, no ERP).

## 3. Modelos de datos

> Estado real actual (verificado en `supabase/schema.sql` + specs Club): tablas existentes
> **`perfiles`, `items`, `mesas`, `ordenes`, `orden_items`, `pagos`, `auditoria`, `clientes`,
> `premios`, `canjes`**. Toda migración nueva es **100 % aditiva + backup previo** (regla R7 vigente).

### Módulo A — Control (sin tablas nuevas)

Se reutiliza `ordenes.mozo`, `perfiles.rol` y `auditoria`. La aprobación cruzada (M-04) añade
**columnas** a `ordenes`, no tablas:

```
ordenes (EXISTENTE — solo columnas)
  + aprobacion_estado  text null check (aprobacion_estado in ('PENDIENTE','APROBADA','RECHAZADA'))
  + aprobacion_por     text null   -- usuario admin que resolvió
  + aprobacion_en      timestamptz null
```

### Módulo B — Club DF (ya especificado en `club-pos-enlace.md`, sin cambios de esquema)

P2/P3 usan tablas ya creadas (`premios`, `canjes`, columnas de `clientes`). Solo faltan **datos**
(lista de premios) y **UI** (búsqueda + historial). Cero migración estructural nueva.

### Módulo C — Inventario (tablas NUEVAS)

```
insumos (NUEVA)
  id uuid PK · nombre text · unidad text (ej. 'ml','und','g') ·
  stock_actual numeric(12,2) not null default 0 ·
  stock_minimo numeric(12,2) not null default 0 ·   -- umbral de alerta
  costo_unitario numeric(10,2) not null default 0 · -- para márgenes (módulo D)
  activo boolean not null default true · creado_en timestamptz default now()

item_insumo (NUEVA — receta: qué consume cada ítem de la carta)
  id uuid PK · item_id uuid FK→items · insumo_id uuid FK→insumos ·
  cantidad numeric(12,2) not null   -- unidades de insumo por 1 unidad vendida del ítem
  unique(item_id, insumo_id)

movimientos_stock (NUEVA — auditoría de todo cambio de stock)
  id uuid PK · insumo_id uuid FK→insumos · tipo text check (tipo in ('VENTA','MERMA','REPOSICION','AJUSTE')) ·
  cantidad numeric(12,2) not null ·   -- negativo = salida, positivo = entrada
  orden_id uuid null FK→ordenes ·     -- si tipo='VENTA'
  motivo text null · usuario text · creado_en timestamptz default now()
```

Regla: al cerrar/pagar una orden, por cada `orden_item` se descuenta stock según `item_insumo`
(un registro `movimientos_stock` tipo `VENTA` por insumo). Ítems sin receta no descuentan.

### Módulo D — Finanzas (SIN tablas nuevas — capa de lectura)

Finanzas v1.0 es **reporting agregado** sobre `ordenes`, `pagos`, `orden_items`, `insumos`
(costos) y `movimientos_stock`. Se implementa con **vistas SQL / RPCs de solo lectura**
(ej. `reporte_ventas_periodo`, `reporte_margenes`), no con tablas transaccionales nuevas.
Esto evita duplicar la verdad y respeta "producción intocable".

## 4. Planificación ordenada (fases con gate — nunca dejar la app rota a medio paso)

Cada fase es un incremento completo, testeable y desplegable por sí solo. No se pasa de fase
sin cerrar su gate (criterios de la §5 en verde + verificado contra BD real, D-003).

| Fase | Nombre | Depende de | Entregable | Gate |
|---|---|---|---|---|
| **F0** | Endurecer Control (seguridad + calidad) | — | Credenciales fuera del cliente, `rol_actual()` revisado, tests Vitest de flujos críticos (orden→cobro→cierre), reconexión Realtime, PWA instalable estable | Sin credenciales en el bundle · tests verdes · advisors Supabase sin high-risk |
| **F1** | Cerrar Club DF (P2 + P3) | Lista de premios de Jean | `premios` sembrados · buscar/listar clientes desde POS · historial de puntos/canjes en `/club` | Canje descuenta puntos correctamente · búsqueda devuelve cliente real · historial visible |
| **F2** | Aprobación cruzada entre mozos (M-04 resto) | F0 (auth real ya activo) | Mozo finaliza mesa de otro → queda `PENDIENTE` → admin aprueba/rechaza → se registra en `auditoria` | Flujo aprobar/rechazar verificado e2e · nada se cobra sin aprobación |
| **F3** | Inventario (base) | — | Tablas `insumos`/`item_insumo`/`movimientos_stock` · CRUD de insumos y recetas (admin) · descuento automático al vender · mermas/ajustes manuales · alerta de stock mínimo | Vender ítem con receta baja stock exacto · merma registra movimiento · alerta aparece bajo mínimo |
| **F4** | Finanzas / Reportes | F3 (para márgenes) | Vistas/RPCs de ventas por período, desglose (pago/mozo/categoría), margen bruto, export contable | Totales cuadran con `pagos` reales · margen = venta − costo insumos · export abre en Excel |
| **F5** | Cierre v1.0 | F0–F4 | Regresión completa · docs (`context.md`/`progress.md`) · deploy prod estable · tag `v1.0` | Todos los gates previos verdes · prod HTTP 200 · changelog cerrado |

**Orden recomendado:** F0 → F1 → F2 → F3 → F4 → F5. F1 puede adelantarse/paralelizarse porque
solo depende de un insumo tuyo (lista de premios), no de código de otras fases.

## 5. Criterios de aprobación (booleanos concretos — verdadero/falso, sin "se ve bien")

### F0 — Endurecer Control
- [ ] `grep` del bundle de prod NO contiene contraseñas ni claves de servicio en claro.
- [ ] `rol_actual()` revisada: o deja de ser SECURITY DEFINER, o su búsqueda de rol está acotada por `auth.uid()` (documentado).
- [ ] Advisor de Supabase de "leaked password protection" resuelto o aceptado por escrito con motivo.
- [ ] Existen tests Vitest que cubren: crear orden, cobro parcial, finalizar, cierre de día — y pasan en CI local (`npm run test` verde).
- [ ] Al perder conexión y recuperarla, Realtime re-sincroniza mesas sin recargar la página (verificado en vivo).
- [ ] PWA se instala en móvil y abre offline la carta (verificado en dispositivo/emulador).

### F1 — Club DF (P2+P3)
- [ ] Tabla `premios` con ≥1 premio activo sembrado desde la lista de Jean.
- [ ] Canje: `puntos` baja y `puntos_usados` sube exactamente el costo; fila en `canjes` con fecha/mozo (SELECT lo confirma).
- [ ] POS lista/busca clientes por nombre o WhatsApp y muestra saldo real.
- [ ] `/club` muestra historial de puntos ganados y canjes del cliente.

### F2 — Aprobación cruzada
- [ ] Mozo A finaliza mesa de Mozo B → orden queda `aprobacion_estado='PENDIENTE'`, NO se marca pagada.
- [ ] Admin ve la solicitud, la aprueba → orden se cierra normalmente; la rechaza → orden vuelve a ABIERTA de Mozo B.
- [ ] Cada resolución deja fila en `auditoria` (quién aprobó/rechazó, cuándo, mesa).

### F3 — Inventario
- [ ] Backup de tablas afectadas creado antes de la migración; conteos pre/post de `ordenes`/`pagos` idénticos.
- [ ] Vender un ítem con receta de N insumos genera N filas `movimientos_stock` tipo `VENTA` y baja `stock_actual` en la cantidad exacta.
- [ ] Ítem SIN receta: la venta NO genera movimientos ni error.
- [ ] Merma/ajuste manual registra movimiento con motivo y actualiza stock.
- [ ] Insumo con `stock_actual < stock_minimo` aparece en la lista de alertas de reposición.
- [ ] Anular una orden NO deja stock descontado (o lo repone) — verificado por SELECT.

### F4 — Finanzas
- [ ] La suma de ventas del reporte por período == suma de `pagos` de ese período (cuadre exacto).
- [ ] Desglose por tipo de pago, por mozo y por categoría suma el mismo total.
- [ ] Margen bruto de un ítem == precio de venta − Σ(costo_unitario × cantidad de su receta).
- [ ] Export genera un archivo que abre en Excel con los totales del período visible.

### F5 — Cierre v1.0
- [ ] Todos los gates F0–F4 en verde.
- [ ] `context.md` y `progress.md` actualizados con el ciclo cerrado.
- [ ] Prod responde HTTP 200 y el bundle desplegado contiene los 4 módulos (grep de verificación).
- [ ] Tag `v1.0` creado en git.

## 6. Decisiones tomadas y descartadas

| # | Decisión | Elegido | Descartado | Razón |
|---|---|---|---|---|
| DM-01 | ¿Refactor total o incremental? | **Incremental sobre la base actual** | Reescritura desde cero | La base ya está en prod y verificada; reescribir arriesga romper cobros reales. |
| DM-02 | ¿Finanzas con tablas propias o vistas? | **Vistas/RPCs de solo lectura** | Tablas transaccionales de finanzas | Evita duplicar la verdad; `pagos`/`ordenes` ya son la fuente única. Menos riesgo de descuadre. |
| DM-03 | ¿Inventario por ítem simple o por receta de insumos? | **Receta (`item_insumo`)** | Stock plano por ítem de carta | Un cóctel consume varios insumos; la receta permite márgenes reales (módulo D) y mermas por insumo. |
| DM-04 | ¿Descuento de stock cuándo? | **Al cerrar/pagar la orden** | Al agregar el ítem a la mesa | Evita descontar por ítems que luego se anulan o se quitan de una mesa abierta. |
| DM-05 | ¿Módulos nuevos abiertos a mozos? | **Inventario y Finanzas admin-only** | Acceso de mozo a stock/finanzas | Reduce superficie de error y fuga de datos sensibles; el mozo opera mesas, no caja. |
| DM-06 | ¿Multi-local en v1.0? | **No (un solo local)** | Diseñar multi-sucursal ya | Nadie lo pidió aún; añadiría `local_id` a todo el esquema sin beneficio inmediato. Se difiere a v2. |
| DM-07 | ¿Facturación SUNAT en v1.0? | **Fuera de alcance** | Integrar OSE ahora | Alta complejidad regulatoria; v1.0 prioriza operación + clientes + control interno. |
| DM-08 | Orden de fases | **F0 (endurecer) primero** | Empezar por módulos nuevos | Cerrar deuda de seguridad/tests antes de ampliar superficie evita construir sobre base frágil. |

## 7. Insumos pendientes de Jean (desbloquean fases)

- **F1:** lista inicial de **premios** (nombre + costo en puntos). *(Ya señalado en `club-pos-enlace.md` §9.)*
- **F3:** lista de **insumos** con unidad y **costo unitario**, y la **receta** de al menos los cócteles
  (qué insumo y cuánto consume cada uno). Sin esto, Inventario arranca con esquema pero sin datos reales.
- **F4:** confirmar qué **columnas** quieres en el export contable (¿formato para tu contador?).

## 8. Notas de proceso (harness)

- Regla de oro: este spec maestro se aprueba primero; cada fase (F0–F5) genera su **spec-hijo**
  detallado antes de escribir código, siguiendo esta misma anatomía de 6 puntos.
- D-003 vigente: ninguna migración cuenta como hecha hasta verificarse contra la BD real.
- R7 vigente: toda migración es aditiva + backup previo; nada registrado (cobros/órdenes/pagos) se altera.
