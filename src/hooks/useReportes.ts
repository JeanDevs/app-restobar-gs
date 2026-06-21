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
    const deHoy = ordenes.filter((o) => esHoy(o.cerrado_en) && !o.dia_cerrado)
    const total = deHoy.reduce((s, o) => s + (o.total_final ?? 0), 0)
    const conteo = deHoy.length
    const promedio = conteo > 0 ? total / conteo : 0

    const porTipo: Record<TipoPago, number> = { Yape: 0, PLIN: 0, Efectivo: 0, Tarjeta: 0 }
    for (const o of deHoy) {
      if (o.tipo_pago) porTipo[o.tipo_pago] += o.total_final ?? 0
    }

    return { deHoy, total, conteo, promedio, porTipo }
  }, [ordenes])

  return { ordenes, loading, reload, ...stats }
}
