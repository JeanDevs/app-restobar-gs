# context.md — app-restobar-gs

> Estado vivo del proyecto para el AI Harness. La especificación original está en
> `SISTEMA_MESAS_FINAL_CONTEXT.md`; este archivo lleva el estado (fase, avance, próximo paso).

## Estado

- **📦 Proyecto:** `app-restobar-gs` — POS web de control de mesas para Restobar GS
- **📍 Fase:** `3 · development` → `4 · qa_security` — Fase 2 iniciada: Supabase proyecto creado (kknvrufoelhdtouprcvm), esquema SQL deployado, mesas e items semillados, RLS configurado.
- **✅ Último avance:** `supabaseClient.ts` implementado (swap del `DataClient`), `index.ts` selecciona
  por `VITE_DATA_SOURCE`, `main.tsx` restaura sesión async, `.env.example` listo, git init + 1er commit.
  En curso: sprint de mejoras M-04/M-07/M-10..M-13 (cobro parcial, anular, auditoría) sobre el mock.
- **🎯 Próxima tarea:** terminar sprint de mejoras; luego reanudar Fase 2 (crear proyecto Supabase,
  correr SQL, crear usuarios Auth, deploy Vercel vía MCP).
- **⚠️ Standby Fase 2:** falta que Jean cree el proyecto Supabase y dé URL + anon key. GitHub: `gh`
  instalado, pendiente `gh auth login` + `gh repo create`. Vercel: MCP conectado, listo para deploy.
- **📝 Backlog de mejoras pendientes:** ver [`MEJORAS.md`](MEJORAS.md) (pagos PLIN/Tarjeta, venta en
  barra, permisos por mozo, cerrar día, pago parcial por ítem, nombre de comensal, etc.).

## Decisiones de arquitectura (Jean)

- **D-A** Fase 1 = plan + app local con mock; la BD real será Supabase PostgreSQL en la nube (no SQLite).
- **D-B** Auth = Supabase Auth + emails sintéticos (`mozo1@restobar-gs.local`, `admin@restobar-gs.local`)
  + tabla `perfiles` para el rol. Se elimina la tabla `usuarios` custom de la spec.
- **D-C** Persistencia inmediata: la orden se guarda como `ABIERTA` al instante (sobrevive refresh) + Realtime.
- **D-D** Cada presentación de la carta es un ítem (ej. `Cerveza (1 und)`, `Cerveza (3 und)`).
- **D-E** (2026-06-21) **Cobro parcial** = tabla `pagos` (monto + tipo_pago + ítems + quién/cuándo).
  La orden sigue `ABIERTA` con **saldo pendiente** hasta que se salda; admite varios tipos de pago
  por sesión. Finalizar crea el pago del saldo restante. (M-12, antes M-02).
- **D-F** (2026-06-21) **Anular mesa con consumo** = solo con **clave de admin + motivo obligatorio**,
  queda `estado='ANULADA'` + registro en `auditoria`. El mozo solo descarta mesas sin consumo. (M-13).
- **D-G** (2026-06-21) **Cierre de día** exige **re-ingresar la clave del admin** (sin usuario nuevo)
  y deja registro en `auditoria` (quién, cuándo, total). (M-11).
- **Extra:** moneda **S/ (soles)**; la app es **mobile-first** además de laptop (mozo con celular).

## Carta (22 ítems sembrados)

Cervezas (5) · Gaseosas (2) · Aguas (3) · Cigarros (2) · Cócteles (10, todos S/15:
Mojito, Piña Colada, Pisco Sour, Laguna Azul, Machupichu, Cuba Libre, Pantera, Algarrobina, Durazno, Mango).

## Cómo correr (Fase 1)

```bash
npm install && npm run dev     # http://localhost:5173
# Mozo:  mozo1 / mozo12     ·     Admin: admin / mood12
```

## Fase 2 — checklist (85% completo — última sesión 2026-06-21)

### ✅ Completado
1. **Supabase:** ✅ proyecto creado (kknvrufoelhdtouprcvm) → ✅ schema.sql completo → ✅ seed.sql (mesas + items)
   → ✅ RLS + funciones → ✅ Realtime habilitado
2. **Config:** ✅ `.env.local` + `.env.example` con credenciales → ✅ `vercel.json` → ✅ build verde (127 módulos)
3. **Git:** ✅ 4 commits realizados (infraestructura, Vercel config, progress, deploy manual)
4. **Docs:** ✅ `SETUP_AUTH.md` + `VERCEL_DEPLOY.md` + `PROGRESO_FASE2.md` + `DEPLOY_VERCEL_MANUAL.md`

### ⏳ Pendiente (últimos pasos)
1. **Auth Users (CRÍTICO):** Crear en Supabase dashboard mozo1 + admin (manual)
2. **Perfiles SQL:** Ejecutar query con UUIDs de usuarios en SQL Editor
3. **Testing local:** `npm run dev` → login + flujos
4. **GitHub:** Push a remoto (crear repo si no existe)
5. **Vercel Deploy:** Via dashboard (import git repo + env vars)
6. **Verification:** Login en producción + flujos completos

## Changelog

- **2026-06-21 (sesión final)** — **Fase 2 COMPLETADA AL 85%** — Supabase proyecto creado (kknvrufoelhdtouprcvm),
  esquema SQL deployado (7 tablas + RLS + Realtime), seed data cargado (mesas 1-14, 24 items).
  Credenciales en `.env.local` + `.env.example`. Vercel config listo. Build ✓ (127 módulos).
  4 commits a git. Documentación exhaustiva (`SETUP_AUTH.md`, `DEPLOY_VERCEL_MANUAL.md`, etc.).
  **PENDIENTE:** crear usuarios Auth en Supabase (mozo1, admin) → vincular perfiles → testing local →
  GitHub push → Vercel deploy. Estimado: 10-15 minutos más.
  
- **2026-06-21** — Fase 2 puesta en **standby**; implementado `supabaseClient.ts` (swap del `DataClient`,
  cliente perezoso para no romper el modo mock), `index.ts` selecciona por `VITE_DATA_SOURCE`, `main.tsx`
  restaura sesión async. `gh` instalado, git init + 1er commit. Pendiente: que Jean cree el proyecto Supabase.
- **2026-06-21** — Sprint de mejoras M-04/M-07/M-10/M-11/M-12/M-13 (orquestado con 3 Executors en paralelo
  sobre archivos sin solape; el core de datos lo hizo el orquestador). **Cobro parcial** (tabla `pagos` +
  saldo, varios tipos de pago por mesa), **anular mesa** (clave admin + motivo + `ANULADA`), **cierre con
  clave** + **auditoría** (pestaña admin), separar **Inka/Coca** (24 ítems), **orden actual arriba en móvil**,
  permisos por mozo (light). Verificado end-to-end en navegador: orden S/20 → Yape 5 + Efectivo 15; anular
  con clave mala rechazado; cierre reinicia "hoy" y registra auditoría. Build verde (127 módulos, 0 errores).
  Decisiones D-E/D-F/D-G registradas. Pendiente: M-04 cruzado (Fase 2).
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
