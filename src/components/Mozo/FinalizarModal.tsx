import { useState } from 'react'
import Modal from '../Shared/Modal'
import { soles, etiquetaMesa } from '../../lib/format'
import { TIPOS_PAGO, saldoPendiente } from '../../types'
import type { Orden, TipoPago } from '../../types'

interface FinalizarModalProps {
  orden: Orden
  onConfirmTipo: (tipo: TipoPago) => void
  onCancel: () => void
}

export default function FinalizarModal({
  orden,
  onConfirmTipo,
  onCancel,
}: FinalizarModalProps) {
  const [tipo, setTipo] = useState<TipoPago | null>(null)

  // Con cobros parciales (D-E), al cerrar solo se cobra el saldo, no el total.
  const hayCobros = orden.pagado > 0
  const saldo = saldoPendiente(orden)

  return (
    <Modal titulo="¿Finalizar pedido?" onClose={onCancel}>
      <div className="mb-4 rounded-lg bg-cacao-50 px-3 py-2 text-sm">
        <div className="flex justify-between">
          <span className="text-cacao-500">Origen</span>
          <span className="font-semibold">{etiquetaMesa(orden.mesa_numero)}</span>
        </div>
        {orden.comensal && (
          <div className="flex justify-between">
            <span className="text-cacao-500">Comensal</span>
            <span className="font-semibold">{orden.comensal}</span>
          </div>
        )}
        {hayCobros && (
          <div className="flex justify-between">
            <span className="text-cacao-500">Pagado</span>
            <span className="font-semibold text-emerald-600">{soles(orden.pagado)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-cacao-500">{hayCobros ? 'Saldo a cobrar' : 'Total'}</span>
          <span className="font-semibold">
            {hayCobros && saldo === 0 ? 'Sin saldo pendiente' : soles(hayCobros ? saldo : orden.total)}
          </span>
        </div>
      </div>

      <p className="label">Tipo de pago</p>
      <div className="mb-5 space-y-2">
        {TIPOS_PAGO.map((t) => (
          <label
            key={t}
            className={[
              'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition',
              tipo === t
                ? 'border-marca-500 bg-marca-50'
                : 'border-cacao-200 hover:bg-cacao-50',
            ].join(' ')}
          >
            <input
              type="radio"
              name="tipo-pago"
              className="accent-marca-500"
              checked={tipo === t}
              onChange={() => setTipo(t)}
            />
            <span className="font-medium text-cacao-700">{t}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-2">
        <button className="btn-ghost flex-1" onClick={onCancel}>
          Cancelar
        </button>
        <button
          className="btn-primary flex-1"
          disabled={!tipo}
          onClick={() => tipo && onConfirmTipo(tipo)}
        >
          Confirmar
        </button>
      </div>
    </Modal>
  )
}
