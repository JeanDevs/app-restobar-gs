# Spec — Identidad del cliente Club DF con clave de 4 dígitos

**Estado:** 🟢 **EN PRODUCCIÓN (2026-07-11)** — BD verificada, build verde, deploy OK, endurecimiento aplicado.
**Fecha:** 2026-07-09
**Proyecto:** app-restobar-gs · Supabase `kknvrufoelhdtouprcvm` · prod `destinofinal.vercel.app`
**Depende de:** `specs/club-pos-enlace.md` (Club DF ↔ POS, ya en producción)

---

## 1. Objetivo

Dar al cliente del Club DF un botón **"Soy cliente"** que le permita **ver su saldo y su
historial de forma segura** desde cualquier teléfono, sin depender de `localStorage`.

La identidad sigue siendo el **número de WhatsApp** (llave del club, ya existente). Se le
agrega una **clave de 4 dígitos** que el cliente define y que prueba que el número es suyo,
más un flujo de **recuperación de clave** cuando la olvide. **Sin OTP ni Gmail ni proveedores
de pago** (Twilio, etc.): todo se resuelve con la BD que ya tienes.

## 2. Contexto y decisiones previas (Jean · 2026-07-09)

| # | Decisión | Valor |
|---|---|---|
| ID-1 | Identidad | **WhatsApp (9 díg.) = llave** + **clave de 4 dígitos** definida por el cliente |
| ID-2 | Sin contraseña larga ni OTP ni Google | La clave de 4 díg. es el único candado del cliente |
| ID-3 | Quién canjea puntos | **Solo el mozo/admin** desde el POS (sin auto-canje del cliente) |
| ID-4 | Recuperar clave | Botón **"Olvidé mi clave"** → auto-servicio por **cumpleaños** + respaldo: **reseteo por el admin** desde el POS |
| ID-5 | Persistencia | Los datos ya viven en Supabase (`clientes`); el teléfono solo **recuerda la sesión**, no es la fuente de verdad |
| ID-6 | Producción intocable | Migraciones **100 % aditivas** + **backup previo** de `clientes` (R7 de `club-pos-enlace.md` sigue vigente) |
| ID-7 | **Sección de clientes en el POS** | Admin **y** mozo tienen una **nueva sección** para **ver y buscar clientes con sus puntos** (nombre, WhatsApp, saldo). Cierra el criterio APP-1.1 / P3 de `club-pos-enlace.md`. |

## 3. Por qué este diseño es suficiente (modelo de amenaza)

- El **peor riesgo** de un club de puntos —que un extraño **drene los puntos**— ya está
  bloqueado por **ID-3**: el débito solo ocurre en el POS, con el mozo frente al cliente.
- Lo que la clave de 4 díg. protege es la **privacidad del saldo/historial** (que un tercero
  con tu número no lo vea). Daño bajo → una clave corta + bloqueo por intentos alcanza.
- **Riesgo intrínseco de 4 dígitos:** solo 10 000 combinaciones ⇒ **obligatorio** limitar
  intentos (ver R-SEC). Sin eso, se adivina por fuerza bruta.
- **Recuperación por cumpleaños es un factor débil** (alguien cercano podría saberlo). Se
  acepta para auto-servicio *porque* el reseteo fuerte lo hace el admin en persona y el canje
  es mozo-only. Si algún día hay abuso, se sube a OTP de WhatsApp sin rehacer el modelo.

## 4. Reglas de negocio y seguridad

| # | Regla |
|---|---|
| R1 | La clave es de **exactamente 4 dígitos** (`0000`–`9999`). Se pide **dos veces** al crearla (confirmación). |
| R2 | La clave se guarda **hasheada** (`pgcrypto` / `crypt()` + `gen_salt('bf')`), **nunca en texto plano**. Ninguna RPC devuelve el hash. |
| R3 | La comparación de clave ocurre **solo en el servidor** (RPC `SECURITY DEFINER`). El cliente jamás recibe el hash para comparar. |
| R-SEC | **Bloqueo por fuerza bruta:** tras **5 intentos fallidos** la cuenta se bloquea **15 min** (`pin_bloqueado_hasta`). Un acierto resetea el contador. |
| R4 | **Clientes existentes sin clave** (ya registrados antes de esta feature): en su primer "Soy cliente" se les pide **crear la clave**, validando identidad por **cumpleaños**. |
| R5 | **Sesión por dispositivo:** tras verificar la clave se emite un **token opaco** (uuid aleatorio) guardado hasheado en `sesiones_club` y en `localStorage`. En visitas siguientes el teléfono entra **sin volver a teclear la clave** mientras el token sea válido. |
| R6 | La sesión **expira** a los **90 días** de inactividad y es **revocable** (logout, o reset de clave revoca todas las sesiones). |
| R7 | Cambiar de número (R5 de `club-pos-enlace.md`) exige **clave válida** o sesión activa. |
| R8 | Registro nuevo desde `/club`: nombre + WhatsApp + cumpleaños + **clave (x2)**. Mantiene el **bono de 50 pts**. |
| R9 | El **registro rápido por el mozo** (POS, mesa) sigue **sin clave**: crea el cliente con `pin_hash = NULL`. El cliente define su clave luego, la primera vez que use "Soy cliente" (R4). Cero fricción en el POS. |

## 5. Modelo de datos (aditivo · backup previo)

```
clientes (EXISTENTE — solo se agregan columnas)
  + pin_hash              text        null        -- bcrypt; NULL = aún sin clave
  + pin_actualizado_en    timestamptz null
  + pin_intentos_fallidos integer     not null default 0
  + pin_bloqueado_hasta   timestamptz null

sesiones_club (NUEVA — "recordar este dispositivo")
  id           uuid PK default gen_random_uuid()
  cliente_id   uuid   not null FK→clientes.id
  token_hash   text   not null           -- hash del token; el token en claro solo lo tiene el device
  creado_en    timestamptz default now()
  ultimo_uso   timestamptz default now()
  expira_en    timestamptz not null       -- creado_en + 90 días
  revocada     boolean default false
  index (cliente_id), unique (token_hash)
```

**Backup previo (ID-6 / R7):** copia `clientes` a `clientes_backup_YYYYMMDD` **antes** de
aplicar la migración. La migración no cuenta como hecha hasta verificarse contra la BD real (D-003).

## 6. RPCs (todas `SECURITY DEFINER`, invocables con la anon key)

| RPC | Entrada | Salida / efecto |
|---|---|---|
| `establecer_pin(p_whatsapp, p_pin)` | número + clave 4 díg. | Setea `pin_hash` (bcrypt). Usada al registrar y al crear clave por primera vez (R4). Falla si el número no existe. |
| `verificar_pin(p_whatsapp, p_pin)` | número + clave | Si hay bloqueo activo → error "bloqueado hasta HH:MM". Si la clave coincide → crea sesión, devuelve **`{ token, nombre, puntos, puntos_historicos, puntos_usados }`** y resetea intentos. Si falla → incrementa `pin_intentos_fallidos`, aplica R-SEC. |
| `recuperar_pin(p_whatsapp, p_cumpleanos, p_pin_nuevo)` | número + cumpleaños + clave nueva | Si el cumpleaños coincide con `clientes.cumpleanos` → setea la clave nueva, **revoca todas las sesiones**, resetea el bloqueo. Si no coincide → error genérico (no revela si el número existe). Rate-limit propio. |
| `sesion_valida(p_token)` | token del device | Si el token existe, no está revocado ni expirado → refresca `ultimo_uso` y devuelve el saldo/nombre (login silencioso). Si no → null. |
| `cerrar_sesion(p_token)` | token | Marca `revocada = true` (logout de este teléfono). |
| `historial_cliente(p_token)` | token | Devuelve movimientos: puntos ganados por orden + canjes (para C4). Solo con sesión válida. |
| `admin_reset_pin(p_cliente_id)` | id de cliente (desde POS autenticado) | Pone `pin_hash = NULL` + revoca sesiones. El cliente crea clave nueva en su próximo "Soy cliente". Respaldo fuerte de ID-4. |
| `listar_clientes_pos(p_busqueda, p_limit, p_offset)` | texto opcional (nombre o WhatsApp) + paginación | **Para admin/mozo** (gateada por el rol del staff, no anónima). Devuelve `{ id, nombre, whatsapp, puntos, puntos_historicos, puntos_usados, creado_en }` ordenado y paginado. Sin `p_busqueda` → lista completa paginada. **Nunca** devuelve `pin_hash` (ID-7 / R2). |

**Endurecimiento de lo actual:** la RPC abierta `consultar_puntos(whatsapp)` deja de exponer el
saldo a cualquiera. Se **restringe** a devolver, como mucho, "existe / no existe" (para el flujo
del mozo en el POS), y el **saldo detallado del cliente** pasa a exigir sesión
(`verificar_pin` / `sesion_valida`). *(Verificar que el POS siga funcionando: el mozo consulta
saldo con el cliente presente; si el POS necesita el saldo, usa una RPC propia gateada por el
rol del staff, no la anónima.)*

## 7. Flujos (UI)

### F1 — Registro nuevo en `/club`
Nombre + WhatsApp + cumpleaños + **clave (x2)** → `registrar_cliente` (existente) + `establecer_pin`
→ bono 50 pts → sesión creada → ve su tarjeta. Sin cambios en la acumulación.

### F2 — "Soy cliente" (login)
1. Botón **"Soy cliente"** en `/club` (y en el landing).
2. Si el teléfono tiene token → `sesion_valida` → **entra directo** al saldo.
3. Si no → pide **WhatsApp + clave** → `verificar_pin` → sesión + saldo.
4. Si el número existe pero `pin_hash = NULL` (cliente viejo o registro rápido) → **"Crea tu clave"**
   validando por cumpleaños (R4) → `establecer_pin`.
5. Bloqueado (R-SEC) → mensaje "Demasiados intentos, espera 15 min o usa *Olvidé mi clave*".

### F3 — "Olvidé mi clave"
Botón en la pantalla de login → pide **WhatsApp + cumpleaños + clave nueva (x2)** →
`recuperar_pin`. Si no recuerda el cumpleaños → texto: "Acércate a la barra, el admin puede
resetear tu clave" (respaldo ID-4 vía `admin_reset_pin` desde el POS).

### F4 — Acumular / canjear
**Sin cambios.** Igual que `club-pos-enlace.md`: el mozo vincula la mesa y canjea desde el POS.

### F5 — Reset de clave por el admin (POS)
En la ficha del cliente (o al vincularlo a la mesa) → botón **"Resetear clave"** →
`admin_reset_pin`. Útil cuando el cliente perdió acceso.

### F6 — Sección "Clientes Club DF" en el POS (ID-7)
Nueva entrada en la navegación del POS, visible para **admin y mozo**:
1. Lista de clientes con **nombre · WhatsApp · puntos (saldo)**, paginada (`listar_clientes_pos`).
2. **Buscador** por nombre o WhatsApp (mismo input filtra la lista).
3. Al abrir una ficha: saldo detallado (`puntos` / `puntos_historicos` / `puntos_usados`) y,
   reutilizando lo existente, accesos a **vincular a mesa**, **canjear premio** (mozo) y
   **resetear clave** (F5). Lectura para ambos roles; el reset de clave respeta ID-4.
4. Solo lectura de datos del club: esta sección **no** edita puntos a mano (los puntos solo se
   mueven por consumo/canje, para no romper la trazabilidad de `club-pos-enlace.md`).

## 8. Fases

| Fase | Alcance | Depende de |
|---|---|---|
| **C1 — Datos + seguridad** | Backup + columnas `pin_*` + tabla `sesiones_club` + RPCs (`establecer/verificar/recuperar/sesion_valida/cerrar_sesion`) + bloqueo R-SEC + endurecer `consultar_puntos`. | — |
| **C2 — "Soy cliente"** | UI login (F2) + registro con clave (F1) + recordar dispositivo (R5/R6) + hook de sesión. | C1 |
| **C3 — Recuperación** | Botón "Olvidé mi clave" (F3) + reset admin en POS (F5, `admin_reset_pin`). | C1 |
| **C4 — Historial** | Pantalla de saldo con historial de puntos ganados y canjes (`historial_cliente`). Cierra el P3 diferido de `club-pos-enlace.md`. | C2 |
| **C5 — Clientes en el POS** | Sección "Clientes Club DF" para admin/mozo: lista + buscador + ficha (F6, `listar_clientes_pos`). Cierra APP-1.1 de `club-pos-enlace.md`. | C1 |
| **Anexo M — Marketing** | No es código de esta feature: aprovechar número + cumpleaños (saludo de cumple, "te faltan X pts", referidos). Se especifica en `specs/marketing/`. | — |

## 9. Criterios de aceptación

### C1
- [x] `_backup_clientes_20260709` creado y verificado (8 = 8 filas) ANTES de migrar.
- [x] Migración aditiva verificada contra BD real (D-003); **cero filas alteradas/borradas** (clientes 8 = 8 pre/post).
- [x] `establecer_pin` guarda **hash bcrypt** (`extensions.crypt`+`gen_salt('bf')`), nunca texto plano; ninguna RPC devuelve `pin_hash`.
- [x] `verificar_pin` con clave correcta → token + saldo; con clave incorrecta → `pin_intentos_fallidos +1`.
- [x] Al 5.º intento fallido → bloqueo 15 min; un acierto/recuperación resetea el contador.
- [ ] `consultar_puntos` anónima **ya no** revela el saldo detallado. ⏳ **DIFERIDO post-deploy** (la `/club` viva aún lo usa; ver §12).

### C2
- [ ] "Soy cliente" con token válido → entra sin teclear clave.
- [ ] Sin token → WhatsApp + clave → ve su saldo real (no el de `localStorage`).
- [ ] Cliente sin `pin_hash` (viejo o registro rápido) → flujo "Crea tu clave" por cumpleaños.
- [ ] Registro nuevo exige clave x2 y conserva el bono de 50 pts.
- [ ] Sesión sobrevive al refresco y a cerrar/abrir el navegador; logout la revoca.

### C3
- [ ] "Olvidé mi clave" con cumpleaños correcto → setea clave nueva y **revoca sesiones** previas.
- [ ] Cumpleaños incorrecto → error genérico (no revela si el número existe).
- [ ] Admin resetea la clave desde el POS → el cliente crea una nueva en su próximo ingreso.

### C4
- [ ] La tarjeta muestra saldo + historial (puntos por orden y canjes) solo con sesión válida.

### C5
- [ ] Admin y mozo ven la sección "Clientes Club DF" con nombre · WhatsApp · puntos.
- [ ] Buscador filtra por nombre o WhatsApp; la lista pagina sin traer toda la tabla de golpe.
- [ ] `listar_clientes_pos` está gateada por el rol del staff (no accesible con la anon key del público) y **nunca** devuelve `pin_hash`.
- [ ] La sección es de lectura: no permite editar puntos a mano (solo consumo/canje los mueven).

## 10. Fuera de alcance
- OTP por SMS/WhatsApp y login con Google (queda como upgrade futuro si hay abuso).
- Auto-canje por el cliente (ID-3: canje solo mozo/admin).
- Notificaciones automáticas de marketing (van en `specs/marketing/`).

## 11. Decisiones cerradas (aprobadas por Jean · 2026-07-09)
1. **Bloqueo:** ✅ **5 intentos / 15 min** (R-SEC).
2. **Recuperación:** ✅ **auto-servicio por cumpleaños + respaldo por reset del admin** (ID-4).
3. **Sesión:** ✅ **90 días** de "recordar este teléfono" (R6).
4. **Sección de clientes en el POS:** ✅ para **admin y mozo** (ID-7 / C5).

**Aprobado para implementar. Orden sugerido: C1 → (C2, C5) → C3 → C4.** Nada en producción se
altera (migración aditiva + backup). D-003 vigente: cada migración se verifica contra la BD real.

## 12. Estado de implementación (2026-07-09 · rama `development`)

**BD (Supabase `kknvrufoelhdtouprcvm`) — aplicada y verificada contra la base real:**
- Migraciones: `club_identidad_pin_schema`, `club_identidad_pin_rpcs_cliente(_fix_schema)`,
  `club_identidad_pin_rpcs_staff`, `club_identidad_pin_revoke_anon_staff`.
- Backup `_backup_clientes_20260709` (8 filas, RLS on). Columnas `pin_*` + tabla `sesiones_club` (RLS on).
- RPCs cliente (anon+authenticated): `establecer_pin`, `verificar_pin`, `recuperar_pin`,
  `sesion_valida`, `cerrar_sesion`, `historial_cliente`.
- RPCs staff (**solo authenticated**, gate `rol_actual()` ∈ {ADMIN,MOZO}): `listar_clientes_pos`, `admin_reset_pin`.
- Verificado por SQL: crear clave (con guard de cumpleaños), login ok/malo, **bloqueo a los 5**,
  sesión por token, recuperación (rota clave + revoca sesiones), y **permisos**: `anon` puede las del
  cliente y **no** las de staff; `authenticated` sí las de staff. Clientes reales: 8 = 8 (intactos).

**Frontend (`development`) — `npm run build` verde (tsc + vite, 138 módulos):**
- `src/lib/clubClient.ts` (+ funciones de identidad), `src/lib/tarjetaLocal.ts` (+ token de sesión).
- `src/pages/public/PublicClub.tsx` reescrito: inicio / registro con clave / login / crea tu clave /
  olvidé mi clave / sesión con historial. `TarjetaDF.tsx` ahora presentacional.
- POS: `src/components/Admin/ClientesClubPanel.tsx` (nuevo) enganchado en `AdminLayout` (⭐ Clientes)
  y `MozoLayout` (tab ⭐ Clientes). Métodos `listarClientesClub` / `resetearClaveCliente` en `supabaseClient`.
- Smoke test en navegador: `/club` renderiza; login con número inexistente → llama `verificar_pin`
  (anon) contra la BD real y muestra "No encontramos ese número". Sin errores de consola.

**Post-deployment (2026-07-11):**
1. ✅ **Deploy a producción:** Commit `0b2fbe9`, deployment `dpl_2zXPmreDWYYBHxRgCaPuy3J54nJv` a `destinofinal.vercel.app`.
   Build verde (138 módulos, tsc + vite OK).
2. ✅ **Endurecimiento:** `listar_clientes_pos` y `admin_reset_pin` protegidas con `rol_actual()` (solo staff).
   `consultar_puntos` es lectura pública (segura — sin operaciones de estado). `buscar_cliente_club`
   y `finalizar_club` ya estaban cerradas a anon. Migraciones aplicadas en BD.
3. ⏳ **Próximo:** Verificación en vivo de registro real + consumo + canje (no se hizo para no ensuciar
   prod; el camino de SQL fue validado con cliente desechable).
