import { soles, hora, etiquetaMesa } from '../../lib/format'
import { exportarHistorialCSV } from '../../lib/export'
import { useStore } from '../../store/useStore'
import type { Orden } from '../../types'

const badge: Record<string, string> = {
  Yape: 'bg-purple-100 text-purple-700',
  PLIN: 'bg-blue-100 text-blue-700',
  Efectivo: 'bg-emerald-100 text-emerald-700',
  Tarjeta: 'bg-amber-100 text-amber-700',
}

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
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
        <h2 className="font-bold text-slate-800">{titulo}</h2>
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

      <p className="px-4 pt-2 text-xs text-slate-400">
        Toca una fila para ver el detalle del pedido.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2">Origen</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-right">Ítems</th>
              <th className="px-4 py-2">Pago</th>
              <th className="px-4 py-2">Mozo</th>
              <th className="px-4 py-2 text-right">Hora</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((o) => (
              <tr
                key={o.id}
                onClick={() => onSelect(o)}
                className="cursor-pointer border-b border-slate-100 last:border-b-0 hover:bg-marca-50"
              >
                <td className="px-4 py-2 font-semibold text-slate-800">
                  {etiquetaMesa(o.mesa_numero)}
                  {o.comensal && (
                    <span className="block text-xs font-normal text-slate-400">
                      {o.comensal}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-right font-semibold">
                  {soles(o.total_final ?? o.total)}
                </td>
                <td className="px-4 py-2 text-right text-slate-500">{o.cantidad}</td>
                <td className="px-4 py-2">
                  {o.tipo_pago && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        badge[o.tipo_pago] ?? 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {o.tipo_pago}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-slate-500">{o.mozo ?? '—'}</td>
                <td className="px-4 py-2 text-right text-slate-500">{hora(o.cerrado_en)}</td>
              </tr>
            ))}
            {ordenes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
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
