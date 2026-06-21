import { useStore } from '../../store/useStore'
import { useAuth } from '../../hooks/useAuth'

interface HeaderProps {
  titulo: string
}

export default function Header({ titulo }: HeaderProps) {
  const sesion = useStore((s) => s.sesion)
  const { logout } = useAuth()

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl">🍻</span>
        <h1 className="text-lg font-bold tracking-tight text-slate-800">
          {titulo}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-slate-500 sm:inline">
          {sesion?.usuario} · <span className="font-medium">{sesion?.rol}</span>
        </span>
        <button className="btn-ghost" onClick={() => logout()}>
          Salir
        </button>
      </div>
    </header>
  )
}
