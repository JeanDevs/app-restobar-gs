# Spec — Inventario / Stock (control de existencias y descuento por venta)

**Estado:** 🟡 BORRADOR — pendiente de aprobación de Jean
**Fecha:** 2026-07-22
**Proyecto:** app-restobar-gs · Supabase `kknvrufoelhdtouprcvm` · prod `destinofinal.vercel.app`
**Defaults adoptados (ajustables por Jean):** alcance = solo comprados/embotellados · descuento = al agregar a la mesa · stock 0 = advertir, no bloquear

---

## 1. Objetivo

Controlar las existencias de los productos comprados (cervezas, gaseosas, aguas, cigarros):
saber cuánto hay, **descontar automáticamente al vender**, devolver al quitar/anular, y
**avisar cuando algo está por acabarse**. Objetivo de negocio: controlar merma y robo, y no
vender lo que no hay.

## 2. Reglas de negocio (defaults · confirmar con Jean)

| # | Regla | Decisión (default) |
|---|---|---|
| R1 | Alcance | Solo ítems marcados `controla_stock = true`. Arranca con **comprados/embotellados**; cócteles y comida quedan fuera (P3 con recetas de insumos) |
| R2 | Momento del descuento | **Al agregar el ítem a la mesa** (refleja producto comprometido). Se devuelve al **quitar** el ítem o **anular** la mesa |
| R3 | Stock en cero | **Advertir, no bloquear** — el POS muestra "Agotado" pero permite vender igual (el stock puede estar desactualizado; manda el mozo) |
| R4 | Unidad | Por presentación vendible (D-D): cada ítem es su propia unidad de stock (`Cerveza (3 und)` descuenta 1 de su propio stock, no 3 de "Cerveza") |
| R5 | Quién ajusta | Solo **ADMIN** ingresa stock / registra merma / ajusta (RLS `rol_actual() = 'ADMIN'`) |
| R6 | Producción intocable | Migraciones 100 % aditivas + **backup previo** de `items` (`_backup_items_YYYYMMDD`). Cero filas alteradas en `ordenes`/`orden_items`/`pagos` |
| R7 | Trazabilidad | Todo cambio de stock deja fila en `movimientos_stock` (libro inmutable: sin update/delete) |

## 3. Modelo de datos (aditivo)

```
items (EXISTENTE — solo se agregan columnas)
  + controla_stock  boolean not null default false
  + stock_actual    numeric(10,2) not null default 0
  + stock_min       numeric(10,2) not null default 0   -- umbral de alerta
  + unidad          text not null default 'und'

movimientos_stock (NUEVA — libro inmutable)
  id uuid PK · item_id FK→items ·
  tipo text check in ('COMPRA','VENTA','AJUSTE','MERMA','DEVOLUCION') ·
  cantidad numeric(10,2)          -- positiva; el signo lo da el `tipo`
  stock_resultante numeric(10,2)  -- stock después del movimiento (snapshot)
  orden_id uuid nullable FK→ordenes · motivo text nullable ·
  usuario text · creado_en timestamptz default now()
```

**Backup previo (R6):** `_backup_items_YYYYMMDD` antes de la migración. La migración no cuenta
como hecha hasta verificarse contra la BD real (conteos idénticos en `orden_items`/`ordenes`).

## 4. Backend (RPCs · SECURITY DEFINER, gateadas por rol)

- `ajustar_stock(p_item_id, p_cantidad, p_tipo, p_motivo)` — **ADMIN**. Inserta movimiento +
  actualiza `items.stock_actual` de forma atómica. Cubre COMPRA / AJUSTE / MERMA.
- **Auto-descuento (R2):** *trigger* en `orden_items`:
  - `AFTER INSERT`: si `items.controla_stock` → resta `cantidad`, inserta movimiento `VENTA`.
  - `AFTER DELETE`: → suma `cantidad`, inserta movimiento `DEVOLUCION`.
- **Anulación:** *trigger* en `ordenes` `AFTER UPDATE` cuando `estado → 'ANULADA'` → devuelve el
  stock de todos sus `orden_items` con `controla_stock` (movimientos `DEVOLUCION`).
- RLS: `movimientos_stock` → insert/select para autenticados (el trigger corre como definer);
  lectura del panel de movimientos solo ADMIN.

## 5. Flujos

### F1 — Ingresar stock / compra (P1, admin)
Admin → Gestionar menú → ítem → "Ingresar stock" (cantidad + motivo) → `ajustar_stock(COMPRA)`.

### F2 — Ajuste / merma (P1, admin)
Admin registra merma o corrección de conteo → `ajustar_stock(MERMA|AJUSTE)` con motivo obligatorio.

### F3 — Venta descuenta stock (P2, automático)
Mozo agrega ítem a la mesa → trigger descuenta y registra `VENTA`. Quitar ítem o anular mesa → `DEVOLUCION`.

### F4 — Alerta de bajo stock (P1)
Resumen admin muestra "N productos bajo stock" (`stock_actual <= stock_min`); badge en la lista del menú.

### F5 — Visibilidad para el mozo (P2)
Al agregar, el buscador muestra stock disponible / "Agotado" (advierte, no bloquea — R3).

## 6. Fases y prioridad

| Fase | Alcance | Estado |
|---|---|---|
| **P1** | Migración (backup + columnas + `movimientos_stock` + `ajustar_stock`) · UI admin: toggle controla_stock, stock/mínimo, ingresar stock, merma/ajuste · alerta de bajo stock en Resumen | especificada |
| **P2** | Triggers de auto-descuento (venta) + devolución (quitar/anular) · panel de movimientos (admin) · visibilidad de stock para el mozo | especificada |
| **P3** | Compras unificadas (entrada de stock ligada a gasto — puente con módulo Caja) · recetas de insumos para cócteles/comida | diferida |

## 7. Criterios de aceptación

### P1
- [ ] Backup de `items` creado y verificado ANTES de la migración.
- [ ] Migración aplicada y verificada contra la BD real; cero filas alteradas en `ordenes`/`orden_items`/`pagos`.
- [ ] Admin puede marcar `controla_stock`, fijar stock inicial y mínimo por ítem.
- [ ] `ajustar_stock(COMPRA)` sube el stock y deja movimiento con `stock_resultante` correcto.
- [ ] Merma/ajuste exige motivo y queda registrada.
- [ ] Resumen admin muestra el conteo de productos con `stock_actual <= stock_min`.
- [ ] Ítems sin `controla_stock` funcionan idéntico a hoy (cócteles, comida).

### P2
- [ ] Agregar un ítem con stock a la mesa descuenta exactamente su cantidad (movimiento `VENTA`).
- [ ] Quitar el ítem o anular la mesa devuelve la misma cantidad (movimiento `DEVOLUCION`).
- [ ] El stock nunca se descuenta dos veces por la misma línea (verificado por libro de movimientos).
- [ ] El mozo ve stock/"Agotado" al agregar; con stock 0 **advierte pero deja vender** (R3).

## 8. Fuera de alcance (esta feature)

- Recetas de insumos / bill of materials para cócteles y comida (P3).
- Proveedores como entidad (P3, junto con compras).
- Costeo (margen por producto) — vive en el módulo Caja / Reportes.
- Inventario multi-almacén o multi-sucursal.

## 9. Preguntas pendientes (Jean)

- Confirmar los 4 defaults (alcance, momento de descuento, stock 0, quién ajusta).
- ¿Sembramos el stock inicial de cada producto ahora, o arranca en 0 y se ingresa con la primera compra?
