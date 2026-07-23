# Spec — Caja (gastos + arqueo de efectivo)

**Estado:** 🟡 BORRADOR — pendiente de aprobación de Jean
**Fecha:** 2026-07-22
**Proyecto:** app-restobar-gs · Supabase `kknvrufoelhdtouprcvm` · prod `destinofinal.vercel.app`
**Defaults adoptados (ajustables por Jean):** solo ADMIN registra gastos · fondo de caja opcional (default 0)

---

## 1. Objetivo

Registrar los **egresos** del negocio (compras, sueldos, servicios) y **cuadrar la caja** al
cierre del día (efectivo esperado vs. contado), para ver el **margen real** — no solo ingresos.
Enriquece el "Cierre de día" actual (D-G), sin reemplazarlo.

## 2. Reglas de negocio (defaults · confirmar con Jean)

| # | Regla | Decisión (default) |
|---|---|---|
| R1 | Quién registra | Solo **ADMIN** registra gastos y cierra caja (datos sensibles). El mozo no ve gastos |
| R2 | Fondo de caja | **Opcional** (default 0). Si se usa: efectivo esperado = fondo + ventas efectivo − gastos efectivo |
| R3 | Día operativo | Un gasto pertenece al día en curso (mismo criterio que el "Cierre de día" existente) |
| R4 | Cierre existente | El "Cierre de día" (clave admin + auditoría) se mantiene; se le **agrega el arqueo** (esperado vs contado) |
| R5 | Ventas efectivo | Se calculan de `pagos` con `tipo_pago = 'Efectivo'` del día (fuente ya existente, reutiliza `EstadisticasPanel`) |
| R6 | Producción intocable | Migraciones 100 % aditivas; ninguna tabla existente se modifica en su data |
| R7 | Inmutabilidad | `cierres_caja` no se edita ni borra (registro contable); un gasto se puede anular con motivo, no borrar (P2) |

## 3. Modelo de datos (aditivo)

```
gastos (NUEVA)
  id uuid PK · categoria text check in ('COMPRA','SUELDO','SERVICIOS','ALQUILER','OTRO') ·
  descripcion text · monto numeric(10,2) check (monto >= 0) ·
  metodo_pago text check in ('Efectivo','Yape','PLIN','Tarjeta','Transferencia') ·
  proveedor text nullable · item_id uuid nullable FK→items  (si es compra de stock — puente Inventario) ·
  usuario text · anulado boolean default false · motivo_anulacion text nullable ·
  creado_en timestamptz default now()

cierres_caja (NUEVA — arqueo, inmutable)
  id uuid PK · usuario text ·
  fondo_inicial numeric(10,2) default 0 ·
  ventas_efectivo numeric(10,2) · ventas_digital numeric(10,2) ·
  gastos_efectivo numeric(10,2) ·
  efectivo_esperado numeric(10,2) ·   -- fondo + ventas_efectivo − gastos_efectivo
  efectivo_contado numeric(10,2) ·     -- lo que el admin cuenta físicamente
  diferencia numeric(10,2) ·           -- contado − esperado (sobrante/faltante)
  notas text nullable · creado_en timestamptz default now()
```

**RLS:** `gastos` y `cierres_caja` → select/insert solo **ADMIN** (`rol_actual() = 'ADMIN'`).
Sin update/delete sobre `cierres_caja`. Backup no requerido (tablas nuevas), pero la migración
se verifica contra la BD real antes de darse por hecha.

## 4. Backend (RPCs · SECURITY DEFINER, ADMIN)

- `registrar_gasto(p_categoria, p_descripcion, p_monto, p_metodo, p_proveedor, p_item_id)` — inserta gasto.
  Si `p_item_id` viene → además llama `ajustar_stock(COMPRA)` (puente con Inventario, P3).
- `registrar_cierre_caja(p_fondo, p_efectivo_contado, p_notas)` — calcula `ventas_efectivo`,
  `ventas_digital` (de `pagos` del día), `gastos_efectivo` (de `gastos` del día), deriva
  `efectivo_esperado` y `diferencia`, inserta `cierres_caja` y deja fila en `auditoria`
  (`accion = 'CIERRE_DIA'`, ya existe). Reutiliza el flujo de clave admin actual.

## 5. Flujos

### F1 — Registrar gasto (P1, admin)
Admin → pestaña 💰 Caja → "Registrar gasto" (categoría, monto, método, descripción) → `registrar_gasto`.

### F2 — Utilidad del día (P1)
Resumen muestra **Ingresos − Gastos = Utilidad** del día (los ingresos ya se calculan hoy).

### F3 — Arqueo al cerrar (P2)
Al "Cerrar día": el modal muestra fondo (editable), efectivo esperado (calculado) e input de
**efectivo contado** → muestra la **diferencia** (sobrante/faltante) → confirma con clave admin
→ `registrar_cierre_caja` + auditoría.

### F4 — Historial de cierres (P2)
Admin ve los cierres de caja pasados (fecha, esperado, contado, diferencia) — para detectar faltantes.

## 6. Fases y prioridad

| Fase | Alcance | Estado |
|---|---|---|
| **P1** | Migración (`gastos` + RPC `registrar_gasto` + RLS admin) · pestaña 💰 Caja: registrar/listar gastos del día · **Utilidad = ingresos − gastos** en Resumen | especificada |
| **P2** | `cierres_caja` + `registrar_cierre_caja` · **arqueo** (fondo + esperado vs contado + diferencia) integrado al "Cerrar día" · historial de cierres · anular gasto con motivo | especificada |
| **P3** | "Registrar compra" unificada (gasto + entrada de stock) — puente con módulo Inventario · gastos por categoría / margen por día (cruza con Reportes) | diferida |

## 7. Criterios de aceptación

### P1
- [ ] Migración `gastos` aplicada y verificada; ninguna tabla existente alterada.
- [ ] Solo el ADMIN ve y registra gastos; el mozo no accede a la pestaña Caja (RLS + UI).
- [ ] Registrar un gasto lo lista en el día y suma al total de gastos.
- [ ] Resumen muestra Utilidad = ingresos − gastos, coherente con los datos del día.

### P2
- [ ] "Cerrar día" muestra efectivo esperado = fondo + ventas efectivo − gastos efectivo.
- [ ] El admin ingresa el efectivo contado y el sistema muestra la diferencia con signo.
- [ ] Al confirmar (clave admin), se guarda `cierres_caja` + fila en `auditoria`.
- [ ] El cierre reinicia el día igual que hoy (comportamiento actual intacto).
- [ ] Historial de cierres visible para el admin.

## 8. Fuera de alcance (esta feature)

- Facturación / boleta electrónica SUNAT (módulo aparte).
- Nómina/planilla detallada (los sueldos entran como gasto simple).
- Conciliación bancaria de pagos digitales.
- Reportes multi-día avanzados (viven en el módulo Reportes).

## 9. Preguntas pendientes (Jean)

- Confirmar: ¿solo admin registra gastos, o el mozo puede registrar compras menores?
- ¿Manejan fondo de caja / caja chica inicial cada día? (default: opcional, 0).
- Categorías de gasto: ¿las 5 propuestas (Compra/Sueldo/Servicios/Alquiler/Otro) bastan?
