import { useReportes } from '../../hooks/useReportes'
import { soles } from '../../lib/format'
import { TIPOS_PAGO } from '../../types'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-800">{value}</p>
    </div>
  )
}

export default function EstadisticasPanel() {
  const { total, conteo, promedio, porTipo } = useReportes()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Ingresos hoy" value={soles(total)} />
        <Stat label="Órdenes hoy" value={String(conteo)} />
        <Stat label="Promedio" value={soles(promedio)} />
      </div>

      <div className="card p-4">
        <p className="mb-3 text-sm font-semibold text-slate-600">Por tipo de pago (hoy)</p>
        <div className="space-y-2">
          {TIPOS_PAGO.map((t) => {
            const monto = porTipo[t]
            const pct = total > 0 ? Math.round((monto / total) * 100) : 0
            return (
              <div key={t}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-slate-600">{t}</span>
                  <span className="font-medium text-slate-700">
                    {soles(monto)} · {pct}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-marca-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
