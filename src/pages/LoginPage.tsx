import LoginForm from '../components/Auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-arena-100 via-arena-50 to-marca-50 p-4">
      {/* Halos cálidos de fondo */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-marca-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-terra-300/30 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cacao-800 text-3xl shadow-lg">
            🍻
          </div>
          <h1 className="brand mt-4 text-3xl">Restobar GS</h1>
          <p className="mt-1 text-sm font-medium text-cacao-500">
            Control de mesas
          </p>
        </div>
        <div className="card p-6 shadow-md">
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-xs text-cacao-400">
          {import.meta.env.VITE_DATA_SOURCE === 'supabase'
            ? 'Conectado a Supabase'
            : 'Fase 1 · datos locales (mock)'}
        </p>
      </div>
    </div>
  )
}
