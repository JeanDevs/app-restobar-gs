# 🚀 Deploy Manual a Vercel — APP-RESTOBAR-GS

## ✅ Pre-requisitos (todos completados)

- ✅ Supabase proyecto creado y configurado
- ✅ Build compila sin errores
- ✅ `.env.local` con credenciales
- ✅ Código en git con 3 commits

## 📋 Pasos para Deploy

### Paso 1: Crear Usuarios en Supabase Auth (CRÍTICO)

**URL:** https://supabase.com/dashboard/projects/kknvrufoelhdtouprcvm

1. Haz clic en **"Authentication"** en el menú lateral
2. Haz clic en **"Users"**
3. Haz clic en **"Invite user"** o **"Add user"**

**Crear Usuario 1 (Mozo):**
- Email: `mozo1@restobar-gs.local`
- Password: `mozo12`
- Haz clic en crear usuario
- **COPIAR EL UUID** que aparece en la columna "ID"

**Crear Usuario 2 (Admin):**
- Email: `admin@restobar-gs.local`
- Password: `mood12`
- Haz clic en crear usuario
- **COPIAR EL UUID** que aparece en la columna "ID"

### Paso 2: Vincular Usuarios a Perfiles en BD

1. En Supabase dashboard, haz clic en **"SQL Editor"**
2. Crea una nueva query
3. Copia y pega esto (reemplazando los UUIDs):

```sql
INSERT INTO public.perfiles (id, usuario, rol) VALUES
  ('<UUID_MOZO1>', 'mozo1', 'MOZO'),
  ('<UUID_ADMIN>', 'admin', 'ADMIN');
```

Ejemplo (reemplaza con tus UUIDs reales):
```sql
INSERT INTO public.perfiles (id, usuario, rol) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'mozo1', 'MOZO'),
  ('660e8400-e29b-41d4-a716-446655440000', 'admin', 'ADMIN');
```

4. Haz clic en "Run"
5. Verifica que dice "1 row inserted" (dos veces, una por usuario)

### Paso 3: Testing Local (Opcional pero Recomendado)

```bash
# En la carpeta del proyecto
npm run dev

# Abre http://localhost:5173 en tu navegador
# Intenta login:
#   - mozo1 / mozo12
#   - admin / mood12

# Si funciona, cierra con Ctrl+C
```

### Paso 4: Crear Repo en GitHub

**Opción A: Si no tienes GitHub**
1. Ve a https://github.com/new
2. Nombre del repo: `app-restobar-gs`
3. Descripción: "POS web de control de mesas para Restobar GS"
4. Privado o público (tu elección)
5. NO inicialices con README (ya tienes código local)
6. Haz clic en "Create repository"

**Opción B: Si ya tienes el repo en GitHub**
1. Ve a tu repo en GitHub
2. Copia la URL HTTPS (ej: `https://github.com/tu-usuario/app-restobar-gs.git`)

### Paso 5: Pushear Código a GitHub

```bash
# En la carpeta del proyecto

# Si es la PRIMERA VEZ (no tienes remoto):
git remote add origin https://github.com/TU_USUARIO/app-restobar-gs.git
git branch -M main
git push -u origin main

# Si ya tienes remoto configurado:
git push origin main
```

### Paso 6: Deploy a Vercel

**Opción A: Desde Vercel Dashboard (RECOMENDADO)**

1. Ve a https://vercel.com/dashboard
2. Haz clic en **"Add New..."** → **"Project"**
3. Haz clic en **"Import Git Repository"**
4. Busca y selecciona `app-restobar-gs`
5. Haz clic en **"Import"**

**Configurar Build Settings:**
- Framework: Dejar que Vercel auto-detecte (debería detectar Vite)
- Build Command: `npm run build` (auto)
- Output Directory: `dist` (auto)

**Configurar Environment Variables:**
Haz clic en **"Environment Variables"** y agrega estas 3 variables:

| Nombre | Valor |
|--------|-------|
| `VITE_SUPABASE_URL` | `https://kknvrufoelhdtouprcvm.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrbnZydWZvZWxoZHRvdXByY3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzUxOTQsImV4cCI6MjA5NzY1MTE5NH0.2izbOlPczt5TNEKKtKW9r524E8MBbg-rFhjtR7m3U4s` |
| `VITE_DATA_SOURCE` | `supabase` |

7. Haz clic en **"Deploy"**
8. **Espera 2-5 minutos** a que termine

**Opción B: Desde CLI (Alternativa)**

```bash
npm i -g vercel
cd C:\Users\JeanTS\Documents\PROYECTOS_APPS\CARTA_DIGITAL\APP-RESTOBAR-GS
vercel --prod
# Sigue las instrucciones interactivas
```

### Paso 7: Verificar Deployment

1. Vercel te mostrará una URL como: `https://app-restobar-gs-xyz123.vercel.app`
2. Abre esa URL en tu navegador
3. Intenta login con:
   - **Mozo:** `mozo1 / mozo12`
   - **Admin:** `admin / mood12`
4. Si funciona, prueba estos flujos:

**Flujo Mozo:**
- Selecciona una mesa (ej: mesa 1)
- Busca un ítem (ej: "Cerveza")
- Agrega cantidad
- Haz clic en "Agregar"
- Verifica que aparece en "Orden Actual"
- Haz clic en "Finalizar"
- Selecciona tipo de pago (Yape, PLIN, Efectivo, Tarjeta)
- Completa el pago

**Flujo Admin:**
- Pestaña "Pedidos" debería mostrar la orden que acabas de crear
- Pestaña "Auditoría" debería estar vacía (o mostrar cierres/anulaciones)

---

## 🔧 Troubleshooting

### Error: "Build failed"
- Verifica que `npm run build` funciona localmente
- Revisa los logs de Vercel (haz clic en el deployment fallido)

### Error: "Cannot find module @supabase/supabase-js"
- Vercel debería instalar dependencias automáticamente
- Si falla, revisa que `package.json` tiene `@supabase/supabase-js`

### Login falla
- Verifica que creaste los usuarios en Supabase Auth
- Verifica que ejecutaste el SQL de `perfiles` con los UUIDs correctos

### Variables de entorno undefined
- Verifica que están en Vercel Settings → Environment Variables
- Verifica que los nombres son exactos (case-sensitive): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DATA_SOURCE`

---

## 📞 Resumen de URLs Importantes

| Recurso | URL |
|---------|-----|
| Supabase Dashboard | https://supabase.com/dashboard/projects/kknvrufoelhdtouprcvm |
| Vercel Dashboard | https://vercel.com/dashboard |
| Repo GitHub | https://github.com/TU_USUARIO/app-restobar-gs |
| App en Vercel | https://app-restobar-gs-xyz.vercel.app (después del deploy) |

---

## ✨ Siguiente Paso

Después de que el deploy esté exitoso:
1. Testing end-to-end en producción
2. Mejoras del backlog (pagos PLIN, permisos por mozo, etc.)
3. Performance & security review

---

**Tiempo estimado:** 10-15 minutos

¡Listo! Sigue estos pasos y deberías tener la app en Vercel en pocos minutos. 🚀
