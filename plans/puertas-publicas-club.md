# Plan técnico — Puertas públicas (Landing + Carta + Club DF)

**Estado:** aprobado por Jean (spec) · **Fecha:** 2026-07-04
**Spec:** `specs/puertas-publicas-club.md`

## Enfoque de ruteo (sin nueva dependencia)

La app hoy rutea por sesión/rol en `App.tsx` (sin react-router, por regla del harness). Mantengo el
patrón: agrego una **rama por `window.location.pathname` ANTES** de la lógica del POS.

```
App.tsx:
  path === '/'       → <PublicLanding/>      (público, sin sesión)
  path === '/carta'  → <PublicCarta/>        (público, estática)
  path === '/club'   → <PublicClub/>         (público, escribe a Supabase)
  resto (/app, ...)  → lógica actual (Login/Mozo/Admin por sesión)  ← INTACTO
```

- Navegación entre públicas: `<a href>` con recarga (robusto, sin popstate; suficiente para un menú QR).
- SPA rewrite: confirmar que `vercel.json` reescribe `/(.*) → /index.html` (si no, agregarlo) para que
  `/carta` y `/club` carguen en acceso directo.
- El POS se moverá a `/app`: la landing/QR ya no cae en Login. (Los mozos usan `/app`.)

## Datos (Supabase `kknvrufoelhdtouprcvm`)

- Tabla `public.clientes` (ver spec). RLS: INSERT anónimo, sin SELECT anónimo.
- Función `registrar_cliente(nombre, whatsapp, cumpleanos)` `SECURITY DEFINER`:
  - upsert por `whatsapp`; si existe, devuelve su fila; si es nuevo, inserta con `puntos = 50`.
  - retorna solo la fila del propio cliente (no expone otros).
  - `grant execute` a `anon`.
- Cliente frontend: reutilizar `src/services` / `supabaseClient.ts` (ya configurado con anon key).

## Componentes nuevos (todos públicos)

- `src/pages/public/PublicLanding.tsx` — logo "Destino Final" + 2 botones (Carta / Club DF).
- `src/pages/public/PublicCarta.tsx` — 22 ítems estáticos (porta contenido), mobile-first.
- `src/pages/public/PublicClub.tsx` — formulario (Nombre/WhatsApp/Cumpleaños) → `registrar_cliente`
  → guarda tarjeta en localStorage → muestra `<TarjetaDF/>`.
- `src/pages/public/TarjetaDF.tsx` — saldo + regla ("cada compra +50, a 500 canjeas") + barra a 500.
- `src/lib/tarjetaLocal.ts` — get/set de la tarjeta en localStorage.

## Verificación (Verifier)

- SELECT vía MCP sobre `clientes` tras un registro de prueba (puntos=50, sin duplicado en 2º submit).
- Navegador: `/`, `/carta`, `/club` sin login; `/app` con login intacto; 375px sin overflow.
- Deploy prod + acceso directo a `/carta` sin 404.

## Riesgos

- **Mover el POS a `/app`** podría afectar accesos guardados de mozos → avisar/redirigir `/` que no
  sea público hacia `/app` si hay sesión. Verificar login end-to-end tras el cambio.
- Rewrite SPA faltante → 404 en acceso directo. Mitigar confirmando `vercel.json`.
- PWA service worker cacheando la vieja `/` → forzar `autoUpdate` (ya configurado) y probar recarga.
