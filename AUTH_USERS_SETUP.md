# 🔐 Configurar Usuarios de Supabase Auth

## ✅ RESUELTO (2026-06-22) — Login funcional

**Estado:** Los usuarios de Supabase Auth **ya están creados y verificados** vía MCP:

| Email | Password | Rol | UUID | Confirmado |
|---|---|---|---|---|
| `mozo1@restobar-gs.local` | `mozo12` | MOZO | `d7d736a5-…` | ✅ |
| `admin@restobar-gs.local` | `mood12` | ADMIN | `182ece6c-…` | ✅ |

Los UUIDs están vinculados a `public.perfiles` y las contraseñas verificadas con
`crypt()`. El login funciona en local y en producción. La guía de abajo se conserva
como referencia por si hay que recrear los usuarios.

---

## 📜 Referencia histórica (cómo se crearon)

**Investigación original:**
- ✅ BD Supabase: proyecto, esquema, mesas (14), items (24) → TODO OK
- ✅ Perfiles en tabla `public.perfiles`: mozo1 (MOZO), admin (ADMIN) → TODO OK
- ✅ Usuarios en `auth.users` (Supabase Auth) → **CREADOS**

**Código esperado (supabaseClient.ts:123):**
```typescript
const email = `${usuario}@restobar-gs.local`
const { data, error } = await sb().auth.signInWithPassword({ email, password: contrasena })
```

Cuando ingresa "mozo1", busca `mozo1@restobar-gs.local` en Supabase Auth.

---

## ✅ Solución: Crear usuarios en Supabase Auth

### Opción A: Dashboard Supabase (Manual)

1. Ve a: https://supabase.com/dashboard/projects/kknvrufoelhdtouprcvm/auth/users
2. Haz clic en **"Add user"** o **"Invite user"**

**Usuario 1 (Mozo):**
- Email: `mozo1@restobar-gs.local`
- Password: `mozo12`
- Haz clic en **Create user**
- ✅ Debería crear exitosamente (UUID auto-generado)

**Usuario 2 (Admin):**
- Email: `admin@restobar-gs.local`
- Password: `mood12`
- Haz clic en **Create user**
- ✅ Debería crear exitosamente

### Opción B: Script Node.js (Automático)

```bash
# En la raíz del proyecto:
# 1. Obtén el SERVICE_ROLE_KEY en: Dashboard → Settings → API
# 2. Reemplaza <PASTE_YOUR_SERVICE_ROLE_KEY>
$env:SUPABASE_SERVICE_ROLE_KEY="<PASTE_YOUR_SERVICE_ROLE_KEY>"
node create-auth-users.js
```

El script está en `create-auth-users.js` en la raíz del proyecto.

---

## 🧪 Verificación Post-Setup

Una vez creados los usuarios, el login debe funcionar:

```bash
npm run dev
# Abre http://localhost:5173
# Intenta login:
#   - mozo1 / mozo12
#   - admin / mood12
```

---

## 📝 Notas

- Los emails **deben ser exactos**: `mozo1@restobar-gs.local` y `admin@restobar-gs.local`
- Las contraseñas **deben coincidir**: mozo12 y mood12
- Los UUIDs de Supabase Auth se vincularán automáticamente con la tabla `perfiles` (ya están los registros ahí)
- Una vez funcione el login local, redeploy en Vercel ejecutará `git push origin main`

---

## 🚀 Next Steps (después de setup Auth)

1. **Testing local** (login + flujos)
2. **Push a GitHub** (`git push origin main`)
3. **Vercel redeploy** (auto-triggered by GitHub push)
4. **Verificación en prod** (https://app-restobar-gs.vercel.app)
