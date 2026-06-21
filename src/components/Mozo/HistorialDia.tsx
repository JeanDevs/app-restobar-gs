import { useState } from 'react'
import HistorialOrdenes from '../Shared/HistorialOrdenes'
import DetalleOrdenModal from '../Shared/DetalleOrdenModal'
import LoadingSpinner from '../Shared/LoadingSpinner'
import { useReportes } from '../../hooks/useReportes'
import { soles } from '../../lib/format'
import type { Orden } from '../../types'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-slate-800">{value}</p>
    </div>
  )
}

// Historial del día para el mozo: ventas de hoy + detalle por pedido.
export default function HistorialDia() {
  const { deHoy, total, conteo, loading } = useReportes()
  const [detalle, setDetalle] = useState<Orden | null>(null)

  if (loading) return <LoadingSpinner texto="Cargando ventas de hoy…" />

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Ventas de hoy" value={soles(total)} />
        <Stat label="Pedidos" value={String(conteo)} />
      </div>

      {/* El mozo NO puede exportar (M-05); el export es solo del admin. */}
      <HistorialOrdenes
        ordenes={deHoy}
        titulo="Ventas de hoy"
        onSelect={setDetalle}
      />

      {detalle && <DetalleOrdenModal orden={detalle} onClose={() => setDetalle(null)} />}
    </div>
  )
}
