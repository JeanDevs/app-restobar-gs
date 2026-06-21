import CollapsibleCard from '../Shared/CollapsibleCard'
import { soles, etiquetaMesa } from '../../lib/format'
import type { Orden } from '../../types'

interface OrdenActualProps {
  orden: Orden | null
  mesaNumero: number
  onQuitar: (ordenItemId: string) => void
  onGuardar: () => void
  onFinalizar: () => void
}

export default function OrdenActual({
  orden,
  mesaNumero,
  onQuitar,
  onGuardar,
  onFinalizar,
}: OrdenActualProps) {
  const items = orden?.items ?? []
  const total = orden?.total ?? 0

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
              <button
                onClick={() => onQuitar(it.id)}
                className="text-red-500 hover:text-red-700"
                title="Quitar"
                aria-label={`Quitar ${it.item_nombre}`}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-slate-200 pt-3">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">Total</span>
          <span className="text-2xl font-extrabold text-slate-800">{soles(total)}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="btn-ghost"
            disabled={items.length === 0}
            onClick={onGuardar}
          >
            Guardar
          </button>
          <button
            className="btn-danger"
            disabled={items.length === 0}
            onClick={onFinalizar}
          >
            Finalizar
          </button>
        </div>
      </div>
    </CollapsibleCard>
  )
}
