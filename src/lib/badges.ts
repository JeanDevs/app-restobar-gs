import type { TipoPago } from '../types'

// Color (bg + text) del badge por tipo de pago. Única fuente de verdad: se usa
// en el historial, el detalle y cualquier sitio que muestre el tipo de pago.
// Combinar con la clase base `.badge` (definida en index.css).
const COLOR_PAGO: Record<TipoPago, string> = {
  Yape: 'bg-purple-100 text-purple-700',
  PLIN: 'bg-blue-100 text-blue-700',
  Efectivo: 'bg-emerald-100 text-emerald-700',
  Tarjeta: 'bg-marca-100 text-marca-700',
}

export function colorPago(tipo: TipoPago | string | null | undefined): string {
  return (tipo && COLOR_PAGO[tipo as TipoPago]) || 'bg-cacao-100 text-cacao-600'
}
