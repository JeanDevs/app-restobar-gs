import { useEffect, useState } from 'react'
import { db } from '../../services'
import { useStore } from '../../store/useStore'
import type { ClienteClubDetalle } from '../../types'

// Sección "Clientes Club DF" del POS (spec club-identidad-pin · C5).
// Visible para admin y mozo. Solo lectura + reset de clave. Nunca edita puntos.
export default function ClientesClubPanel() {
  const pushToast = useStore((s) => s.pushToast)
  const [busqueda, setBusqueda] = useState('')
  const [clientes, setClientes] = useState<ClienteClubDetalle[]>([])
  const [cargando, setCargando] = useState(true)
  const [reseteando, setReseteando] = useState<string | null>(null)

  const soportado = typeof db.listarClientesClub === 'function'

  async function cargar(q: string) {
    if (!db.listarClientesClub) return
    setCargando(true)
    try {
      setClientes(await db.listarClientesClub(q))
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'No se pudieron cargar los clientes', 'error')
    } finally {
      setCargando(false)
    }
  }

  // Búsqueda con debounce (server-side).
  useEffect(() => {
    if (!soportado) {
      setCargando(false)
      return
    }
    const t = setTimeout(() => cargar(busqueda.trim()), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda])

  async function resetearClave(c: ClienteClubDetalle) {
    if (!db.resetearClaveCliente) return
    if (!window.confirm(`¿Resetear la clave de ${c.nombre}? Deberá crear una nueva la próxima vez que ingrese.`)) return
    setReseteando(c.id)
    try {
      await db.resetearClaveCliente(c.id)
      pushToast(`Clave de ${c.nombre} reseteada`, 'ok')
      setClientes((prev) => prev.map((x) => (x.id === c.id ? { ...x, tiene_clave: false } : x)))
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'No se pudo resetear la clave', 'error')
    } finally {
      setReseteando(null)
    }
  }

  if (!soportado) {
    return <div className="card p-4 text-sm text-cacao-600">La sección de clientes requiere la base de datos en la nube.</div>
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-cacao-700">⭐ Clientes Club DF</h2>
          <span className="text-xs text-cacao-400">{clientes.length} cliente(s)</span>
        </div>
        <input
          className="w-full rounded-lg border border-cacao-200 px-3 py-2 text-sm text-cacao-800 outline-none focus:border-marca-400"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o WhatsApp…"
          inputMode="search"
        />
      </div>

      {cargando ? (
        <div className="card p-4 text-sm text-cacao-500">Cargando…</div>
      ) : clientes.length === 0 ? (
        <div className="card p-4 text-sm text-cacao-500">
          {busqueda ? 'Sin resultados para tu búsqueda.' : 'Aún no hay clientes registrados.'}
        </div>
      ) : (
        <ul className="space-y-2">
          {clientes.map((c) => (
            <li key={c.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold text-cacao-800">
                  {c.nombre}
                  {!c.tiene_clave && (
                    <span className="ml-2 rounded-full bg-cacao-100 px-2 py-0.5 text-[10px] font-medium text-cacao-500">
                      sin clave
                    </span>
                  )}
                </p>
                <p className="text-xs text-cacao-500">
                  📱 {c.whatsapp} · ganados {c.puntos_historicos} · usados {c.puntos_usados}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-lg font-extrabold text-marca-600">{c.puntos}</p>
                  <p className="text-[10px] uppercase tracking-wide text-cacao-400">puntos</p>
                </div>
                {c.tiene_clave && (
                  <button
                    onClick={() => resetearClave(c)}
                    disabled={reseteando === c.id}
                    className="rounded-lg border border-cacao-200 px-2.5 py-1.5 text-xs font-medium text-cacao-600 hover:bg-cacao-100 disabled:opacity-50"
                    title="Resetear la clave de 4 dígitos del cliente"
                  >
                    {reseteando === c.id ? '…' : 'Resetear clave'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
