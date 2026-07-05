# Spec — Enlace Club DF ↔ POS (puntos por consumo y canje de premios)

**Estado:** ✅ APROBADO por Jean (2026-07-05) — "empieza P1 y P2; imperativo que nada en prod se rompa"
**Fecha:** 2026-07-05
**Criterios fuente:** `specs/criterios_aceptacion-fase2-app-dfClub.md` (documentados por Jean)
**Proyecto:** app-restobar-gs · Supabase `kknvrufoelhdtouprcvm` · prod `destinofinal.vercel.app`

---

## 1. Objetivo

Enlazar los clientes registrados en el **Club DF** (`/club`) con los pedidos por mesa del **POS**
(`/app`): al cerrar una mesa, el mozo puede vincular el consumo a un cliente para que acumule
puntos, consultar su saldo, y (fase P2) canjear premios descontando puntos.

## 2. Reglas de negocio (decididas por Jean · 2026-07-05)

| # | Regla | Decisión |
|---|---|---|
| R1 | Valor del punto | **1 sol de consumo = 1 punto**, redondeo **hacia arriba** (S/ 15.50 → 16 pts) |
| R2 | Bono de bienvenida | **Se mantiene: 50 pts** al registrarse (por `/club` o registro rápido del mozo) |
| R3 | WhatsApp no registrado al cerrar mesa | **Registro rápido por el mozo** (nombre + WhatsApp, mismo bono de 50 pts) |
| R4 | Vincular cliente a la mesa | **Opcional** — input al cerrar; sin número, la mesa cierra igual que hoy |
| R5 | Identidad del cliente | PK interna `id` (uuid, ya existe); WhatsApp es llave `unique` **editable** (el cliente puede cambiar de número sin perder historial) |
| R6 | Premio canjeado en la mesa | Entra al consumo con **precio S/ 0.00** (se paga con puntos, no infla el total a cobrar); los puntos se acumulan solo sobre lo pagado en soles |
| R7 | Producción intocable | **Nada de lo registrado (cobros/órdenes/pagos) se borra ni se altera.** Migraciones 100 % aditivas + **backup previo** de las tablas afectadas |
| R8 | Texto de la tarjeta `/club` | Se actualiza a la regla nueva: "Cada sol consumido = 1 punto" (reemplaza "cada compra suma 50 pts") |

## 3. Modelo de datos (aditivo)

```
clientes (EXISTENTE — solo se agregan columnas)
  + puntos_historicos  integer not null default 0   -- todo lo ganado, nunca baja
  + puntos_usados      integer not null default 0   -- todo lo canjeado
  -- `puntos` (existente) sigue siendo el SALDO actual: historicos - usados (+ bonos)

premios (NUEVA)                          ← "ItemPremio" de los criterios
  id uuid PK · nombre text · costo_puntos integer · activo boolean default true · creado_en

canjes (NUEVA)                           ← registro de cada canje (fecha + puntos, criterio APP-2)
  id uuid PK · cliente_id FK→clientes · premio_id FK→premios ·
  orden_id FK→ordenes (nullable) · puntos integer · mozo text · creado_en timestamptz

ordenes (EXISTENTE — solo se agrega columna)
  + cliente_id uuid nullable FK→clientes.id
```

**Backup previo a cada migración (R7):** copia de seguridad de `clientes` y `ordenes`
(tablas `_backup_YYYYMMDD` en el mismo esquema) antes de aplicar cambios. D-003 vigente:
la migración no cuenta como hecha hasta verificarse contra la base real.

## 4. Flujos

### F1 — Cerrar mesa con cliente (P1)
1. Mozo pulsa cerrar/finalizar mesa → aparece input opcional **"WhatsApp del cliente"**.
2. Al digitar 9 dígitos, el POS busca al cliente → muestra **nombre + puntos actuales** (criterio APP-3).
3. Si no existe → mini-formulario de **registro rápido** (nombre + número) → se crea con bono 50 pts.
4. Al confirmar el pago del saldo, la orden queda vinculada (`ordenes.cliente_id`) y el cliente
   acumula `ceil(total_pagado_en_soles)` puntos (`puntos` y `puntos_historicos` suben).
5. Sin número ingresado → flujo actual intacto, cero fricción.

### F2 — Canje de premio (P2)
1. En la mesa, mozo abre **"Premios Club DF"** → lista de `premios` activos con costo en puntos.
2. Solo se habilita si la mesa ya tiene cliente vinculado **y** su saldo ≥ costo del premio.
3. Selecciona 1 premio → entra a la orden como ítem S/ 0.00 marcado "🎁 Canje".
4. Al finalizar la mesa: se inserta fila en `canjes` (fecha, puntos, mozo), `puntos` baja,
   `puntos_usados` sube. Si la mesa se anula, el canje no se ejecuta (no se descuentan puntos).

### F3 — Consulta de saldo (P1)
El mismo input de WhatsApp (o el panel de mesa con cliente vinculado) muestra nombre + saldo
para que el mozo informe al cliente (criterio APP-3).

## 5. Fases y prioridad

| Fase | Alcance | Estado |
|---|---|---|
| **P1** | Migración (backup + columnas + tablas + RPCs de acumulación) · input WhatsApp al cerrar mesa · registro rápido · acumulación `ceil(soles)` · consulta de saldo · texto nuevo en tarjeta `/club` | especificada — lista para plan |
| **P2** | Catálogo `premios` + selección de premio en mesa + descuento de puntos + registro en `canjes` | especificada — **bloqueada por insumo: lista inicial de premios con costos (Jean)** |
| **P3** | Listar/buscar clientes desde el POS (criterio APP-1.1) · historial de puntos/canjes en la tarjeta `/club` | diferida — se especifica al cerrar P2 |

## 6. Criterios de aceptación

### P1
- [ ] Backup de `clientes` y `ordenes` creado y verificado ANTES de la migración.
- [ ] Migración aplicada y verificada contra la BD real (D-003); **cero filas alteradas o
      borradas** en `ordenes`, `pagos`, `orden_items` (conteos idénticos pre/post).
- [ ] Cerrar mesa SIN número → comportamiento idéntico al actual.
- [ ] Cerrar mesa CON número registrado → `ordenes.cliente_id` seteado; cliente suma
      `ceil(total)` puntos en `puntos` y `puntos_historicos` (verificado por SELECT).
- [ ] Redondeo: mesa de S/ 15.50 → 16 puntos exactos.
- [ ] Número no registrado → registro rápido crea cliente con 50 pts de bono + acumula el consumo.
- [ ] Mozo ve nombre + saldo del cliente antes de confirmar.
- [ ] Tarjeta `/club` muestra la regla nueva (1 sol = 1 punto) y el saldo real del cliente.
- [ ] Mesa anulada NO suma puntos.

### P2
- [ ] Premio solo canjeable con cliente vinculado y saldo suficiente.
- [ ] Canje ejecutado → fila en `canjes` con fecha/puntos/mozo; `puntos` baja y `puntos_usados`
      sube exactamente el costo del premio; ítem S/ 0.00 visible en el detalle de la orden.
- [ ] Mesa anulada → canje revertido/no ejecutado (puntos intactos).
- [ ] El premio NO suma puntos (solo el consumo pagado en soles).

## 7. Fuera de alcance (esta feature)

- Acumulación retroactiva sobre órdenes históricas.
- Notificaciones al cliente (WhatsApp/SMS) al ganar o canjear puntos.
- Panel admin de gestión de premios (P2 usa seed; el CRUD llega después si se pide).

## 8. Preguntas resueltas por Jean

- Regla de puntos: **1 sol = 1 punto, ceil** ✅ (2026-07-05)
- No registrado: **registro rápido por mozo** ✅
- Bono bienvenida: **se mantiene 50 pts** ✅
- Fases: **P1→P2→P3 con backup de datos** ✅

## 9. Insumo pendiente (bloquea P2, no P1)

- **Lista inicial de premios**: nombre + costo en puntos de cada uno (ej. "Cóctel a elección — 100 pts").
