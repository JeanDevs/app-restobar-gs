// Tipos de dominio del POS Restobar GS.
// Estos tipos son la "fuente de verdad" compartida por mock (Fase 1) y Supabase (Fase 2).

export type Rol = 'MOZO' | 'ADMIN'
export type EstadoMesa = 'VACIA' | 'OCUPADA'
export type EstadoOrden = 'ABIERTA' | 'CERRADA' | 'PAGADA'
export type TipoPago = 'Yape' | 'PLIN' | 'Efectivo' | 'Tarjeta'

// mesa_numero === 0 representa una venta de BARRA (no asociada a una mesa).
export const MESA_BARRA = 0

// Categorías conocidas de la carta. Se deja abierto a string para permitir
// que el Admin cree categorías nuevas (ej. "Platos") sin tocar tipos.
export type Categoria =
  | 'Cervezas'
  | 'Gaseosas'
  | 'Aguas'
  | 'Cigarros'
  | 'Cócteles'
  | (string & {})

export interface Item {
  id: string
  nombre: string
  precio: number
  categoria: Categoria
  activo: boolean
  creado_en: string
}

export interface Mesa {
  id: string
  numero: number
  estado: EstadoMesa
}

export interface OrdenItem {
  id: string
  orden_id: string
  item_id: string
  item_nombre: string // snapshot del nombre al momento de agregar
  item_precio: number // snapshot del precio al momento de agregar
  cantidad: number
  subtotal: number
}

export interface Orden {
  id: string
  mesa_numero: number
  mesa_id: string
  total: number
  cantidad: number
  tipo_pago: TipoPago | null
  estado: EstadoOrden
  total_final: number | null
  mozo: string | null // usuario que tomó el pedido (snapshot)
  comensal: string | null // nombre/apodo corto para identificar (además de la mesa)
  dia_cerrado: boolean // true si ya entró en un cierre de día (corte de caja)
  creado_en: string
  cerrado_en: string | null
  items: OrdenItem[]
}

export interface Perfil {
  id: string
  usuario: string
  rol: Rol
}

export const TIPOS_PAGO: TipoPago[] = ['Yape', 'PLIN', 'Efectivo', 'Tarjeta']
