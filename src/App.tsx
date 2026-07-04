import { useStore } from './store/useStore'
import LoginPage from './pages/LoginPage'
import MozoPage from './pages/MozoPage'
import AdminPage from './pages/AdminPage'
import { ToastContainer } from './components/Shared/Toast'
import PublicLanding from './pages/public/PublicLanding'
import PublicCarta from './pages/public/PublicCarta'
import PublicClub from './pages/public/PublicClub'

// "Ruteo" sin react-router (1 menos dependencia, regla del Harness):
//  - Rutas públicas del comensal (por pathname): /, /carta, /club  → sin login.
//  - Cualquier otra ruta (ej. /app) = POS interno por sesión + rol → INTACTO.
export default function App() {
  const sesion = useStore((s) => s.sesion)
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  if (path === '/') return <PublicLanding />
  if (path === '/carta') return <PublicCarta />
  if (path === '/club') return <PublicClub />

  return (
    <div className="min-h-full">
      {!sesion && <LoginPage />}
      {sesion?.rol === 'MOZO' && <MozoPage />}
      {sesion?.rol === 'ADMIN' && <AdminPage />}
      <ToastContainer />
    </div>
  )
}
