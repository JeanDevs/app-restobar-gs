import { useAuth } from '../../hooks/useAuth'

export default function LogoutButton() {
  const { logout } = useAuth()
  return (
    <button className="btn-ghost w-full justify-start" onClick={() => logout()}>
      ⎋ Salir
    </button>
  )
}
