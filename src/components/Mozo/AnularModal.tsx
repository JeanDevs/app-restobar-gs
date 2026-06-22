import { useState } from 'react'
import Modal from '../Shared/Modal'
import { soles, etiquetaMesa } from '../../lib/format'
import type { Orden } from '../../types'

interface AnularModalProps {
  orden: Orden
  onConfirm: (motivo: string, claveAdmin: string) => void
  onCancel: () => void
  busy: boolean
}

// Anular mesa (D-F): requiere motivo y clave de administrador; queda en auditoría.
export default function AnularModal({
  orden,
  onConfirm,
  onCancel,
  busy,
}: AnularModalProps) {
  const [motivo, setMotivo] = useState('')
  const [clave, setClave] = useState('')

  const puedeConfirmar = motivo.trim().length > 0 && clave.length > 0

  return (
    <Modal titulo="¿Anular mesa?" onClose={busy ? undefined : onCancel}>
      <div className="mb-4 space-y-1 rounded-lg bg-cacao-50 px-3 py-2 text-sm">
        <div className="flex justify-between">
          <span className="text-cacao-500">Origen</span>
          <span className="font-semibold">{etiquetaMesa(orden.mesa_numero)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-cacao-500">Total</span>
          <span className="font-semibold">{soles(orden.total)}</span>
        </div>
      </div>

      <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
        Anular requiere autorización del administrador. Queda registrado en auditoría.
      </p>

      <label className="label" htmlFor="motivo-anular">
        Motivo
      </label>
      <textarea
        id="motivo-anular"
        className="input mb-4"
        rows={2}
        placeholder="Motivo de la anulación…"
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        disabled={busy}
      />

      <label className="label" htmlFor="clave-anular">
        Clave de administrador
      </label>
      <input
        id="clave-anular"
        type="password"
        className="input mb-5"
        placeholder="••••••"
        value={clave}
        onChange={(e) => setClave(e.target.value)}
        disabled={busy}
      />

      <div className="flex gap-2">
        <button className="btn-ghost flex-1" onClick={onCancel} disabled={busy}>
          Cancelar
        </button>
        <button
          className="btn-danger flex-1"
          disabled={!puedeConfirmar || busy}
          onClick={() => puedeConfirmar && onConfirm(motivo.trim(), clave)}
        >
          {busy ? 'Anulando…' : 'Anular mesa'}
        </button>
      </div>
    </Modal>
  )
}
