import { useEffect, useState } from 'react'
import type { Item } from '../types'

// Una línea del "carrito" de selección múltiple antes de mandarla a la orden.
export interface Linea {
  item: Item
  cantidad: number
}

// Estado del "carrito" (borrador) de toma de pedidos: apila ítems, ajusta
// cantidades y los resume. Se resetea automáticamente cuando cambia `resetKey`
// (p.ej. la mesa activa). Extraído de PanelPedidos para aislar la lógica de UI.
export function useBorrador(resetKey: unknown) {
  const [borrador, setBorrador] = useState<Linea[]>([])

  // Al cambiar la clave (mesa), descartamos el borrador no confirmado.
  useEffect(() => {
    setBorrador([])
  }, [resetKey])

  function addBorrador(item: Item) {
    setBorrador((prev) => {
      const i = prev.findIndex((b) => b.item.id === item.id)
      if (i >= 0) {
        const copia = [...prev]
        copia[i] = { ...copia[i], cantidad: copia[i].cantidad + 1 }
        return copia
      }
      return [...prev, { item, cantidad: 1 }]
    })
  }

  function setBorradorCantidad(itemId: string, cantidad: number) {
    setBorrador((prev) =>
      prev.map((b) => (b.item.id === itemId ? { ...b, cantidad } : b)),
    )
  }

  function removeBorrador(itemId: string) {
    setBorrador((prev) => prev.filter((b) => b.item.id !== itemId))
  }

  function reset() {
    setBorrador([])
  }

  const unidades = borrador.reduce((s, b) => s + b.cantidad, 0)
  const total = borrador.reduce((s, b) => s + b.item.precio * b.cantidad, 0)
  const enLista = Object.fromEntries(borrador.map((b) => [b.item.id, b.cantidad]))

  return {
    borrador,
    addBorrador,
    setBorradorCantidad,
    removeBorrador,
    reset,
    unidades,
    total,
    enLista,
  }
}
