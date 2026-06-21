// Tipos de dominio del POS Restobar GS.
// Estos tipos son la "fuente de verdad" compartida por mock (Fase 1) y Supabase (Fase 2).

export type Rol = 'MOZO' | 'ADMIN'
export type EstadoMesa = 'VACIA' | 'OCUPADA'
// ANULADA (D-F): orden cancelada por admin con motivo; queda en historial, fuera de ventas.
export type EstadoOrden = 'ABIERTA' | 'CERRADA' | 'PAGADA' | 'ANULADA'
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
  pagado: boolean // true si ya fue cubierto por un cobro parcial (D-E)
}

// Un cobro registrado sobre una orden (D-E). Una orden puede tener varios:
// p.ej. cobro parcial de la gaseosa con Yape + cobro del saldo con Efectivo.
export interface Pago {
  id: string
  orden_id: string
  monto: number
  tipo_pago: TipoPago
  parcial: boolean // true = cobro parcial (la orden sigue abierta); false = pago del cierre
  item_ids: string[] // orden_items cubiertos por este cobro
  mozo: string | null // quién registró el cobro
  creado_en: string
}

export interface Orden {
  id: string
  mesa_numero: number
  mesa_id: string
  total: number
  cantidad: number
  tipo_pago: TipoPago | null // pago del cierre (último); el detalle real vive en `pagos`
  estado: EstadoOrden
  total_final: number | null
  pagado: number // suma de cobros parciales + cierre (D-E)
  mozo: string | null // usuario que tomó el pedido (snapshot)
  comensal: string | null // nombre/apodo corto para identificar (además de la mesa)
  dia_cerrado: boolean // true si ya entró en un cierre de día (corte de caja)
  motivo_anulacion: string | null // si estado === 'ANULADA' (D-F)
  creado_en: string
  cerrado_en: string | null
  items: OrdenItem[]
  pagos: Pago[] // cobros registrados (D-E)
}

export interface Perfil {
  id: string
  usuario: string
  rol: Rol
}

// Registro de auditoría de acciones sensibles (D-F, D-G): quién hizo qué y cuándo.
export type AccionAuditoria = 'CIERRE_DIA' | 'ANULAR_ORDEN'

export interface RegistroAuditoria {
  id: string
  accion: AccionAuditoria
  usuario: string // quién ejecutó la acción
  detalle: string // resumen legible (origen, total, motivo…)
  creado_en: string
}

export const TIPOS_PAGO: TipoPago[] = ['Yape', 'PLIN', 'Efectivo', 'Tarjeta']

// Saldo pendiente de una orden (total menos lo ya cobrado). Nunca negativo.
export const saldoPendiente = (o: Pick<Orden, 'total' | 'pagado'>): number =>
  Math.max(0, o.total - o.pagado)
