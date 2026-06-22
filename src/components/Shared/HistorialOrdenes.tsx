import { soles, hora, etiquetaMesa } from '../../lib/format'
import { colorPago } from '../../lib/badges'
import { exportarHistorialCSV } from '../../lib/export'
import { useStore } from '../../store/useStore'
import type { Orden } from '../../types'

interface HistorialOrdenesProps {
  ordenes: Orden[]
  titulo: string
  onSelect: (orden: Orden) => void
  conExport?: boolean
}

// Tabla de historial reutilizable (admin = todo, mozo = solo hoy).
// El detalle lo abre el componente padre vía onSelect.
export default function HistorialOrdenes({
  ordenes,
  titulo,
  onSelect,
  conExport = false,
}: HistorialOrdenesProps) {
  const pushToast = useStore((s) => s.pushToast)

  function exportar() {
    if (ordenes.length === 0) return
    exportarHistorialCSV(ordenes)
    pushToast('Historial exportado (CSV para Excel)', 'ok')
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-cacao-200 px-4 py-3">
        <h2 className="font-bold text-cacao-800">{titulo}</h2>
        {conExport && (
          <button
            className="btn-ghost"
            onClick={exportar}
            disabled={ordenes.length === 0}
            title="Descargar CSV para Excel"
          >
            ⬇️ Exportar a Excel
          </button>
        )}
      </div>

      <p className="px-4 pt-2 text-xs text-cacao-400">
        Toca una fila para ver el detalle del pedido.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cacao-200 bg-cacao-50 text-left text-xs uppercase tracking-wide text-cacao-500">
              <th className="px-4 py-2">Origen</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-right">Ítems</th>
              <th className="px-4 py-2">Pago</th>
              <th className="px-4 py-2">Mozo</th>
              <th className="px-4 py-2 text-right">Hora</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((o) => {
              const anulada = o.estado === 'ANULADA'
              return (
                <tr
                  key={o.id}
                  onClick={() => onSelect(o)}
                  className={`cursor-pointer border-b border-cacao-100 last:border-b-0 hover:bg-marca-50 ${
                    anulada ? 'opacity-60' : ''
                  }`}
                >
                  <td className="px-4 py-2 font-semibold text-cacao-800">
                    {etiquetaMesa(o.mesa_numero)}
                    {o.comensal && (
                      <span className="block text-xs font-normal text-cacao-400">
                        {o.comensal}
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-4 py-2 text-right font-semibold ${
                      anulada ? 'line-through text-cacao-400' : ''
                    }`}
                  >
                    {soles(o.total_final ?? o.total)}
                  </td>
                  <td className="px-4 py-2 text-right text-cacao-500">{o.cantidad}</td>
                  <td className="px-4 py-2">
                    {anulada ? (
                      <span className="badge bg-red-100 text-red-700">Anulada</span>
                    ) : (
                      o.tipo_pago && (
                        <span className={`badge ${colorPago(o.tipo_pago)}`}>
                          {o.tipo_pago}
                        </span>
                      )
                    )}
                  </td>
                  <td className="px-4 py-2 text-cacao-500">{o.mozo ?? '—'}</td>
                  <td className="px-4 py-2 text-right text-cacao-500">{hora(o.cerrado_en)}</td>
                </tr>
              )
            })}
            {ordenes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-cacao-400">
                  Aún no hay órdenes cerradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
