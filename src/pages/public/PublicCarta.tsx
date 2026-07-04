// Carta pública (comensal) — estática esta noche. Fase 2: leer de Supabase (items) en vivo.
interface CartaItem {
  nombre: string
  precio: number
}
interface CartaCategoria {
  titulo: string
  nota?: string
  items: CartaItem[]
}

const CARTA: CartaCategoria[] = [
  {
    titulo: 'Cócteles',
    nota: 'Todos S/ 15.00',
    items: [
      { nombre: 'Mojito', precio: 15 },
      { nombre: 'Piña Colada', precio: 15 },
      { nombre: 'Pisco Sour', precio: 15 },
      { nombre: 'Laguna Azul', precio: 15 },
      { nombre: 'Machupichu', precio: 15 },
      { nombre: 'Cuba Libre', precio: 15 },
      { nombre: 'Pantera', precio: 15 },
      { nombre: 'Algarrobina', precio: 15 },
      { nombre: 'Durazno', precio: 15 },
      { nombre: 'Mango', precio: 15 },
    ],
  },
  {
    titulo: 'Cervezas',
    nota: 'Promos por cantidad',
    items: [
      { nombre: 'Cerveza (1 und)', precio: 15 },
      { nombre: 'Cerveza (3 und)', precio: 40 },
      { nombre: 'Cerveza (5 und)', precio: 65 },
      { nombre: 'Cerveza día familiar', precio: 9 },
      { nombre: 'Cerveza 3 Cruces (1 und)', precio: 8 },
      { nombre: 'Cerveza 3 Cruces (2 und)', precio: 15 },
    ],
  },
  {
    titulo: 'Gaseosas',
    items: [
      { nombre: 'Coca Cola (500 mL)', precio: 5 },
      { nombre: 'Coca Cola (1.5 L)', precio: 14 },
      { nombre: 'Inka Cola (500 mL)', precio: 5 },
      { nombre: 'Inka Cola (1.5 L)', precio: 14 },
      { nombre: 'Gaseosa familiar 1½ L', precio: 10 },
    ],
  },
  {
    titulo: 'Aguas',
    items: [
      { nombre: 'Agua Cielo (625 mL)', precio: 3 },
      { nombre: 'San Luis (625 mL)', precio: 3.5 },
      { nombre: 'San Mateo (625 mL)', precio: 3.5 },
    ],
  },
  {
    titulo: 'Cigarros',
    items: [
      { nombre: 'Cigarro Lucky (1 und)', precio: 2.5 },
      { nombre: 'Cigarro Lucky (1 caja)', precio: 32 },
    ],
  },
]

function Precio({ value }: { value: number }) {
  return (
    <span className="whitespace-nowrap font-semibold text-marca-400">
      <span className="mr-0.5 align-top text-[0.7em] text-marca-500">S/</span>
      {value.toFixed(2)}
    </span>
  )
}

export default function PublicCarta() {
  return (
    <div className="min-h-full bg-[#08080a] text-arena-100">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-arena-50/10 bg-[#08080a]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-5 py-4">
          <a href="/" className="text-sm text-arena-300 hover:text-arena-100">
            ← Inicio
          </a>
          <span className="brand text-lg text-arena-50">Destino Final</span>
          <a href="/club" className="text-sm text-marca-300 hover:text-marca-200">
            Club DF
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-6 pb-24 pt-8">
        <h1 className="brand mb-8 text-center text-3xl text-arena-50">Carta</h1>

        {CARTA.map((cat) => (
          <section key={cat.titulo} className="mb-10">
            <div className="mb-4 flex items-baseline justify-between border-b border-arena-50/10 pb-2">
              <h2 className="brand text-2xl text-marca-300">{cat.titulo}</h2>
              {cat.nota && <span className="text-xs text-arena-400">{cat.nota}</span>}
            </div>
            <ul className="divide-y divide-arena-50/5">
              {cat.items.map((item) => (
                <li key={item.nombre} className="flex items-baseline justify-between gap-3 py-3">
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
