# Tasks — Enlace Club DF ↔ POS (P1 + P2)

**Spec:** `specs/club-pos-enlace.md` ✅ · **Plan:** `plans/club-pos-enlace.md`
Una tarea a la vez; verificación contra criterios del spec antes de la siguiente.

- [x] **T1 · Backup + migración `club_pos_enlace`** ✅ backups verificados (3/3, 20/20);
  migraciones `club_pos_enlace` + `registrar_cliente_historicos` aplicadas (D-003 cumplida).
- [x] **T2 · Verificación de integridad + smoke RPCs** ✅ conteos pre/post idénticos
  (20/25/42/3); smoke: S/15.50 → 16 pts (ceil ✓), canje 30 pts con ítem 🎁 + fila en `canjes` ✓,
  guard anti-doble-acumulación lanza excepción ✓, limpieza total verificada.
- [x] **T3 · Capa de datos app** ✅ 4 métodos opcionales en `DataClient` + impl. Supabase
  (mock intacto — la UI oculta el club si no están).
- [x] **T4 · UI cierre de mesa** ✅ sección ⭐ Club DF en `FinalizarModal` (buscar / registro
  rápido / selector premio con saldo insuficiente deshabilitado) + club post-cierre no bloqueante.
- [x] **T5 · Tarjeta `/club`** ✅ regla "1 sol = 1 punto" (la vieja de 50/500 eliminada) +
  saldo real vía `consultar_puntos` con fallback offline.
- [x] **T6 · Verificación end-to-end local** ✅ build verde; UI real contra BD prod: registro
  rápido (bono 50), S/3.50 → +4 pts (ceil ✓), canje −30 con ítem 🎁 y fila `canjes` ✓, toast
  "⭐ TEST SMOKE UI: +4 pts · canje −30 · saldo 24"; datos TEST eliminados; 4 órdenes reales
  abiertas intactas; /club con regla nueva; 0 errores de consola.
- [ ] **T7 · Deploy a producción** + verificación de rutas y smoke en prod.
- [ ] **T8 · Cierre** — `context.md` + `progress.md`; confirmar con Jean. (Seed de premios
  queda pendiente del insumo de Jean — P2 inerte hasta entonces.)
