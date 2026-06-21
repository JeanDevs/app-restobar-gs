import { useStore } from './store/useStore'
import LoginPage from './pages/LoginPage'
import MozoPage from './pages/MozoPage'
import AdminPage from './pages/AdminPage'
import { ToastContainer } from './components/Shared/Toast'

// "Ruteo" por sesión + rol (sin react-router: 1 menos dependencia, regla del Harness).
export default function App() {
  const sesion = useStore((s) => s.sesion)

  return (
    <div className="min-h-full">
      {!sesion && <LoginPage />}
      {sesion?.rol === 'MOZO' && <MozoPage />}
      {sesion?.rol === 'ADMIN' && <AdminPage />}
      <ToastContainer />
    </div>
  )
}
