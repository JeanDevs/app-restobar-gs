# Configuración de Usuarios en Supabase

## 🔐 Crear Usuarios en Authentication

Sigue estos pasos para crear los dos usuarios requeridos en Supabase:

1. **Abre Supabase Dashboard:**
   - Ve a: https://supabase.com/dashboard/projects/kknvrufoelhdtouprcvm
   - Haz clic en "Authentication" en el menú lateral

2. **Crear usuario MOZO:**
   - Haz clic en "Users" → "Invite user" o "Add user"
   - Email: `mozo1@restobar-gs.local`
   - Password: `mozo12`
   - Haz clic en "Send invite" (o crear directamente si la opción está disponible)
   - **Copia el UUID del usuario** que aparece en la tabla (columna "ID")

3. **Crear usuario ADMIN:**
   - Repite el proceso:
   - Email: `admin@restobar-gs.local`
   - Password: `mood12`
   - **Copia el UUID del usuario**

## 📝 Vincular UUIDs en la BD

Una vez que tengas los UUIDs, corre esta query en el SQL Editor de Supabase:

```sql
insert into public.perfiles (id, usuario, rol) values
  ('<UUID_MOZO1>', 'mozo1', 'MOZO'),
  ('<UUID_ADMIN>', 'admin', 'ADMIN');
```

Reemplaza:
- `<UUID_MOZO1>` con el UUID del usuario mozo1
- `<UUID_ADMIN>` con el UUID del usuario admin

## ✅ Verificación

Después de crear los usuarios:

```bash
# 1. Instala dependencias
npm install

# 2. Inicia la app en desarrollo
npm run dev

# 3. Prueba login:
#    - Mozo: mozo1 / mozo12
#    - Admin: admin / mood12
```

## 🚀 Siguiente paso: Vercel

Una vez que los logins funcionen localmente, vamos a deployar en Vercel.
