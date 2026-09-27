# Spec — Admin Club DF + contador de pagos parciales en historial

**Estado:** ⏳ pendiente de aprobación de Jean
**Fecha:** 2026-07-05
**Proyecto:** app-restobar-gs · continúa `specs/club-pos-enlace.md` (P1+P2 ya en prod)

## 1. Objetivo

1. **Admin Club DF:** el admin gestiona el club desde su panel — clientes y sus puntos,
   premios (crear/activar/desactivar) y registro de canjes.
2. **Parciales visibles:** las mesas abiertas con cobros parciales aparecen en el historial
   como "⏳ Pendiente de cierre" con un contador de lo cobrado; al finalizar, la fila pasa a
   mostrar la suma total como cualquier orden cerrada.

## 2. Decisiones de Jean (2026-07-05)

| # | Decisión |
|---|---|
| R1 | Admin: **pestaña Club DF completa** (clientes + gestión de premios + canjes) |
| R2 | "Ventas de hoy" NO cambia: los parciales van en **contador aparte** ("Pendiente de cierre") |
| R3 | El cierre de mesa con club ya sirve al admin (panel compartido) — solo se verifica |
| R4 | Nada en producción se rompe: cambios de BD = ninguno nuevo (las políticas RLS admin de `clientes`, `premios` y `canjes` ya existen desde la migración anterior) |

## 3. Alcance

### F1 · Pestaña "⭐ Club DF" en el panel admin
- **Clientes:** tabla nombre · WhatsApp · puntos · históricos · usados · fecha registro.
- **Premios:** lista con costo y estado; crear premio (nombre + costo en puntos);
  activar/desactivar (sin borrar — histórico de canjes intacto). Un premio desactivado
  deja de aparecer en el selector del cierre de mesa.
- **Canjes:** registro con fecha · cliente · premio · puntos · mozo.
- Solo visible/permitido para rol ADMIN (RLS ya lo garantiza en BD).

### F2 · Cliente del club en el detalle de orden
- `DetalleOrdenModal` muestra "Cliente Club DF: <nombre>" cuando la orden está vinculada
  (el admin ve el nombre; el mozo, por RLS, no consulta la tabla — se muestra solo si llega).

### F3 · Parciales en el historial (mozo y admin)
- Órdenes **ABIERTAS con `pagado > 0`** entran al historial con badge **"⏳ Pendiente de
  cierre"**, mostrando `cobrado / total` (contador que crece con cada cobro parcial, en vivo
  por Realtime). Sin hora de cierre (aún abierta), se muestran arriba de las cerradas.
- Al finalizar la mesa: la fila pasa al estado actual (total final + tipo de pago + hora).
- **Stats:** nueva tarjeta "Pendiente de cierre" (suma de lo cobrado en mesas abiertas +
  cuántas mesas). "Ventas de hoy" queda EXACTAMENTE igual (solo cerradas, R2).
- **Export CSV:** sin cambios — exporta solo órdenes cerradas (no distorsiona el corte).
- **Cierre de día:** sin cambios — sigue operando solo sobre órdenes cerradas.

## 4. Criterios de aceptación

- [ ] Admin ve pestaña Club DF con clientes reales (3 registrados) y sus contadores.
- [ ] Admin crea un premio → aparece de inmediato en el selector del cierre de mesa;
      lo desactiva → desaparece del selector; los canjes previos no se pierden.
- [ ] Canjes listados con fecha, cliente, premio, puntos y mozo (criterio APP-2 del club).
- [ ] Mozo NO ve la pestaña Club DF (solo admin).
- [ ] Mesa abierta + cobro parcial → aparece en historial "⏳ Pendiente de cierre" con el
      monto cobrado; segundo cobro parcial → el contador sube (en vivo).
- [ ] "Ventas de hoy" no incluye parciales de mesas abiertas; la stat "Pendiente de cierre"
      sí los suma.
- [ ] Al finalizar la mesa → la fila pasa a cerrada con total final y la stat pendiente baja.
- [ ] Orden anulada con cobros previos: no cuenta ni en ventas ni en pendiente.
- [ ] Cero cambios en BD; build verde; POS operativo idéntico para el mozo.

## 5. Fuera de alcance

- Editar/eliminar clientes desde el admin (solo lectura por ahora).
- Notificaciones al cliente; reportes de puntos por período (backlog).
