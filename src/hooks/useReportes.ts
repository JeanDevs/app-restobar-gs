import { useCallback, useEffect, useMemo, useState } from 'react'
import { db } from '../services'
import type { Orden, TipoPago } from '../types'

const esHoy = (iso: string | null) =>
  !!iso && new Date(iso).toDateString() === new Date().toDateString()

export function useReportes() {
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setOrdenes(await db.getOrdenesCerradas())
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
    const unsub = db.subscribe(reload)
    return unsub
  }, [reload])

  const stats = useMemo(() => {
    // Excluir ANULADA: solo cuentan ventas reales (CERRADA o PAGADA) de hoy.
    const deHoy = ordenes.filter(
      (o) =>
        esHoy(o.cerrado_en) &&
        !o.dia_cerrado &&
        (o.estado === 'CERRADA' || o.estado === 'PAGADA'),
    )
    const total = deHoy.reduce((s, o) => s + (o.total_final ?? 0), 0)
    const conteo = deHoy.length
    const promedio = conteo > 0 ? total / conteo : 0

    // Reparte por tipo de pago a nivel de cada cobro (parcial + cierre).
    const porTipo: Record<TipoPago, number> = { Yape: 0, PLIN: 0, Efectivo: 0, Tarjeta: 0 }
    for (const o of deHoy) {
      if (o.pagos && o.pagos.length > 0) {
        for (const pago of o.pagos) {
          porTipo[pago.tipo_pago] += pago.monto
        }
      } else if (o.tipo_pago) {
        // Defensa: orden sin pagos detallados → comportamiento previo.
        porTipo[o.tipo_pago] += o.total_final ?? 0
      }
    }

    return { deHoy, total, conteo, promedio, porTipo }
  }, [ordenes])

  return { ordenes, loading, reload, ...stats }
}
