# Plan de mejoras — Restobar GS

> Backlog de cambios pedidos por Jean. Estado general en `context.md`.

---

## ✅ Implementado (2026-06-21)

### M-01 · Tipos de pago: Tarjeta + PLIN — **HECHO**
- Tipos de pago ahora: **Yape · PLIN · Efectivo · Tarjeta** (se corrigió "Plan" → **PLIN**, se agregó **Tarjeta**).
- Afecta `TipoPago`, `TIPOS_PAGO`, `FinalizarModal`, badges del historial, `useReportes`, `schema.sql`.

### M-03 · Venta en barra (sin mesa) — **HECHO**
- Botón **🍸 Barra** en el selector (solo visible para el **admin**). La orden de barra usa `mesa_numero = 0`
  y se muestra como **"Barra"** en toda la app (orden, modales, historial, export). No se crearon usuarios nuevos.

### M-05 · Exportar a Excel solo el admin — **HECHO**
- El historial del **mozo** ya no tiene botón de exportar; el export queda solo en el panel admin.

### M-06 · Botón "Cerrar día" (solo admin) — **HECHO**
- Botón **🧾 Cerrar día** en el Resumen admin → modal con **corte de caja** (fecha, # pedidos, total,
  desglose por tipo de pago). Al confirmar, marca las órdenes del día (`dia_cerrado`) → los contadores de
  "hoy" se reinician y el **historial completo se conserva**.

### M-08 · Nombre de comensal — **HECHO**
- Campo **Comensal** (opcional) al tomar el pedido. Se muestra en el título de la orden, en los modales de
  cierre, en el historial (bajo el origen) y en el detalle + export. Nuevo campo `comensal` en `ordenes`.

### M-09 · Botón "Agregar" en la parte superior — **HECHO**
- El botón de **Agregar** (commit del carrito) ahora está en la **parte superior** del módulo, antes de la
  lista "Por agregar" y del buscador.

### M-07 · Separar Inka Cola y Coca Cola — **HECHO**
- Ahora son 4 ítems independientes: **Inka Cola (500 mL)**, **Coca Cola (500 mL)**, **Inka Cola (1.5 L)**,
  **Coca Cola (1.5 L)** (mismos precios). Carta: 22 → **24 ítems**. Afecta `seed.ts` y `seed.sql`.

### M-10 · (Móvil) "Orden actual" arriba — **HECHO**
- En **móvil** el módulo **Orden actual** (Guardar/Finalizar/Cobro parcial/Anular) va **arriba** del módulo
  Agregar. En **desktop** se mantiene en dos columnas (Agregar izq · Orden actual der). Vía Tailwind `order`.

### M-12 · Cobro parcial (antes M-02) — **HECHO** *(D-E)*
- Se puede **cobrar ítems puntuales antes de cerrar la mesa**, con su propio tipo de pago. La orden sigue
  **ABIERTA** con **saldo pendiente**; admite **varios tipos de pago por sesión** (ej. gaseosa con Yape,
  cerveza con Efectivo). Al finalizar se salda solo lo pendiente. Nueva tabla `pagos` + `pagado` en `ordenes`
  y `orden_items.pagado`. Un ítem ya cobrado no se puede quitar. Reportes reparten por `pago.tipo_pago`.
  **Verificado:** orden S/20 → Yape S/5 (25%) + Efectivo S/15 (75%) en el resumen.

### M-13 · Anular mesa con consumo — **HECHO** *(D-F)*
- Botón **Anular mesa**: exige **clave de admin + motivo obligatorio**; marca la orden `ANULADA`, libera la
  mesa y la **excluye de ventas** (badge "Anulada" en historial). Queda en **auditoría**. Clave incorrecta →
  se rechaza y el modal queda abierto. **Verificado** (clave mala rechazada · clave correcta anula + log).

### M-11 · Cierre de día con clave + auditoría — **HECHO** *(D-G)*
- **Cerrar día** ahora exige **re-ingresar la clave del admin** (sin usuario nuevo) y deja **registro de
  auditoría** (quién, total, # pedidos). **Verificado:** desglose correcto (Yape 5 + Efectivo 15), reinicia
  "hoy" a 0, log creado. Nueva pestaña **🔒 Auditoría** en el panel admin (solo lectura, solo admin).

### M-04 · Permisos por mozo — **PARCIAL (versión light)**
- **Hecho (mock):** un **mozo** no puede Finalizar/Cobrar/Anular la mesa de **otro mozo** (se bloquea con
  nota "Mesa de otro mozo"); el **admin** nunca se bloquea. Agregar ítems sí se permite.
- **Pendiente (Fase 2):** identidad real vía Supabase Auth + el flujo "un mozo finaliza la mesa de otro
  **con notificación al admin para aprobar**". El campo `mozo` ya existe en `ordenes`.

---

## ⏳ Pendientes

### M-04 (resto) · Aprobación cruzada entre mozos
- Requiere Auth real (Fase 2): un mozo opera la mesa de otro enviando **notificación al admin para aprobar**.

---

_Última actualización: 2026-06-21._
