import type { Item, Mesa, Perfil } from '../types'

// Helper para crear un Item de semilla (mock). En Supabase el id lo genera la BD.
let n = 0
function item(nombre: string, precio: number, categoria: Item['categoria']): Item {
  n += 1
  return {
    id: `item-${String(n).padStart(3, '0')}`,
    nombre,
    precio,
    categoria,
    activo: true,
    creado_en: new Date().toISOString(),
  }
}

// ── CARTA REAL (parseada de carta.md + cócteles agregados por Jean) ──
export const ITEMS_SEED: Item[] = [
  // Cervezas
  item('Cerveza (1 und)', 15, 'Cervezas'),
  item('Cerveza (3 und)', 40, 'Cervezas'),
  item('Cerveza (5 und)', 65, 'Cervezas'),
  item('Cerveza 3 Cruces (1 und)', 8, 'Cervezas'),
  item('Cerveza 3 Cruces (2 und)', 15, 'Cervezas'),
  // Gaseosas
  item('Inka Cola / Coca Cola (500 mL)', 5, 'Gaseosas'),
  item('Inka Cola / Coca Cola (1.5 L)', 14, 'Gaseosas'),
  // Aguas
  item('Agua Cielo (625 mL)', 3, 'Aguas'),
  item('San Mateo (625 mL)', 3.5, 'Aguas'),
  item('San Luis (625 mL)', 3.5, 'Aguas'),
  // Cigarros
  item('Cigarro Lucky (1 und)', 2.5, 'Cigarros'),
  item('Cigarro Lucky (1 caja)', 32, 'Cigarros'),
  // Cócteles (todos S/ 15)
  item('Mojito', 15, 'Cócteles'),
  item('Piña Colada', 15, 'Cócteles'),
  item('Pisco Sour', 15, 'Cócteles'),
  item('Laguna Azul', 15, 'Cócteles'),
  item('Machupichu', 15, 'Cócteles'),
  item('Cuba Libre', 15, 'Cócteles'),
  item('Pantera', 15, 'Cócteles'),
  item('Algarrobina', 15, 'Cócteles'),
  item('Durazno', 15, 'Cócteles'),
  item('Mango', 15, 'Cócteles'),
]

// 14 mesas, todas VACIA al iniciar.
export const MESAS_SEED: Mesa[] = Array.from({ length: 14 }, (_, i) => ({
  id: `mesa-${String(i + 1).padStart(2, '0')}`,
  numero: i + 1,
  estado: 'VACIA',
}))

// Perfiles. En Fase 1 (mock) la contraseña vive aquí; en Fase 2 la maneja Supabase Auth.
export const PERFILES_SEED: Perfil[] = [
  { id: 'user-mozo', usuario: 'mozo1', rol: 'MOZO' },
  { id: 'user-admin', usuario: 'admin', rol: 'ADMIN' },
]

// Credenciales mock (Fase 1). En Fase 2 esto desaparece — lo valida Supabase Auth.
export const CREDENCIALES_MOCK: Record<string, string> = {
  mozo1: 'mozo12',
  admin: 'mood12',
}
