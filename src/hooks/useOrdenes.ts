import { useCallback, useEffect, useState } from 'react'
import { db } from '../services'
import type { LineaPedido } from '../services/dataClient'
import type { Orden, TipoPago } from '../types'

// Maneja la orden ABIERTA de una mesa, con refresco por realtime (decisión D-C).
export function useOrdenes(mesaNumero: number | null) {
  const [orden, setOrden] = useState<Orden | null>(null)
  const [loading, setLoading] = useState(false)

  const reload = useCallback(async () => {
    if (mesaNumero == null) {
      setOrden(null)
      return
    }
    setLoading(true)
    setOrden(await db.getOrdenAbierta(mesaNumero))
    setLoading(false)
  }, [mesaNumero])

  useEffect(() => {
    reload()
    const unsub = db.subscribe(reload)
    return unsub
  }, [reload])

  return {
    orden,
    loading,
    reload,
    agregarItem: (itemId: string, cantidad: number) => {
      if (mesaNumero == null) throw new Error('No hay mesa seleccionada')
      return db.agregarItem(mesaNumero, itemId, cantidad)
    },
    agregarItems: (lineas: LineaPedido[]) => {
      if (mesaNumero == null) throw new Error('No hay mesa seleccionada')
      return db.agregarItems(mesaNumero, lineas)
    },
    quitarItem: (ordenItemId: string) => db.quitarItem(ordenItemId),
    setComensal: (nombre: string) => {
      if (mesaNumero == null) throw new Error('No hay mesa seleccionada')
      return db.setComensal(mesaNumero, nombre)
    },
    finalizarOrden: (ordenId: string, tipoPago: TipoPago) =>
      db.finalizarOrden(ordenId, tipoPago),
  }
}
