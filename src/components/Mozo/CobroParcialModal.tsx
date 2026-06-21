import { useMemo, useState } from 'react'
import Modal from '../Shared/Modal'
import { soles } from '../../lib/format'
import { TIPOS_PAGO } from '../../types'
import type { Orden, TipoPago } from '../../types'

interface CobroParcialModalProps {
  orden: Orden
  onConfirm: (ordenItemIds: string[], tipoPago: TipoPago) => void
  onCancel: () => void
}

// Cobro parcial (D-E): selecciona ítems aún sin pagar y registra un cobro;
// la orden sigue abierta con saldo pendiente.
export default function CobroParcialModal({
  orden,
  onConfirm,
  onCancel,
}: CobroParcialModalProps) {
  // Solo se pueden cobrar los ítems que todavía no están pagados.
  const pendientes = useMemo(
    () => orden.items.filter((it) => !it.pagado),
    [orden.items],
  )
  const [seleccion, setSeleccion] = useState<Set<string>>(new Set())
  const [tipo, setTipo] = useState<TipoPago | null>(null)

  function toggle(id: string) {
    setSeleccion((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Subtotal en vivo de lo seleccionado.
  const subtotalSel = pendientes
    .filter((it) => seleccion.has(it.id))
    .reduce((s, it) => s + it.subtotal, 0)

  const puedeConfirmar = seleccion.size > 0 && tipo != null

  return (
    <Modal titulo="Cobro parcial" onClose={onCancel}>
      <p className="label">Ítems a cobrar</p>
      <div className="mb-4 space-y-2">
        {pendientes.map((it) => (
          <label
            key={it.id}
            className={[
              'flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition',
              seleccion.has(it.id)
                ? 'border-marca-500 bg-marca-50'
                : 'border-slate-200 hover:bg-slate-50',
            ].join(' ')}
          >
            <input
              type="checkbox"
              className="accent-marca-500"
              checked={seleccion.has(it.id)}
              onChange={() => toggle(it.id)}
            />
            <span className="min-w-0 flex-1 truncate font-medium text-slate-700">
              {it.item_nombre}
              <span className="text-slate-400">
                {' '}
                · {it.cantidad} × {soles(it.item_precio)}
              </span>
            </span>
            <span className="font-semibold text-slate-700">{soles(it.subtotal)}</span>
          </label>
        ))}
      </div>

      <div className="mb-4 flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
        <span className="text-slate-500">Subtotal seleccionado</span>
        <span className="font-semibold">{soles(subtotalSel)}</span>
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
              name="tipo-pago-parcial"
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
          disabled={!puedeConfirmar}
          onClick={() => puedeConfirmar && onConfirm([...seleccion], tipo)}
        >
          Confirmar
        </button>
      </div>
    </Modal>
  )
}
