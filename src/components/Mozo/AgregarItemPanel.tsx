import CollapsibleCard from '../Shared/CollapsibleCard'
import ItemSearcher from './ItemSearcher'
import CantidadInput from './CantidadInput'
import { soles } from '../../lib/format'
import type { Item } from '../../types'
import type { Linea } from '../../hooks/useBorrador'

interface AgregarItemPanelProps {
  borrador: Linea[]
  unidades: number
  total: number
  enLista: Record<string, number>
  onAddItem: (item: Item) => void
  onSetCantidad: (itemId: string, cantidad: number) => void
  onRemove: (itemId: string) => void
  onCommit: () => void
}

// Módulo "Agregar ítem" (colapsable): botón de commit ARRIBA (M-09), luego el
// carrito "Por agregar" y el buscador de catálogo. Solo presentación; el estado
// del borrador vive en useBorrador y el commit lo maneja el contenedor.
export default function AgregarItemPanel({
  borrador,
  unidades,
  total,
  enLista,
  onAddItem,
  onSetCantidad,
  onRemove,
  onCommit,
}: AgregarItemPanelProps) {
  return (
    <CollapsibleCard
      titulo="Agregar ítem"
      derecha={
        unidades > 0 ? (
          <span className="text-xs font-semibold text-marca-600">
            {unidades} por agregar
          </span>
        ) : undefined
      }
    >
      <div className="space-y-4">
        {/* Botón Agregar en la parte superior (M-09) */}
        <button
          className="btn-success w-full"
          disabled={borrador.length === 0}
          onClick={onCommit}
        >
          {borrador.length === 0
            ? 'Agregar'
            : `Agregar ${unidades} ítem(s) · ${soles(total)}`}
        </button>

        {borrador.length > 0 && (
          <div className="rounded-lg border border-marca-200 bg-marca-50/50 p-3">
            <p className="mb-2 text-sm font-semibold text-cacao-600">
              Por agregar ({borrador.length})
            </p>
            <div className="divide-y divide-marca-100">
              {borrador.map((b) => (
                <div key={b.item.id} className="flex items-center gap-2 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-cacao-800">
                      {b.item.nombre}
                    </p>
                    <p className="text-xs text-cacao-400">{soles(b.item.precio)} c/u</p>
                  </div>
                  <CantidadInput
                    value={b.cantidad}
                    onChange={(n) => onSetCantidad(b.item.id, n)}
                  />
                  <span className="w-16 text-right text-sm font-semibold text-cacao-700">
                    {soles(b.item.precio * b.cantidad)}
                  </span>
                  <button
                    onClick={() => onRemove(b.item.id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label={`Quitar ${b.item.nombre}`}
                    title="Quitar"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <ItemSearcher onAdd={onAddItem} enLista={enLista} />
      </div>
    </CollapsibleCard>
  )
}
