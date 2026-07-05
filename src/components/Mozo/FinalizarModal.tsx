import { useEffect, useState } from 'react'
import Modal from '../Shared/Modal'
import { db } from '../../services'
import { soles, etiquetaMesa } from '../../lib/format'
import { TIPOS_PAGO, saldoPendiente } from '../../types'
import type { ClienteClub, Orden, Premio, TipoPago } from '../../types'

// Selección del Club DF hecha en este modal; PanelPedidos la ejecuta tras cerrar la orden.
export interface ClubSeleccion {
  cliente: ClienteClub
  premioId: string | null
}

interface FinalizarModalProps {
  orden: Orden
  onConfirmTipo: (tipo: TipoPago, club: ClubSeleccion | null) => void
  onCancel: () => void
}

export default function FinalizarModal({
  orden,
  onConfirmTipo,
  onCancel,
}: FinalizarModalProps) {
  const [tipo, setTipo] = useState<TipoPago | null>(null)

  // ── Club DF (opcional; solo si la capa de datos lo soporta — no en mock) ──
  const clubDisponible = typeof db.buscarClienteClub === 'function'
  const [wsp, setWsp] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [cliente, setCliente] = useState<ClienteClub | null>(null)
  const [noRegistrado, setNoRegistrado] = useState(false)
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [clubError, setClubError] = useState<string | null>(null)
  const [premios, setPremios] = useState<Premio[]>([])
  const [premioId, setPremioId] = useState<string | null>(null)

  useEffect(() => {
    // Catálogo de premios (P2). Si está vacío, el selector no se muestra.
    db.getPremios?.().then(setPremios).catch(() => setPremios([]))
  }, [])

  const wspLimpio = wsp.replace(/\D/g, '')

  async function buscar() {
    if (!db.buscarClienteClub || wspLimpio.length < 9) return
    setBuscando(true)
    setClubError(null)
    try {
      const c = await db.buscarClienteClub(wspLimpio)
      setCliente(c)
      setNoRegistrado(!c)
    } catch {
      setClubError('No se pudo consultar el club. Reintenta.')
    } finally {
      setBuscando(false)
    }
  }

  async function registrarRapido() {
    if (!db.registrarClienteRapido || nombreNuevo.trim().length < 2) return
    setBuscando(true)
    setClubError(null)
    try {
      const c = await db.registrarClienteRapido(nombreNuevo, wspLimpio)
      setCliente(c)
      setNoRegistrado(false)
    } catch {
      setClubError('No se pudo registrar. Reintenta.')
    } finally {
      setBuscando(false)
    }
  }

  function resetClub() {
    setCliente(null)
    setNoRegistrado(false)
    setNombreNuevo('')
    setPremioId(null)
    setClubError(null)
  }

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

      {/* ── Club DF: vincular cliente (opcional) ── */}
      {clubDisponible && (
        <div className="mb-4 rounded-lg border border-marca-200 bg-marca-50/50 px-3 py-2">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-marca-600">
            ⭐ Club DF (opcional)
          </p>

          {!cliente ? (
            <>
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="WhatsApp del cliente…"
                  inputMode="numeric"
                  value={wsp}
                  onChange={(e) => {
                    setWsp(e.target.value)
                    setNoRegistrado(false)
                    setClubError(null)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && buscar()}
                />
                <button
                  className="btn-ghost shrink-0 px-3"
                  disabled={wspLimpio.length < 9 || buscando}
                  onClick={buscar}
                >
                  {buscando ? '…' : 'Buscar'}
                </button>
              </div>

              {noRegistrado && (
                <div className="mt-2 rounded-md bg-white/70 p-2">
                  <p className="mb-1 text-xs text-cacao-500">
                    No registrado. Registro rápido (recibe 50 pts de bienvenida):
                  </p>
                  <div className="flex gap-2">
                    <input
                      className="input flex-1"
                      placeholder="Nombre del cliente…"
                      value={nombreNuevo}
                      onChange={(e) => setNombreNuevo(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && registrarRapido()}
                    />
                    <button
                      className="btn-primary shrink-0 px-3 text-sm"
                      disabled={nombreNuevo.trim().length < 2 || buscando}
                      onClick={registrarRapido}
                    >
                      Registrar
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-cacao-700">✓ {cliente.nombre}</span>
                <span className="text-marca-600">⭐ {cliente.puntos} pts</span>
              </div>
              <button className="mt-1 text-xs text-cacao-400 underline" onClick={resetClub}>
                Quitar / cambiar cliente
              </button>

              {/* Canje de premio (P2): solo con saldo suficiente */}
              {premios.length > 0 && (
                <div className="mt-2">
                  <label className="label text-xs" htmlFor="premio-club">
                    Canjear premio (opcional)
                  </label>
                  <select
                    id="premio-club"
                    className="input"
                    value={premioId ?? ''}
                    onChange={(e) => setPremioId(e.target.value || null)}
                  >
                    <option value="">Sin canje</option>
                    {premios.map((p) => (
                      <option key={p.id} value={p.id} disabled={p.costo_puntos > cliente.puntos}>
                        🎁 {p.nombre} — {p.costo_puntos} pts
                        {p.costo_puntos > cliente.puntos ? ' (faltan puntos)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          {clubError && <p className="mt-1 text-xs text-terra-600">{clubError}</p>}
        </div>
      )}

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
          onClick={() =>
            tipo && onConfirmTipo(tipo, cliente ? { cliente, premioId } : null)
          }
        >
          Confirmar
        </button>
      </div>
    </Modal>
  )
}
