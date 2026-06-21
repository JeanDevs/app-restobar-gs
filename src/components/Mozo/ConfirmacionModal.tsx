import Modal from '../Shared/Modal'
import { soles, etiquetaMesa } from '../../lib/format'
import type { TipoPago } from '../../types'

interface ConfirmacionModalProps {
  mesaNumero: number
  // Monto a cobrar al cerrar: total de la orden, o el saldo si hubo cobros parciales (D-E).
  total: number
  tipoPago: TipoPago
  busy: boolean
  // true si la orden tenía cobros parciales: el monto es un saldo, no el total.
  hayCobros?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmacionModal({
  mesaNumero,
  total,
  tipoPago,
  busy,
  hayCobros = false,
  onConfirm,
  onCancel,
}: ConfirmacionModalProps) {
  return (
    <Modal titulo="Confirmar cierre" onClose={busy ? undefined : onCancel}>
      <p className="mb-1 text-sm text-slate-600">¿Está seguro de cerrar esta orden?</p>
      <div className="mb-5 mt-3 space-y-1 rounded-lg bg-slate-50 px-3 py-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Origen</span>
          <span className="font-semibold">{etiquetaMesa(mesaNumero)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">{hayCobros ? 'Saldo a cobrar' : 'Total'}</span>
          <span className="font-semibold">
            {hayCobros && total === 0 ? 'Sin saldo pendiente' : soles(total)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Pago</span>
          <span className="font-semibold">{tipoPago}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="btn-ghost flex-1" onClick={onCancel} disabled={busy}>
          Cancelar
        </button>
        <button className="btn-success flex-1" onClick={onConfirm} disabled={busy}>
          {busy ? 'Cerrando…' : 'Sí, cerrar'}
        </button>
      </div>
    </Modal>
  )
}
