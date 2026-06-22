// Script para crear usuarios en Supabase Auth (requiere service role key)
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://kknvrufoelhdtouprcvm.supabase.co';
// IMPORTANTE: Necesitas reemplazar esto con el SERVICE_ROLE_KEY de tu proyecto Supabase
// Ve a: Dashboard → Settings → API → service_role key
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY no definido. Necesitas:');
  console.error('1. Ir a: https://supabase.com/dashboard/projects/kknvrufoelhdtouprcvm/settings/api');
  console.error('2. Copiar el service_role key (SECRET)');
  console.error('3. Ejecutar: $env:SUPABASE_SERVICE_ROLE_KEY="<paste_key_here>"; node create-auth-users.js');
  process.exit(1);
}

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createUsers() {
  console.log('Creando usuarios en Supabase Auth...');

  const users = [
    {
      email: 'mozo1@restobar-gs.local',
      password: 'mozo12',
      user_metadata: { nombre: 'Mozo 1' },
    },
    {
      email: 'admin@restobar-gs.local',
      password: 'mood12',
      user_metadata: { nombre: 'Administrador' },
    },
  ];

  for (const user of users) {
    try {
      const { data, error } = await adminClient.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: user.user_metadata,
      });

      if (error) {
        console.error(`Error creando ${user.email}:`, error.message);
      } else {
        console.log(`✓ Usuario creado: ${user.email}`);
        console.log(`  UUID: ${data.user.id}`);
      }
    } catch (err) {
      console.error(`Excepción al crear ${user.email}:`, err.message);
    }
  }

  console.log('\nDone!');
}

createUsers();
