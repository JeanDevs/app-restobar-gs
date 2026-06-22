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
  const [clave, setClave] = useState('')

  // Cierra el modal y limpia el campo de clave para no dejarlo precargado.
  function cerrarModal() {
    setAbierto(false)
    setClave('')
  }

  async function confirmar() {
    setBusy(true)
    try {
      const r = await db.cerrarDia(clave)
      pushToast(`Día cerrado · ${soles(r.total)} · ${r.conteo} pedido(s)`, 'ok')
      cerrarModal()
    } catch (e) {
      // Clave incorrecta u otro error: avisamos pero dejamos el modal abierto para reintentar.
      pushToast(e instanceof Error ? e.message : 'No se pudo cerrar el día', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card flex flex-wrap items-center justify-between gap-2 p-4">
      <div>
        <p className="font-semibold text-cacao-700">Cierre de día</p>
        <p className="text-xs text-cacao-400">
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
          onClose={busy ? undefined : cerrarModal}
        >
          <div className="mb-4 space-y-1 rounded-lg bg-cacao-50 px-3 py-3 text-sm">
            <div className="flex justify-between">
              <span className="text-cacao-500">Fecha</span>
              <span className="font-semibold">{fecha(new Date().toISOString())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cacao-500">Pedidos</span>
              <span className="font-semibold">{conteo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cacao-500">Total</span>
              <span className="font-semibold">{soles(total)}</span>
            </div>
          </div>

          <p className="label">Por tipo de pago</p>
          <div className="mb-4 space-y-1 text-sm">
            {TIPOS_PAGO.map((t) => (
              <div key={t} className="flex justify-between">
                <span className="text-cacao-500">{t}</span>
                <span className="font-medium">{soles(porTipo[t])}</span>
              </div>
            ))}
          </div>

          <p className="mb-4 text-xs text-cacao-400">
            Al cerrar, estos pedidos dejan de contar en "hoy". El historial completo se conserva.
          </p>

          {/* Clave de administrador: requerida para confirmar el cierre. */}
          <div className="mb-4">
            <label className="label" htmlFor="clave-admin-cierre">
              Clave de administrador
            </label>
            <input
              id="clave-admin-cierre"
              className="input"
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              disabled={busy}
              autoComplete="off"
            />
            <p className="mt-1 text-xs text-cacao-400">
              Confirmar el cierre requiere la clave del administrador. Queda registrado en
              auditoría.
            </p>
          </div>

          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={cerrarModal} disabled={busy}>
              Cancelar
            </button>
            <button
              className="btn-danger flex-1"
              onClick={confirmar}
              disabled={busy || clave.trim() === ''}
            >
              {busy ? 'Cerrando…' : 'Confirmar cierre'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
