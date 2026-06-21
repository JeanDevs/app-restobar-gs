-- ============================================================================
-- Restobar GS · Semilla (FASE 2). Correr DESPUÉS de schema.sql.
-- ============================================================================

-- ── Mesas 1..14 ─────────────────────────────────────────────────────────────
insert into public.mesas (numero)
select g from generate_series(1, 14) as g
on conflict (numero) do nothing;

-- ── Carta (24 ítems: carta.md + cócteles) ───────────────────────────────────
insert into public.items (nombre, precio, categoria) values
  ('Cerveza (1 und)',                  15,   'Cervezas'),
  ('Cerveza (3 und)',                  40,   'Cervezas'),
  ('Cerveza (5 und)',                  65,   'Cervezas'),
  ('Cerveza 3 Cruces (1 und)',          8,   'Cervezas'),
  ('Cerveza 3 Cruces (2 und)',         15,   'Cervezas'),
  ('Inka Cola (500 mL)',                5,   'Gaseosas'),
  ('Coca Cola (500 mL)',                5,   'Gaseosas'),
  ('Inka Cola (1.5 L)',                14,   'Gaseosas'),
  ('Coca Cola (1.5 L)',                14,   'Gaseosas'),
  ('Agua Cielo (625 mL)',               3,   'Aguas'),
  ('San Mateo (625 mL)',                3.5, 'Aguas'),
  ('San Luis (625 mL)',                 3.5, 'Aguas'),
  ('Cigarro Lucky (1 und)',             2.5, 'Cigarros'),
  ('Cigarro Lucky (1 caja)',           32,   'Cigarros'),
  ('Mojito',                           15,   'Cócteles'),
  ('Piña Colada',                      15,   'Cócteles'),
  ('Pisco Sour',                       15,   'Cócteles'),
  ('Laguna Azul',                      15,   'Cócteles'),
  ('Machupichu',                       15,   'Cócteles'),
  ('Cuba Libre',                       15,   'Cócteles'),
  ('Pantera',                          15,   'Cócteles'),
  ('Algarrobina',                      15,   'Cócteles'),
  ('Durazno',                          15,   'Cócteles'),
  ('Mango',                            15,   'Cócteles');

-- ── Perfiles ─────────────────────────────────────────────────────────────────
-- 1) Crear primero los 2 usuarios en Authentication → Users (Supabase dashboard):
--      mozo1@restobar-gs.local  /  mozo12     (rol MOZO)
--      admin@restobar-gs.local  /  mood12     (rol ADMIN)
-- 2) Copiar el UUID de cada uno y reemplazar abajo:
--
-- insert into public.perfiles (id, usuario, rol) values
--   ('<uuid-de-mozo1>', 'mozo1', 'MOZO'),
--   ('<uuid-de-admin>', 'admin', 'ADMIN');
