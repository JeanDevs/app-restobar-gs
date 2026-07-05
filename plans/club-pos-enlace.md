# Plan técnico — Enlace Club DF ↔ POS

**Spec:** `specs/club-pos-enlace.md` (✅ aprobado 2026-07-05) · Alcance: P1 + P2 (Jean: "empieza P1 y la 2")

## 1. Base de datos (Supabase `kknvrufoelhdtouprcvm`)

### 0. Backup previo (R7 — antes de tocar nada)
```sql
create table public._backup_clientes_20260705 as select * from public.clientes;
create table public._backup_ordenes_20260705  as select * from public.ordenes;
```
Verificar conteos idénticos al original. Los backups NO llevan RLS (solo accesibles con service role).

### 1. Migración `club_pos_enlace` (100 % aditiva)
- `clientes` + `puntos_historicos` / `puntos_usados` (int, not null, default 0);
  init one-time: `puntos_historicos = puntos` (el saldo actual cuenta como ganado).
- `ordenes` + `cliente_id uuid null references clientes(id)`.
- Tabla `premios` (id, nombre, costo_puntos>0, activo, creado_en) — RLS: select para
  `anon`+`authenticated` (catálogo público); escritura solo ADMIN.
- Tabla `canjes` (id, cliente_id FK, premio_id FK, orden_id FK null, puntos, mozo, creado_en) —
  RLS: select solo ADMIN; inserts solo vía función.
- **RPCs (SECURITY DEFINER):**
  - `buscar_cliente_club(p_whatsapp)` → (id, nombre, puntos) · grant `authenticated` (mozos).
  - `consultar_puntos(p_whatsapp)` → (puntos, puntos_historicos, puntos_usados) · grant `anon`
    (la tarjeta `/club` refresca su saldo real).
  - `finalizar_club(p_orden_id, p_cliente_id, p_premio_id default null, p_mozo default null)`
    · grant `authenticated`. Atómica: ① guard anti-doble-acumulación (`ordenes.cliente_id` debe
    estar null) → setea `cliente_id`; ② suma `ceil(coalesce(total_final,total))` a `puntos` y
    `puntos_historicos`; ③ si hay premio: valida saldo ≥ costo, inserta `orden_items` (🎁, S/ 0,
    pagado=true), inserta `canjes`, descuenta `puntos`, suma `puntos_usados`. Devuelve
    (puntos_ganados, puntos_canjeados, saldo). Solo sobre órdenes CERRADA/PAGADA.
  - `grant execute` de `registrar_cliente` (existente) también a `authenticated` (registro rápido).

El premio entra con **precio 0** ⇒ no infla `total` ⇒ no genera puntos (R6) y no rompe pagos.
La anulación nunca llama `finalizar_club` ⇒ mesa anulada ni suma ni canjea (criterios).

### 2. Verificación post-migración (gate)
Conteos pre/post idénticos en `ordenes`, `pagos`, `orden_items`, `clientes` (+respetar la fila
real "Hugo Jean Pierre"). Smoke test de las 3 RPCs con datos de prueba propios + limpieza.

## 2. App (React)

- `types` → `Orden.cliente_id?`; `DataClient` → métodos **opcionales** `buscarClienteClub?`,
  `registrarClienteRapido?`, `getPremios?`, `finalizarClub?` (el mock NO los implementa; la UI
  usa `db.x?.()` y oculta la sección Club en modo mock — cero riesgo al POS actual).
- `supabaseClient.ts` → implementa los 4 métodos vía RPC/select.
- `FinalizarModal.tsx` → sección **"Club DF (opcional)"**: input WhatsApp (9 dígitos) → busca →
  muestra nombre+saldo · si no existe → mini-form registro rápido (nombre) → crea con bono 50 ·
  con cliente hallado: selector de premio (solo `premios` activos con costo ≤ saldo) ·
  `onConfirmTipo(tipo, club?)` pasa `{clienteId, premioId?}`.
- `PanelPedidos.tsx` → `handleCierre`: tras `finalizarOrden` OK, si hay club →
  `finalizarClub(...)` → toast "⭐ +N pts · saldo M" (si falla el club, la mesa YA cerró bien:
  toast de aviso, sin bloquear — el cobro nunca depende del club).
- `TarjetaDF.tsx` → texto regla nueva (R8: "Cada sol consumido = 1 punto") + refresh de saldo
  real vía `consultar_puntos` al montar (actualiza localStorage).

## 3. Verificación end-to-end (local, antes de deploy)

1. Mesa sin número → cierre idéntico al actual.
2. Mesa S/ 15.50 con cliente → +16 pts exactos (SELECT).
3. Número nuevo → registro rápido → 50 + ceil(total).
4. Canje: cliente con saldo ≥ costo → ítem 🎁 S/ 0 en detalle, `canjes` con fecha/puntos/mozo,
   saldo baja exacto. Premio no suma puntos.
5. Anular mesa → puntos intactos.
6. Doble clic/reintento de cierre → sin doble acumulación (guard).
7. Build verde + `/` `/carta` `/club` intactos.

## 4. Deploy

`development` → verificar → merge a `main` → Vercel prod → verificar rutas + smoke en prod.

## 5. Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Romper cobros en prod | Migración aditiva + backup + conteos pre/post + club como paso post-cierre no bloqueante |
| Doble acumulación | Guard `cliente_id is null` dentro de la RPC (atómico) |
| Mock sin club | Métodos opcionales — UI se degrada sola |
| Premios sin seed | Sección de canje se oculta si el catálogo está vacío (P2 queda inerte hasta que Jean pase la lista) |
