# Tasks — Puertas públicas (Landing + Carta + Club DF)

**Spec:** `specs/puertas-publicas-club.md` (aprobado) · **Plan:** `plans/puertas-publicas-club.md`
Una tarea a la vez; el Verifier valida contra los criterios del spec antes de la siguiente.

- [x] **T1 · Migración `clientes` + función `registrar_cliente`** (D-003) ✅ APLICADA y verificada vía MCP.
- [x] **T2 · Ruteo público en `App.tsx`** ✅ rama por `pathname` (`/`,`/carta`,`/club`); POS movido a `/app`,
  verificado intacto (login OK). SPA en dev OK; rewrite en prod se confirma en deploy.
- [x] **T3 · `PublicLanding`** ✅ marca Destino Final + 2 botones. Móvil 375px sin overflow.
- [x] **T4 · `PublicCarta`** ✅ 26 ítems estáticos en 5 categorías, sin login.
- [x] **T5 · `PublicClub` + `TarjetaDF` + localStorage** ✅ registro → fila real en `clientes` (puntos=50,
  verificado por SELECT); tarjeta persiste en localStorage tras recarga; build verde (136 módulos).
- [ ] **T6 · Deploy prod + QR nuevo**  ← siguiente
  - Deploy; verificar `/`, `/carta`, `/club`, `/app` en prod; generar QR a la URL nueva.
- [ ] **T7 · Cierre** — actualizar `context.md` + `progress.md`; confirmar cierre con Jean.
