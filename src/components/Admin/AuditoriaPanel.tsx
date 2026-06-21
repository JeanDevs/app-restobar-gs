import { useCallback, useEffect, useState } from 'react'
import { db } from '../../services'
import { fecha, hora } from '../../lib/format'
import type { RegistroAuditoria } from '../../types'

// Panel de solo lectura con el log de auditoría (cierres de día y anulaciones).
export default function AuditoriaPanel() {
  const [registros, setRegistros] = useState<RegistroAuditoria[]>([])

  const reload = useCallback(async () => {
    setRegistros(await db.getAuditoria())
  }, [])

  useEffect(() => {
    reload()
    const unsub = db.subscribe(reload)
    return unsub
  }, [reload])

  return (
    <div className="card p-4">
      <p className="mb-3 font-semibold text-slate-700">Auditoría</p>

      {registros.length === 0 ? (
        <p className="py-8 text-center text-slate-400">Sin registros de auditoría todavía.</p>
      ) : (
        <div className="space-y-2">
          {registros.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-slate-50 px-3 py-2 text-sm"
            >
              {r.accion === 'CIERRE_DIA' ? (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  Cierre de día
                </span>
              ) : (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  Anulación
                </span>
              )}
              <span className="font-medium text-slate-700">{r.usuario}</span>
              <span className="min-w-0 flex-1 text-slate-500">{r.detalle}</span>
              <span className="text-xs text-slate-400">
                {fecha(r.creado_en) + ' ' + hora(r.creado_en)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
