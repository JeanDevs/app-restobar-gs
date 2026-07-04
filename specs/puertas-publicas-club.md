# Spec — Puertas públicas (Landing + Carta + Club de Fidelización)

**Estado:** aprobado (Jean, 2026-07-04)
**Proyecto:** app-restobar-gs  ·  **Fase:** 3-development  ·  **Fecha:** 2026-07-04

## Objetivo (1 frase)

Que el comensal que escanea el QR de la mesa entre a `app-restobar-gs`, elija entre ver la carta o
unirse al "Club GS", dejando sus datos (Nombre + WhatsApp + Cumpleaños) en la base de datos del
restobar y recibiendo una tarjeta digital de puntos con un bono de bienvenida.

## Marca (DECIDIDO 2026-07-04)

- El local ahora se llama **"Destino Final"**; el club de fidelización es **"Club DF"**.
- Las 3 rutas públicas (`/`, `/carta`, `/club`) usan la marca **Destino Final / Club DF**.
- El POS interno (mozo/admin) conserva su naming actual (GS) esta noche — rebrand completo = follow-up.

## Contexto / arquitectura (DECIDIDO)

- **Puerta única:** todo vive en `app-restobar-gs` (ya conectado a su Supabase `kknvrufoelhdtouprcvm`).
- **QR:** apuntará a `app-restobar-gs.vercel.app` (Jean reimprime el QR — la URL vieja de `mi-carta`
  queda libre). `mi-carta` queda como referencia de diseño, ya no como puerta.
- **Rutas públicas (sin login):** `/` (landing), `/carta`, `/club`.
- **POS interno (mozo/admin):** sigue detrás de su auth actual, en su propia ruta (ej. `/app`).
- **Carta esta noche = ESTÁTICA:** se porta el contenido actual (los 22 ítems) a una vista pública
  bonita. Hacerla dinámica desde Supabase = **fase 2**.

## Reglas (negocio)

- La landing muestra 2 accesos: **1) Ver la Carta** · **2) Club GS (Fidelización)**.
- El registro pide **Nombre, WhatsApp y Cumpleaños**. WhatsApp es obligatorio y es la llave del cliente.
- Un WhatsApp ya registrado NO crea duplicado: se le muestra su tarjeta existente (upsert por whatsapp).
- Al registrarse por primera vez, el cliente recibe un **bono de bienvenida fijo = 50 puntos**.
- **Regla de puntos (visible en la tarjeta):** "Cada compra suma 50 pts · a los 500 pts canjeas un
  beneficio." La tarjeta muestra saldo + barra de progreso hacia 500.
- **Acumulación por compra = fase 2** (se conecta desde el POS). Esta noche solo se otorga el bono de
  bienvenida y se comunica la regla; el saldo no sube solo todavía.
- La tarjeta se **recuerda en el teléfono** (localStorage): al volver, ve su tarjeta sin re-registrarse.
- Las rutas públicas NO exigen login. El POS de mozos/admin no se toca ni se expone.

## Ejemplos input → output

| # | Input / acción del usuario | Output / resultado esperado |
|---|---|---|
| 1 | Escanea QR → abre `/` | Landing con logo GS y 2 botones: "Ver la Carta" / "Únete al Club GS" |
| 2 | Toca "Ver la Carta" (`/carta`) | Ve el menú (22 ítems) estático, tema del restobar, mobile-first |
| 3 | Toca "Club GS" (`/club`), llena datos y envía | Crea fila en `clientes` con 50 puntos; ve "Tu Tarjeta GS" con nombre y saldo 50 |
| 4 | Vuelve a escanear el QR (mismo teléfono) | Reconoce su tarjeta guardada (localStorage) y la muestra directo |
| 5 | Se registra con un WhatsApp que ya existe | No duplica; muestra la tarjeta existente con su saldo actual |
| 6 | Un mozo abre `/app` | El POS funciona igual que hoy, con su login |

## Edge cases

- **WhatsApp inválido/corto** → error de validación, no envía.
- **Sin conexión / Supabase caído** → mensaje "no pudimos guardar, reintenta" (no pierde lo tecleado).
- **Cumpleaños vacío** → permitido (opcional); Nombre y WhatsApp obligatorios.
- **localStorage borrado** → al registrarse de nuevo con su WhatsApp, recupera su tarjeta (no duplica).
- **Doble submit** → botón se deshabilita durante el envío.
- **Ruta pública no debe filtrar el POS** → `/`, `/carta`, `/club` renderizan sin sesión.

## Criterios de aceptación (contrato del Verifier)

- [ ] `/` muestra la landing con 2 opciones, sin pedir login (verificado en navegador).
- [ ] `/carta` muestra el menú (22 ítems) sin regresiones y sin login.
- [ ] `/club` → enviar el registro crea una fila real en `clientes` de Supabase `kknvrufoelhdtouprcvm`
      (verificado con SELECT vía MCP), con `puntos = 50`.
- [ ] Registrar dos veces el mismo WhatsApp NO crea segunda fila (upsert por whatsapp).
- [ ] Tras registrarse, "Tu Tarjeta GS" muestra nombre + saldo; al recargar, sigue visible (localStorage).
- [ ] `/app` (POS) sigue funcionando con su login, sin cambios de comportamiento.
- [ ] Mobile-first: sin overflow horizontal a 375px en landing, carta y club.
- [ ] Deploy en producción (`app-restobar-gs.vercel.app`) y QR nuevo funcionando.

## Fuera de alcance (esta noche)

- **Carta dinámica** desde Supabase + edición live (fase 2 — ya existe `MenuManager`, solo falta
  vista pública leyendo `items` + política anon read).
- Acumulación de puntos por consumo desde el POS (fase 2).
- Canje de puntos / catálogo de premios.
- Panel admin de clientes (por ahora se consulta vía Supabase).
- Login del cliente / verificación de WhatsApp por OTP.

## Cambios de BD (D-003 — requieren aplicar migración en Supabase antes de dar por hecho)

- Nueva tabla `public.clientes`: `id` (uuid pk), `nombre` (text), `whatsapp` (text UNIQUE),
  `cumpleanos` (date null), `puntos` (int default 50), `created_at` (timestamptz default now()).
- RLS: permitir **INSERT anónimo** (rol `anon`); **sin** SELECT anónimo (la tarjeta se guarda en el
  teléfono, no se lee de la BD). El upsert por WhatsApp se hace vía función `SECURITY DEFINER`
  (`registrar_cliente`) que devuelve solo la fila del propio cliente — no expone datos de otros.
- **Esta noche NO se toca `items`** (carta estática) → migración mínima, solo `clientes`.

## Preguntas resueltas por Jean (2026-07-04)

- **Bono de bienvenida:** 50 puntos. ✅
- **Regla:** cada compra +50 pts; a los 500 pts se canjea un beneficio (acumulación por compra = fase 2). ✅
- **Nombre del club:** **Club DF** (el local ahora es "Destino Final"). ✅
- **WhatsApp del negocio:** oculto por ahora. ✅
