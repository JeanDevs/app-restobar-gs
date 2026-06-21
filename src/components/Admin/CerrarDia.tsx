import { useState } from 'react'
import Modal from '../Shared/Modal'
import { useReportes } from '../../hooks/useReportes'
import { db } from '../../services'
import { useStore } from '../../store/useStore'
import { soles, fecha } from '../../lib/format'
import { TIPOS_PAGO } from '../../types'

// Cierre de día / corte de caja. Solo se renderiza dentro del panel admin.
export default function CerrarDia() {
  const { total, conteo, porTipo } = useReportes()
  const pushToast = useStore((s) => s.pushToast)
  const [abierto, setAbierto] = useState(false)
  const [busy, setBusy] = useState(false)

  async function confirmar() {
    setBusy(true)
    try {
      const r = await db.cerrarDia()
      pushToast(`Día cerrado · ${soles(r.total)} · ${r.conteo} pedido(s)`, 'ok')
      setAbierto(false)
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'No se pudo cerrar el día', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card flex flex-wrap items-center justify-between gap-2 p-4">
      <div>
        <p className="font-semibold text-slate-700">Cierre de día</p>
        <p className="text-xs text-slate-400">
          Corte de caja: consolida las ventas de hoy y reinicia el contador del día.
        </p>
      </div>
      <button
        className="btn-danger"
        onClick={() => setAbierto(true)}
        disabled={conteo === 0}
        title={conteo === 0 ? 'No hay ventas hoy' : 'Cerrar el día'}
      >
        🧾 Cerrar día
      </button>

      {abierto && (
        <Modal
          titulo="Cerrar día · corte de caja"
          onClose={busy ? undefined : () => setAbierto(false)}
        >
          <div className="mb-4 space-y-1 rounded-lg bg-slate-50 px-3 py-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Fecha</span>
              <span className="font-semibold">{fecha(new Date().toISOString())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pedidos</span>
              <span className="font-semibold">{conteo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total</span>
              <span className="font-semibold">{soles(total)}</span>
            </div>
          </div>

          <p className="label">Por tipo de pago</p>
          <div className="mb-4 space-y-1 text-sm">
            {TIPOS_PAGO.map((t) => (
              <div key={t} className="flex justify-between">
                <span className="text-slate-500">{t}</span>
                <span className="font-medium">{soles(porTipo[t])}</span>
              </div>
            ))}
          </div>

          <p className="mb-4 text-xs text-slate-400">
            Al cerrar, estos pedidos dejan de contar en "hoy". El historial completo se conserva.
          </p>

          <div className="flex gap-2">
            <button
              className="btn-ghost flex-1"
              onClick={() => setAbierto(false)}
              disabled={busy}
            >
              Cancelar
            </button>
            <button className="btn-danger flex-1" onClick={confirmar} disabled={busy}>
              {busy ? 'Cerrando…' : 'Confirmar cierre'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
