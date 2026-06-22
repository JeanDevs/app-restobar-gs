# 📊 Progreso — Fase 2: Supabase + Vercel

**Fecha:** 2026-06-21  
**Estado:** 85% — Infraestructura lista, últimos pasos de deployment

---

## ✅ Completado

### Infraestructura Supabase
- ✅ Proyecto Supabase creado: `app-restobar-gs` (ID: `kknvrufoelhdtouprcvm`)
- ✅ Esquema SQL completo deployado:
  - Tabla `perfiles` (auth mapping)
  - Tabla `items` (24 ítems sembrados)
  - Tabla `mesas` (1-14 creadas)
  - Tabla `ordenes` (con índices y triggers)
  - Tabla `orden_items` (con snapshots)
  - Tabla `pagos` (para cobros parciales)
  - Tabla `auditoria` (para logs sensibles)
- ✅ RLS (Row Level Security) configurado:
  - Función `rol_actual()` creada
  - Políticas por tabla (MOZO vs ADMIN)
  - Realtime habilitado en tablas clave
- ✅ Seed data cargado:
  - Mesas 1-14 creadas
  - 24 ítems de carta sembrados

### Código y Configuración
- ✅ `.env.local` creado con credenciales Supabase
- ✅ `.env.example` actualizado para referencia
- ✅ `vercel.json` configurado para Vite
- ✅ Build compila sin errores: `npm run build` ✓ (127 módulos)
- ✅ Commits hechos a git:
  - `404f654` — Fase 2: Supabase infraestructura completada
  - `a56e51a` — Fase 2: Configuración de Vercel para deploy

### Documentación
- ✅ `SETUP_AUTH.md` — Instrucciones para crear usuarios en Auth
- ✅ `VERCEL_DEPLOY.md` — Guía de deployment
- ✅ `PROGRESO_FASE2.md` — Este archivo

---

## ⏳ Próximos Pasos (15% restante)

### 1. **Crear Usuarios Auth en Supabase** (CRÍTICO)
**Quién:** Jean (manual en Supabase dashboard)  
**Qué:** Crear 2 usuarios en Auth:
- Email: `mozo1@restobar-gs.local` / Password: `mozo12`
- Email: `admin@restobar-gs.local` / Password: `mood12`

**Dónde:** https://supabase.com/dashboard/projects/kknvrufoelhdtouprcvm → Authentication → Users

**Luego:** Ejecutar SQL en el Editor (copiar UUIDs de los usuarios recién creados):
```sql
insert into public.perfiles (id, usuario, rol) values
  ('<UUID_MOZO1>', 'mozo1', 'MOZO'),
  ('<UUID_ADMIN>', 'admin', 'ADMIN');
```

**Tiempo estimado:** 2 minutos

### 2. **Testing Local (Opcional pero Recomendado)**
```bash
npm run dev
# Accede a http://localhost:5173
# Intenta login con mozo1/mozo12 y admin/mood12
```

**Tiempo estimado:** 3 minutos

### 3. **Push a GitHub (si no está hecho)**
```bash
git remote add origin https://github.com/TU_USUARIO/app-restobar-gs.git
git branch -M main
git push -u origin main
```

**Tiempo estimado:** 1 minuto

### 4. **Deploy a Vercel**
**Opción A (Recomendada): Vercel Dashboard**
1. Ve a https://vercel.com/new
2. Selecciona "Import Git Repository"
3. Busca `app-restobar-gs`
4. Selecciona framework "Vite"
5. En Environment Variables, agrega:
   ```
   VITE_SUPABASE_URL = https://kknvrufoelhdtouprcvm.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrbnZydWZvZWxoZHRvdXByY3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzUxOTQsImV4cCI6MjA5NzY1MTE5NH0.2izbOlPczt5TNEKKtKW9r524E8MBbg-rFhjtR7m3U4s
   VITE_DATA_SOURCE = supabase
   ```
6. Haz clic en "Deploy"

**Opción B: CLI de Vercel**
```bash
npm i -g vercel
vercel --prod
```

**Tiempo estimado:** 3-5 minutos

### 5. **Verificación en Producción**
- Accede a la URL de Vercel (ej: `https://app-restobar-gs-xyz.vercel.app`)
- Intenta login: `mozo1 / mozo12` (mozo) y `admin / mood12` (admin)
- Prueba flujos:
  - **Mozo:** selecciona mesa → agrega items → finaliza con pago
  - **Admin:** ve órdenes, estadísticas, gestiona menú

**Tiempo estimado:** 5 minutos

---

## 📝 Resumen de Credenciales

| Recurso | URL / Valor |
|---------|-----------|
| Supabase Project | `kknvrufoelhdtouprcvm` |
| Supabase URL | `https://kknvrufoelhdtouprcvm.supabase.co` |
| Supabase Anon Key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (ver `.env.local`) |
| Supabase Dashboard | https://supabase.com/dashboard/projects/kknvrufoelhdtouprcvm |
| Usuario Mozo | `mozo1@restobar-gs.local` / `mozo12` |
| Usuario Admin | `admin@restobar-gs.local` / `mood12` |

---

## 🎯 Fase 3 (Después de este deploy)

Una vez que el deploy esté en Vercel y los logins funcionen:
- Mejoras del backlog (PLIN, permisos por mozo, etc.)
- Performance tunning
- Security audit (OWASP)
- Handoff documentation

---

## 📞 Soporte

Si hay problemas:
1. Revisa `VERCEL_DEPLOY.md` → Troubleshooting
2. Chequea los logs de Vercel en el dashboard
3. Chequea los logs de Supabase en el dashboard
4. Verifica que `.env.local` tiene las credenciales correctas (nunca comitear)
