import { useCallback, useEffect, useState } from 'react'
import { db } from '../services'
import type { Mesa } from '../types'

export function useMesas() {
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setMesas(await db.getMesas())
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
    const unsub = db.subscribe(reload)
    return unsub
  }, [reload])

  return { mesas, loading, reload }
}
