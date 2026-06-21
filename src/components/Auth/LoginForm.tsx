import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useStore } from '../../store/useStore'

export default function LoginForm() {
  const { login } = useAuth()
  const pushToast = useStore((s) => s.pushToast)
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const perfil = await login(usuario, contrasena)
      pushToast(`Bienvenido, ${perfil.usuario}`, 'ok')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label" htmlFor="usuario">
          Usuario
        </label>
        <input
          id="usuario"
          className="input"
          autoFocus
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          placeholder="mozo1 / admin"
        />
      </div>

      <div>
        <label className="label" htmlFor="contrasena">
          Contraseña
        </label>
        <input
          id="contrasena"
          type="password"
          className="input"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          placeholder="••••••"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? 'Ingresando…' : 'Ingresar'}
      </button>

      <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500">
        <p className="font-semibold text-slate-600">Credenciales de prueba (Fase 1)</p>
        <p>Mozo: <code>mozo1</code> / <code>mozo12</code></p>
        <p>Admin: <code>admin</code> / <code>mood12</code></p>
      </div>
    </form>
  )
}
