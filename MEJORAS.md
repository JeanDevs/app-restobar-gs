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

---

## ⏳ Pendientes

### M-02 · Pago previo de un ítem (pago parcial)
- **Qué:** un cliente puede **pagar un ítem en particular antes de cerrar la mesa**.
- **Por qué:** alguien se va antes y paga solo lo suyo; el resto sigue en la mesa abierta.
- **A contemplar:** marcar ítems de la orden como "ya pagados" (con su tipo de pago), que no se vuelvan a
  cobrar al cerrar; el total final solo suma lo pendiente. Afecta `orden_items` (estado/pago por línea) y el cierre.

### M-04 · Permisos de finalización por mozo
- **Qué:** **solo el mozo dueño** puede guardar/finalizar su propia mesa. El **admin** puede en nombre del mozo.
  Un mozo **NO** puede finalizar pedidos de **otro** mozo.
- **Futuro:** permitir que un mozo finalice la mesa de otro, **enviando una notificación al admin para aprobar**.
- **Depende de:** identidad real del mozo (Fase 2, Supabase Auth). El campo `mozo` ya existe en `ordenes`.

### M-07 · Separar Inka Cola y Coca Cola *(para después)*
- **Qué:** hoy están como un solo ítem (`Inka Cola / Coca Cola`). Separarlos en **ítems independientes** por
  presentación (500 mL y 1.5 L) para **saber cuál vende más**.
- **Prioridad:** baja ("para después"). Afecta la semilla de `items` y la carta.

---

_Última actualización: 2026-06-21._
