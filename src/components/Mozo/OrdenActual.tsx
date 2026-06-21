import CollapsibleCard from '../Shared/CollapsibleCard'
import { soles, etiquetaMesa } from '../../lib/format'
import { saldoPendiente } from '../../types'
import type { Orden } from '../../types'

interface OrdenActualProps {
  orden: Orden | null
  mesaNumero: number
  onQuitar: (ordenItemId: string) => void
  onGuardar: () => void
  onFinalizar: () => void
  onCobroParcial: () => void
  onAnular: () => void
  // M-04: si la mesa es de otro mozo, se bloquean las acciones de caja.
  bloqueado?: boolean
  // Nombre del mozo dueño de la mesa, para la nota explicativa.
  mozoDueno?: string | null
}

export default function OrdenActual({
  orden,
  mesaNumero,
  onQuitar,
  onGuardar,
  onFinalizar,
  onCobroParcial,
  onAnular,
  bloqueado = false,
  mozoDueno,
}: OrdenActualProps) {
  const items = orden?.items ?? []
  const total = orden?.total ?? 0
  const pagado = orden?.pagado ?? 0
  const saldo = orden ? saldoPendiente(orden) : 0
  const hayCobros = pagado > 0 // hay al menos un cobro parcial registrado
  const haySinPagar = items.some((it) => !it.pagado)

  return (
    <CollapsibleCard
      titulo={`Orden actual · ${etiquetaMesa(mesaNumero)}${orden?.comensal ? ' · ' + orden.comensal : ''}`}
      derecha={
        <span className="text-xs font-medium text-slate-500">
          {items.length} ítem(s) · {soles(total)}
        </span>
      }
    >
      <div className="divide-y divide-slate-100">
        {items.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            Aún no hay ítems. Busca y agrega arriba.
          </p>
        )}
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between gap-2 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-800">
                {it.item_nombre}
              </p>
              <p className="text-xs text-slate-400">
                {it.cantidad} × {soles(it.item_precio)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">
                {soles(it.subtotal)}
              </span>
              {it.pagado ? (
                // Ítem ya cobrado en un parcial: badge verde, sin botón de quitar.
                <span className="text-xs font-semibold text-emerald-600">
                  ✓ Cobrado
                </span>
              ) : (
                <button
                  onClick={() => onQuitar(it.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Quitar"
                  aria-label={`Quitar ${it.item_nombre}`}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-slate-200 pt-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">Total</span>
          <span className="text-2xl font-extrabold text-slate-800">{soles(total)}</span>
        </div>

        {/* Si hay cobros parciales, mostramos lo pagado y el saldo restante. */}
        {hayCobros && (
          <div className="mb-3 space-y-1 rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Pagado</span>
              <span className="font-semibold text-emerald-600">{soles(pagado)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Saldo</span>
              <span className="font-semibold">{soles(saldo)}</span>
            </div>
          </div>
        )}

        {/* M-04: nota cuando la mesa pertenece a otro mozo. */}
        {bloqueado && (
          <p className="mb-3 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">
            Mesa de otro mozo ({mozoDueno}). Pide al admin.
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            className="btn-ghost"
            disabled={items.length === 0}
            onClick={onGuardar}
          >
            Guardar
          </button>
          <button
            className="btn-ghost"
            disabled={bloqueado || !haySinPagar}
            onClick={onCobroParcial}
          >
            Cobro parcial
          </button>
          <button
            className="btn-danger"
            disabled={bloqueado || items.length === 0}
            onClick={onFinalizar}
          >
            Finalizar
          </button>
          {items.length > 0 && (
            <button
              className="btn-danger"
              disabled={bloqueado}
              onClick={onAnular}
            >
              Anular mesa
            </button>
          )}
        </div>
      </div>
    </CollapsibleCard>
  )
}
