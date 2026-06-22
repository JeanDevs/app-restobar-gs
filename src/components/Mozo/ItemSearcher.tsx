import { useMemo, useState } from 'react'
import { useItems } from '../../hooks/useItems'
import { soles } from '../../lib/format'
import type { Item } from '../../types'

interface ItemSearcherProps {
  onAdd: (item: Item) => void
  // itemId -> cantidad ya puesta en el carrito (para mostrar badge)
  enLista?: Record<string, number>
}

export default function ItemSearcher({ onAdd, enLista = {} }: ItemSearcherProps) {
  const { items } = useItems()
  const [query, setQuery] = useState('')

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (i) =>
        i.nombre.toLowerCase().includes(q) ||
        i.categoria.toLowerCase().includes(q),
    )
  }, [items, query])

  return (
    <div>
      <label className="label">Buscar ítem (toca para sumarlo)</label>
      <input
        className="input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="cerveza, mojito, agua…"
      />

      <div className="mt-2 max-h-[45vh] overflow-y-auto rounded-lg border border-cacao-200 sm:max-h-72">
        {filtrados.length === 0 && (
          <p className="px-3 py-4 text-center text-sm text-cacao-400">Sin resultados</p>
        )}
        {filtrados.map((item) => {
          const cant = enLista[item.id] ?? 0
          return (
            <button
              key={item.id}
              onClick={() => onAdd(item)}
              className={[
                'flex min-h-[44px] w-full items-center justify-between gap-2 border-b border-cacao-100 px-3 py-2.5 text-left text-sm last:border-b-0',
                cant > 0 ? 'bg-marca-50' : 'active:bg-marca-50 hover:bg-cacao-50',
              ].join(' ')}
            >
              <span className="min-w-0">
                <span className="font-medium text-cacao-800">{item.nombre}</span>
                <span className="ml-2 text-xs text-cacao-400">{item.categoria}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                {cant > 0 && (
                  <span className="badge bg-marca-500 font-bold text-cacao-900">
                    ×{cant}
                  </span>
                )}
                <span className="font-semibold text-cacao-600">{soles(item.precio)}</span>
                <span className="text-lg font-bold leading-none text-marca-600">＋</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
