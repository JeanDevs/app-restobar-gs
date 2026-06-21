import { useState } from 'react'
import Modal from '../Shared/Modal'
import { soles, etiquetaMesa } from '../../lib/format'
import { TIPOS_PAGO } from '../../types'
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

  return (
    <Modal titulo="¿Finalizar pedido?" onClose={onCancel}>
      <div className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Origen</span>
          <span className="font-semibold">{etiquetaMesa(orden.mesa_numero)}</span>
        </div>
        {orden.comensal && (
          <div className="flex justify-between">
            <span className="text-slate-500">Comensal</span>
            <span className="font-semibold">{orden.comensal}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-500">Total</span>
          <span className="font-semibold">{soles(orden.total)}</span>
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
                : 'border-slate-200 hover:bg-slate-50',
            ].join(' ')}
          >
            <input
              type="radio"
              name="tipo-pago"
              className="accent-marca-500"
              checked={tipo === t}
              onChange={() => setTipo(t)}
            />
            <span className="font-medium text-slate-700">{t}</span>
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
