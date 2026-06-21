import LoginForm from '../components/Auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="text-4xl">🍻</div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-800">
            Restobar GS
          </h1>
          <p className="text-sm text-slate-500">Control de mesas</p>
        </div>
        <div className="card p-6">
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-xs text-slate-400">
          {import.meta.env.VITE_DATA_SOURCE === 'supabase' ? 'Conectado a Supabase' : 'Fase 1 · datos locales (mock)'}
        </p>
      </div>
    </div>
  )
}
