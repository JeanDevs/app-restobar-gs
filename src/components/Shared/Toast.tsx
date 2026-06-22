import { useEffect } from 'react'
import { useStore } from '../../store/useStore'
import type { Toast } from '../../store/useStore'

const estilos: Record<Toast['tipo'], string> = {
  ok: 'bg-emerald-600',
  error: 'bg-red-600',
  info: 'bg-cacao-800',
}

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useStore((s) => s.removeToast)

  useEffect(() => {
    const t = setTimeout(() => removeToast(toast.id), 2800)
    return () => clearTimeout(t)
  }, [toast.id, removeToast])

  return (
    <div
      className={`pointer-events-auto flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg ${estilos[toast.tipo]}`}
      role="status"
    >
      {toast.mensaje}
    </div>
  )
}

export function ToastContainer() {
  const toasts = useStore((s) => s.toasts)
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}
