import { useMemo, useState } from 'react'
import { MARCA } from '../../lib/marca'
import { useItems } from '../../hooks/useItems'
import type { Item } from '../../types'

// Carta pública (comensal, sin login). Lee los ítems de Supabase en vivo:
// lo que el ADMIN edita en "Gestionar menú" se refleja aquí (RLS permite leer
// los ítems activos sin autenticación; el canal Realtime empuja los cambios).

// Orden en que se muestran las secciones. Las categorías que no estén acá se
// agregan al final en orden alfabético (así una categoría nueva del admin
// aparece sola, sin tocar código).
const ORDEN_CATEGORIAS = [
  'Hamburguesas',
  'Pollo Broster',
  'Alitas',
  'Cócteles',
  'Cervezas',
  'Bebidas Sin Alcohol',
]

// Categorías que existen en el POS pero NO se muestran en la carta pública.
const CATEGORIAS_OCULTAS = new Set(['Cigarros'])

// Categorías del POS que se muestran juntas bajo un mismo título en la carta
// pública (la BD las mantiene separadas para el POS).
const CATEGORIA_DISPLAY: Record<string, string> = {
  Gaseosas: 'Bebidas Sin Alcohol',
  Aguas: 'Bebidas Sin Alcohol',
}

interface CartaCategoria {
  id: string
  titulo: string
  nota?: string
  items: Item[]
}

// Convierte un nombre de categoría en un id estable para el ancla (#cat-...).
function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Agrupa los ítems por categoría, aplica el orden preferido y oculta las
// categorías no públicas. Deriva una nota "Todos S/ X" cuando todos comparten
// el mismo precio.
function agruparCarta(items: Item[]): CartaCategoria[] {
  const porCat = new Map<string, Item[]>()
  for (const it of items) {
    if (CATEGORIAS_OCULTAS.has(it.categoria)) continue
    const cat = CATEGORIA_DISPLAY[it.categoria] ?? it.categoria
    const arr = porCat.get(cat) ?? []
    arr.push(it)
    porCat.set(cat, arr)
  }

  const nombres = [...porCat.keys()].sort((a, b) => {
    const ia = ORDEN_CATEGORIAS.indexOf(a)
    const ib = ORDEN_CATEGORIAS.indexOf(b)
    if (ia !== -1 && ib !== -1) return ia - ib
    if (ia !== -1) return -1
    if (ib !== -1) return 1
    return a.localeCompare(b, 'es')
  })

  return nombres.map((titulo) => {
    const propios = (porCat.get(titulo) ?? []).sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es'),
    )
    const precios = new Set(propios.map((i) => i.precio))
    const nota =
      propios.length > 1 && precios.size === 1
        ? `Todos S/ ${propios[0].precio.toFixed(2)}`
        : undefined
    return { id: slug(titulo), titulo, nota, items: propios }
  })
}

function Precio({ value }: { value: number }) {
  return (
    <span className="whitespace-nowrap font-semibold text-marca-400">
      <span className="mr-0.5 align-top text-[0.7em] text-marca-500">S/</span>
      {value.toFixed(2)}
    </span>
  )
}

function irACategoria(id: string) {
  const el = document.getElementById(`cat-${id}`)
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 132
    window.scrollTo({ top: y, behavior: 'smooth' })
  }
}

function CategoriaNav({ carta }: { carta: CartaCategoria[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-t border-arena-50/10">
      {/* Móvil: menú desplegable */}
      <div className="relative sm:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-3 text-sm font-medium text-marca-300"
        >
          <span>📋 Categorías</span>
          <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
        </button>
        {open && (
          <div id="carta-cat-mobile" className="border-t border-arena-50/10 bg-[#0c0c0e]">
            {carta.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setOpen(false)
                  irACategoria(cat.id)
                }}
                className="block w-full px-5 py-3 text-left text-sm text-arena-200 active:bg-marca-500/10"
              >
                {cat.titulo}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Escritorio: pestañas horizontales */}
      <div id="carta-cat-desktop" className="mx-auto hidden max-w-lg gap-2 overflow-x-auto px-5 py-3 sm:flex">
        {carta.map((cat) => (
          <button
            key={cat.id}
            onClick={() => irACategoria(cat.id)}
            className="whitespace-nowrap rounded-full border border-marca-500/30 px-4 py-1.5 text-sm text-marca-300 transition hover:bg-marca-500/10"
          >
            {cat.titulo}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function PublicCarta() {
  const { items, loading } = useItems()
  const carta = useMemo(() => agruparCarta(items), [items])

  return (
    <div className="min-h-full bg-[#08080a] text-arena-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#08080a]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-3">
          <a href="/" className="text-sm text-arena-300 hover:text-arena-100">
            ← Inicio
          </a>
          <a href="/" className="flex items-center gap-2">
            <img
              src={MARCA.logo}
              alt=""
              className="h-8 w-8 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
            <span className="brand text-lg text-arena-50">{MARCA.nombre}</span>
          </a>
          <a href="/club" className="text-sm text-marca-300 hover:text-marca-200">
            Club DF
          </a>
        </div>
        {carta.length > 0 && <CategoriaNav carta={carta} />}
      </header>

      <main className="mx-auto max-w-lg px-6 pb-24 pt-8">
        <h1 className="brand mb-8 text-center text-3xl text-arena-50">Carta</h1>

        {loading && (
          <p className="py-16 text-center text-sm text-arena-400">Cargando carta…</p>
        )}

        {!loading && carta.length === 0 && (
          <p className="py-16 text-center text-sm text-arena-400">
            La carta se está actualizando. Vuelve en un momento.
          </p>
        )}

        {carta.map((cat) => (
          <section key={cat.id} id={`cat-${cat.id}`} className="mb-10">
            <div className="mb-4 flex items-baseline justify-between border-b border-arena-50/10 pb-2">
              <h2 className="brand text-2xl text-marca-300">{cat.titulo}</h2>
              {cat.nota && <span className="text-xs text-arena-400">{cat.nota}</span>}
            </div>
            <ul className="divide-y divide-arena-50/5">
              {cat.items.map((item) => (
                <li key={item.id} className="flex items-baseline justify-between gap-3 py-3">
                  <span className="text-arena-100">{item.nombre}</span>
                  <span className="flex-1 border-b border-dotted border-arena-50/15" />
                  <Precio value={item.precio} />
                </li>
              ))}
            </ul>
          </section>
        ))}

        <footer className="mt-10 rounded-2xl border border-arena-50/10 bg-cacao-900/50 p-6 text-center">
          <p className="text-sm text-arena-300">
            Precios en soles (S/). Disponibilidad sujeta a stock.
          </p>
          <p className="mt-1 text-xs text-arena-500">
            Venta de bebidas alcohólicas solo para mayores de 18 años.
          </p>
        </footer>
      </main>
    </div>
  )
}
