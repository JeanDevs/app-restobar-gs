import { useCallback, useEffect, useState } from 'react'
import { db } from '../services'
import type { Item } from '../types'
import type { NuevoItem } from '../services/dataClient'

export function useItems() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const data = await db.getItems()
    setItems(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
    const unsub = db.subscribe(reload)
    return unsub
  }, [reload])

  return {
    items,
    loading,
    reload,
    createItem: (data: NuevoItem) => db.createItem(data),
    updateItem: (id: string, data: Partial<NuevoItem>) => db.updateItem(id, data),
    deleteItem: (id: string) => db.deleteItem(id),
  }
}
