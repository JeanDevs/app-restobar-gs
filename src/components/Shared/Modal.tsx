import type { ReactNode } from 'react'

interface ModalProps {
  titulo: string
  children: ReactNode
  onClose?: () => void
}

// Modal reutilizable (overlay + tarjeta centrada). Evita duplicar el chrome del
// diálogo en cada modal del flujo (regla del Harness: ↑reutilización).
export default function Modal({ titulo, children, onClose }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="card max-h-[90vh] w-full max-w-sm overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="mb-4 text-lg font-bold text-slate-800">{titulo}</h2>
        {children}
      </div>
    </div>
  )
}
