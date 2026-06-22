import { useStore } from '../../store/useStore'
import { useAuth } from '../../hooks/useAuth'

interface HeaderProps {
  titulo: string
}

export default function Header({ titulo }: HeaderProps) {
  const sesion = useStore((s) => s.sesion)
  const { logout } = useAuth()

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-arena-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cacao-800 text-lg">
          🍻
        </span>
        <h1 className="brand text-lg">{titulo}</h1>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-cacao-500 sm:inline">
          {sesion?.usuario} ·{' '}
          <span className="font-semibold text-cacao-700">{sesion?.rol}</span>
        </span>
        <button className="btn-ghost" onClick={() => logout()}>
          Salir
        </button>
      </div>
    </header>
  )
}
