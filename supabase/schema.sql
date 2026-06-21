-- ============================================================================
-- Restobar GS · Esquema PostgreSQL para Supabase (FASE 2 — aún no aplicado)
-- Decisiones: D-B (Supabase Auth + perfiles), D-C (orden ABIERTA), D-D (1 ítem
-- por presentación). Correr este archivo en el SQL Editor de Supabase.
-- ============================================================================

-- ── PERFILES ────────────────────────────────────────────────────────────────
-- Supabase Auth maneja email/password en auth.users. Esta tabla mapea cada
-- usuario autenticado a su rol (MOZO/ADMIN). Reemplaza la tabla `usuarios` custom.
create table if not exists public.perfiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  usuario    text unique not null,
  rol        text not null check (rol in ('MOZO', 'ADMIN')),
  creado_en  timestamptz not null default now()
);

-- ── ITEMS (carta) ───────────────────────────────────────────────────────────
create table if not exists public.items (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  precio     numeric(10,2) not null check (precio >= 0),
  categoria  text not null,
  activo     boolean not null default true,
  creado_en  timestamptz not null default now()
);

-- ── MESAS (1..14) ───────────────────────────────────────────────────────────
create table if not exists public.mesas (
  id         uuid primary key default gen_random_uuid(),
  numero     int unique not null check (numero between 1 and 14),
  estado     text not null default 'VACIA' check (estado in ('VACIA', 'OCUPADA')),
  creado_en  timestamptz not null default now()
);

-- ── ORDENES (núcleo) ────────────────────────────────────────────────────────
create table if not exists public.ordenes (
  id           uuid primary key default gen_random_uuid(),
  mesa_numero  int not null,   -- 1..14 = mesa; 0 = Barra (venta sin mesa)
  mesa_id      uuid references public.mesas(id),
  total        numeric(10,2) not null default 0,
  cantidad     int not null default 0,
  tipo_pago    text check (tipo_pago in ('Yape', 'PLIN', 'Efectivo', 'Tarjeta')),
  estado       text not null default 'ABIERTA' check (estado in ('ABIERTA', 'CERRADA', 'PAGADA')),
  total_final  numeric(10,2),
  mozo         text,           -- usuario que tomó el pedido (snapshot; ver perfiles.usuario)
  comensal     text,           -- nombre/apodo corto para identificar (además de la mesa)
  dia_cerrado  boolean not null default false,  -- true si ya entró en un cierre de día
  creado_en    timestamptz not null default now(),
  cerrado_en   timestamptz
);

-- Regla de negocio: como máximo UNA orden ABIERTA por mesa (evita duplicados).
create unique index if not exists ux_orden_abierta_por_mesa
  on public.ordenes (mesa_numero)
  where estado = 'ABIERTA';

create index if not exists ix_ordenes_estado on public.ordenes (estado);
create index if not exists ix_ordenes_cerrado_en on public.ordenes (cerrado_en);

-- ── ORDEN_ITEMS (detalle, con snapshot de nombre/precio) ────────────────────
create table if not exists public.orden_items (
  id           uuid primary key default gen_random_uuid(),
  orden_id     uuid not null references public.ordenes(id) on delete cascade,
  item_id      uuid references public.items(id),
  item_nombre  text not null,
  item_precio  numeric(10,2) not null,
  cantidad     int not null check (cantidad > 0),
  subtotal     numeric(10,2) not null,
  creado_en    timestamptz not null default now()
);

create index if not exists ix_orden_items_orden on public.orden_items (orden_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- Regla (spec): el mozo NO edita el menú; solo el ADMIN. Todo lo demás lo puede
-- operar cualquier usuario autenticado (1 mozo + 1 admin).
-- ============================================================================

-- Helper: rol del usuario actual (SECURITY DEFINER para poder leer perfiles).
create or replace function public.rol_actual()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select rol from public.perfiles where id = auth.uid()
$$;

alter table public.perfiles    enable row level security;
alter table public.items       enable row level security;
alter table public.mesas       enable row level security;
alter table public.ordenes     enable row level security;
alter table public.orden_items enable row level security;

-- PERFILES: cada quien ve su perfil; el admin ve todos.
drop policy if exists "perfiles_select" on public.perfiles;
create policy "perfiles_select" on public.perfiles for select
  using (id = auth.uid() or public.rol_actual() = 'ADMIN');

-- ITEMS: lectura para autenticados; escritura solo ADMIN.
drop policy if exists "items_select" on public.items;
create policy "items_select" on public.items for select
  using (auth.role() = 'authenticated');

drop policy if exists "items_write_admin" on public.items;
create policy "items_write_admin" on public.items for all
  using (public.rol_actual() = 'ADMIN')
  with check (public.rol_actual() = 'ADMIN');

-- MESAS: lectura + actualización de estado para autenticados.
drop policy if exists "mesas_select" on public.mesas;
create policy "mesas_select" on public.mesas for select
  using (auth.role() = 'authenticated');

drop policy if exists "mesas_update" on public.mesas;
create policy "mesas_update" on public.mesas for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ORDENES y ORDEN_ITEMS: operables por cualquier autenticado.
drop policy if exists "ordenes_all" on public.ordenes;
create policy "ordenes_all" on public.ordenes for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "orden_items_all" on public.orden_items;
create policy "orden_items_all" on public.orden_items for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================================
-- REALTIME (decisión D-C): el admin ve las órdenes actualizarse en vivo.
-- ============================================================================
alter publication supabase_realtime add table public.ordenes;
alter publication supabase_realtime add table public.orden_items;
alter publication supabase_realtime add table public.mesas;
