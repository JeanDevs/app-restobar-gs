import { useState } from 'react'
import { useReportes } from '../../hooks/useReportes'
import LoadingSpinner from '../Shared/LoadingSpinner'
import HistorialOrdenes from '../Shared/HistorialOrdenes'
import DetalleOrdenModal from '../Shared/DetalleOrdenModal'
import type { Orden } from '../../types'

export default function OrdenesTable() {
  const { ordenes, loading } = useReportes()
  const [detalle, setDetalle] = useState<Orden | null>(null)

  if (loading) return <LoadingSpinner texto="Cargando órdenes…" />

  return (
    <>
      <HistorialOrdenes
        ordenes={ordenes}
        titulo="Historial de órdenes"
        conExport
        onSelect={setDetalle}
      />
      {detalle && <DetalleOrdenModal orden={detalle} onClose={() => setDetalle(null)} />}
    </>
  )
}
