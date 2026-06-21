# context.md — app-restobar-gs

> Estado vivo del proyecto para el AI Harness. La especificación original está en
> `SISTEMA_MESAS_FINAL_CONTEXT.md`; este archivo lleva el estado (fase, avance, próximo paso).

## Estado

- **📦 Proyecto:** `app-restobar-gs` — POS web de control de mesas para Restobar GS
- **📍 Fase:** `3 · development` — **Fase 1 (app local con mock) COMPLETADA y verificada**
- **✅ Último avance:** Scaffold completo React+Vite+TS+Tailwind. UI Mozo y Admin funcionando con
  datos mock (22 ítems). Flujo end-to-end verificado en navegador (desktop + móvil 375px).
  `npm run build` pasa (tsc --noEmit + vite build, 0 errores).
- **🎯 Próxima tarea:** **Fase 2** — integrar Supabase (PostgreSQL + Auth + Realtime), GitHub y Vercel.
- **⚠️ Bloqueadores:** confirmar si Jean ya tiene cuentas en Supabase / Vercel / GitHub (todas free).
- **📝 Backlog de mejoras pendientes:** ver [`MEJORAS.md`](MEJORAS.md) (pagos PLIN/Tarjeta, venta en
  barra, permisos por mozo, cerrar día, pago parcial por ítem, nombre de comensal, etc.).

## Decisiones de arquitectura (Jean)

- **D-A** Fase 1 = plan + app local con mock; la BD real será Supabase PostgreSQL en la nube (no SQLite).
- **D-B** Auth = Supabase Auth + emails sintéticos (`mozo1@restobar-gs.local`, `admin@restobar-gs.local`)
  + tabla `perfiles` para el rol. Se elimina la tabla `usuarios` custom de la spec.
- **D-C** Persistencia inmediata: la orden se guarda como `ABIERTA` al instante (sobrevive refresh) + Realtime.
- **D-D** Cada presentación de la carta es un ítem (ej. `Cerveza (1 und)`, `Cerveza (3 und)`).
- **Extra:** moneda **S/ (soles)**; la app es **mobile-first** además de laptop (mozo con celular).

## Carta (22 ítems sembrados)

Cervezas (5) · Gaseosas (2) · Aguas (3) · Cigarros (2) · Cócteles (10, todos S/15:
Mojito, Piña Colada, Pisco Sour, Laguna Azul, Machupichu, Cuba Libre, Pantera, Algarrobina, Durazno, Mango).

## Cómo correr (Fase 1)

```bash
npm install && npm run dev     # http://localhost:5173
# Mozo:  mozo1 / mozo12     ·     Admin: admin / mood12
```

## Fase 2 — checklist (pendiente)

1. **GitHub:** repo `app-restobar-gs`, `git init`, primer commit.
2. **Supabase:** crear proyecto → correr `supabase/schema.sql` + `supabase/seed.sql` → crear los 2
   usuarios Auth → enlazar sus UUID en `perfiles` → habilitar Realtime (ya en el SQL).
3. **Swap:** implementar `src/services/supabaseClient.ts` (mismo contrato `DataClient`) y activarlo en
   `src/services/index.ts` con `VITE_DATA_SOURCE=supabase`. **No se tocan componentes ni hooks.**
4. **Vercel:** import del repo + env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) → deploy.
5. **Seguridad:** revisar RLS (mozo no edita menú), tokens, OWASP A01/A03.

## Changelog

- **2026-06-21** — Fase 1 completada: 37 archivos, app local navegable con mock, mobile-first,
  build verde, esquema Supabase listo en `supabase/`.
- **2026-06-21** — Iteración UX: panel Mozo reordenado (Cantidad+Agregar arriba del buscador);
  botón **Guardar** (deja la orden abierta y vuelve al grid); módulos **Agregar** y **Orden actual**
  colapsables; admin con pestaña **Pedidos** (opera como mozo); **exportar historial a Excel (CSV)**;
  **detalle de pedido** en el resumen admin con el **mozo que atendió** (campo `mozo` en `ordenes`).
- **2026-06-21** — Implementadas mejoras M-01, M-03, M-05, M-06, M-08, M-09 (ver [`MEJORAS.md`](MEJORAS.md)):
  pagos PLIN+Tarjeta, venta en **Barra** (admin, sin mesa, `mesa_numero=0`), export solo admin,
  botón **Cerrar día** (corte de caja, reinicia "hoy", conserva historial), **nombre de comensal**,
  y botón **Agregar arriba**. Verificado end-to-end (mozo + admin) y móvil 375px sin overflow.
  Pendientes: M-02 (pago parcial), M-04 (permisos por mozo), M-07 (separar Inka/Coca).
- **2026-06-21** — Fix móvil: el `grid` del panel de pedidos no acotaba la columna en móvil
  (usaba `max-content` → overflow horizontal de ~78px). Se forzó `grid-cols-1` (minmax(0,1fr)) +
  `min-w-0` en `CollapsibleCard`. Verificado a 375px en mozo y admin (sin overflow).
- **2026-06-21** — Creado [`MEJORAS.md`](MEJORAS.md): backlog de cambios pedidos (M-01…M-09).
- **2026-06-21** — UX mozo v2: módulo Agregar rediseñado a **carrito de selección múltiple**
  (tocas ítems → se apilan en "Por agregar" con cantidad → **un solo botón Agregar** los manda a
  la orden; nuevo `DataClient.agregarItems` por lote). Mozo con conmutador **Pedidos / Historial
  del día** (ventas de hoy + total + detalle por pedido + export). Historial y detalle movidos a
  `Shared/` (`HistorialOrdenes`, `DetalleOrdenModal`) y reusados por mozo y admin.
