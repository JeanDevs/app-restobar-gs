# 🚀 Despliegue en Vercel

## ✅ Checklist Pre-Deploy

- [x] Supabase proyecto creado: `kknvrufoelhdtouprcvm`
- [x] Esquema SQL deployado (7 tablas, RLS, funciones)
- [x] Mesas (1-14) e Items (24) semillados
- [x] Variables de entorno configuradas en `.env.local`
- [x] Build compila sin errores: `npm run build` ✓
- [ ] Usuarios Auth creados en Supabase (mozo1, admin) — **ACCIÓN MANUAL NECESARIA** (ver `SETUP_AUTH.md`)
- [ ] Testing local completado (login + flujos)

## 📋 Pasos para Desplegar

### 1. Crear repositorio en GitHub (si no existe)

```bash
# Si no tienes remote configurado:
git remote add origin https://github.com/TU_USUARIO/app-restobar-gs.git
git branch -M main
git push -u origin main
```

### 2. Importar a Vercel

**Opción A: Desde Vercel Dashboard**
1. Ve a https://vercel.com/new
2. Importa el repositorio de GitHub: `app-restobar-gs`
3. Selecciona "Next.js / Vite" framework
4. En "Environment Variables", agrega:
   - `VITE_SUPABASE_URL`: `https://kknvrufoelhdtouprcvm.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrbnZydWZvZWxoZHRvdXByY3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzUxOTQsImV4cCI6MjA5NzY1MTE5NH0.2izbOlPczt5TNEKKtKW9r524E8MBbg-rFhjtR7m3U4s`
   - `VITE_DATA_SOURCE`: `supabase`
5. Haz clic en "Deploy"

**Opción B: Desde Claude Code (via MCP)**
```bash
# Claude Code intentará usar el MCP de Vercel
# si está autenticado
```

### 3. Verificar deploy

Una vez que Vercel termine de deployar:
- URL de preview: `https://app-restobar-gs-<hash>.vercel.app`
- Accede a esa URL en tu navegador
- Intenta login: `mozo1 / mozo12` o `admin / mood12`

### 4. Configurar dominio (opcional)

En Vercel → Project Settings → Domains, puedes añadir un dominio personalizado.

## 🔑 Credenciales Supabase

**URL:** `https://kknvrufoelhdtouprcvm.supabase.co`

**Anon Key:** 
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrbnZydWZvZWxoZHRvdXByY3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzUxOTQsImV4cCI6MjA5NzY1MTE5NH0.2izbOlPczt5TNEKKtKW9r524E8MBbg-rFhjtR7m3U4s
```

**Supabase Dashboard:** https://supabase.com/dashboard/projects/kknvrufoelhdtouprcvm

## 🐛 Troubleshooting

**Error: "Cannot find module '@supabase/supabase-js'"**
- Solución: `npm install` en Vercel está siendo ejecutado correctamente. Si aún falla, revisa el `package.json`.

**Error: "VITE_SUPABASE_URL is undefined"**
- Solución: Verifica que las variables de entorno están en Vercel → Settings → Environment Variables

**Login falla**
- Solución: Revisa que los usuarios Auth estén creados en Supabase (ver `SETUP_AUTH.md`)

## ✨ Siguiente paso

Después del deploy exitoso, vamos con:
1. Testing end-to-end en producción
2. Mejoras adicionales del backlog (pagos PLIN/Tarjeta, etc.)
