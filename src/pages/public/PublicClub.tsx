import { useEffect, useState } from 'react'
import {
  registrarCliente,
  establecerPin,
  verificarPin,
  recuperarPin,
  sesionValida,
  cerrarSesion,
  historialCliente,
  normalizarWhatsapp,
  type Movimiento,
} from '../../lib/clubClient'
import { getToken, setToken, clearToken } from '../../lib/tarjetaLocal'
import TarjetaDF from './TarjetaDF'

type Vista = 'cargando' | 'inicio' | 'registro' | 'login' | 'crear_clave' | 'olvide' | 'sesion'

interface Sesion {
  nombre: string
  whatsapp: string
  puntos: number
  historicos: number | null
}

function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-arena-50/10 bg-[#08080a]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
        <a href="/" className="text-sm text-arena-300 hover:text-arena-100">
          ← Inicio
        </a>
        <span className="brand text-lg text-arena-50">Club DF</span>
        <a href="/carta" className="text-sm text-marca-300 hover:text-marca-200">
          Carta
        </a>
      </div>
    </header>
  )
}

// Input de clave de 4 dígitos (numérico, oculto).
function PinInput({
  value,
  onChange,
  label,
  autoFocus,
}: {
  value: string
  onChange: (v: string) => void
  label: string
  autoFocus?: boolean
}) {
  return (
    <div>
      <label className="label text-arena-300">{label}</label>
      <input
        className="input tracking-[0.5em]"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
        placeholder="••••"
        inputMode="numeric"
        type="password"
        maxLength={4}
        autoFocus={autoFocus}
      />
    </div>
  )
}

export default function PublicClub() {
  const [vista, setVista] = useState<Vista>('cargando')
  const [sesion, setSesion] = useState<Sesion | null>(null)
  const [token, setTok] = useState<string | null>(null)
  const [historial, setHistorial] = useState<Movimiento[] | null>(null)

  // Campos de formulario (compartidos entre vistas).
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [cumpleanos, setCumpleanos] = useState('')
  const [pin, setPin] = useState('')
  const [pin2, setPin2] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Al abrir: intenta login silencioso con el token del dispositivo.
  useEffect(() => {
    const t = getToken()
    if (!t) {
      setVista('inicio')
      return
    }
    sesionValida(t)
      .then((s) => {
        if (s) {
          setTok(t)
          setSesion({ nombre: s.nombre, whatsapp: s.whatsapp, puntos: s.puntos, historicos: s.puntos_historicos })
          setVista('sesion')
        } else {
          clearToken()
          setVista('inicio')
        }
      })
      .catch(() => setVista('inicio'))
  }, [])

  // Carga el historial al entrar a la sesión.
  useEffect(() => {
    if (vista !== 'sesion' || !token) return
    historialCliente(token)
      .then(setHistorial)
      .catch(() => setHistorial([]))
  }, [vista, token])

  function limpiarCampos() {
    setNombre('')
    setWhatsapp('')
    setCumpleanos('')
    setPin('')
    setPin2('')
    setError(null)
  }

  function irA(v: Vista) {
    limpiarCampos()
    setVista(v)
  }

  // Aplica una sesión recién obtenida (token + saldo) y va a la tarjeta.
  function entrar(tok: string, r: { nombre?: string; puntos?: number; puntos_historicos?: number }, wa: string) {
    setToken(tok)
    setTok(tok)
    setSesion({
      nombre: r.nombre ?? 'Cliente',
      whatsapp: wa,
      puntos: r.puntos ?? 0,
      historicos: r.puntos_historicos ?? null,
    })
    setHistorial(null)
    setVista('sesion')
  }

  function validarPinLocal(): string | null {
    if (!/^\d{4}$/.test(pin)) return 'La clave debe ser de 4 dígitos.'
    if (pin !== pin2) return 'Las claves no coinciden.'
    return null
  }

  // ── Registro nuevo (F1) ────────────────────────────────────────────────────
  async function onRegistro(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (nombre.trim().length < 2) return setError('Ingresa tu nombre.')
    if (normalizarWhatsapp(whatsapp).length < 9) return setError('Ingresa un WhatsApp válido (9 dígitos).')
    const pe = validarPinLocal()
    if (pe) return setError(pe)

    setLoading(true)
    try {
      await registrarCliente(nombre, whatsapp, cumpleanos || null)
      await establecerPin(whatsapp, pin, cumpleanos || null)
      const r = await verificarPin(whatsapp, pin)
      if (r.estado === 'ok' && r.token) entrar(r.token, r, normalizarWhatsapp(whatsapp))
      else setError('Registro guardado, pero no pudimos iniciar sesión. Prueba "Ya soy cliente".')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos completar tu registro.')
    } finally {
      setLoading(false)
    }
  }

  // ── Login (F2) ──────────────────────────────────────────────────────────────
  async function onLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (normalizarWhatsapp(whatsapp).length < 9) return setError('Ingresa tu WhatsApp (9 dígitos).')
    if (!/^\d{4}$/.test(pin)) return setError('Ingresa tu clave de 4 dígitos.')

    setLoading(true)
    try {
      const r = await verificarPin(whatsapp, pin)
      switch (r.estado) {
        case 'ok':
          if (r.token) entrar(r.token, r, normalizarWhatsapp(whatsapp))
          break
        case 'sin_clave':
          setError(null)
          setPin('')
          setPin2('')
          setVista('crear_clave') // conserva whatsapp
          break
        case 'no_existe':
          setError('No encontramos ese número. Usa "Únete al Club" para registrarte.')
          break
        case 'bloqueado':
          setError('Demasiados intentos. Espera 15 minutos o usa "Olvidé mi clave".')
          break
        default:
          setError('Clave incorrecta. Intenta de nuevo.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos validar tu clave.')
    } finally {
      setLoading(false)
    }
  }

  // ── Crear clave para cliente existente sin clave (R4) ───────────────────────
  async function onCrearClave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const pe = validarPinLocal()
    if (pe) return setError(pe)

    setLoading(true)
    try {
      await establecerPin(whatsapp, pin, cumpleanos || null)
      const r = await verificarPin(whatsapp, pin)
      if (r.estado === 'ok' && r.token) entrar(r.token, r, normalizarWhatsapp(whatsapp))
      else setError('No pudimos iniciar sesión. Intenta de nuevo.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos crear tu clave.')
    } finally {
      setLoading(false)
    }
  }

  // ── Olvidé mi clave (F3) ────────────────────────────────────────────────────
  async function onOlvide(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (normalizarWhatsapp(whatsapp).length < 9) return setError('Ingresa tu WhatsApp (9 dígitos).')
    if (!cumpleanos) return setError('Ingresa tu fecha de cumpleaños para verificar tu identidad.')
    const pe = validarPinLocal()
    if (pe) return setError(pe)

    setLoading(true)
    try {
      const r = await recuperarPin(whatsapp, cumpleanos, pin)
      if (r.token) entrar(r.token, r, normalizarWhatsapp(whatsapp))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos recuperar tu acceso.')
    } finally {
      setLoading(false)
    }
  }

  async function salir() {
    if (token) await cerrarSesion(token).catch(() => {})
    clearToken()
    setTok(null)
    setSesion(null)
    setHistorial(null)
    irA('inicio')
  }

  return (
    <div className="min-h-full bg-[#08080a] text-arena-100">
      <Header />
      <main className="mx-auto max-w-md px-6 pb-24 pt-8">
        {vista === 'cargando' && <p className="mt-16 text-center text-sm text-arena-400">Cargando…</p>}

        {/* Inicio: elegir registro o login */}
        {vista === 'inicio' && (
          <>
            <h1 className="brand mb-2 text-center text-3xl text-arena-50">Club DF</h1>
            <p className="mb-8 text-center text-sm text-arena-300">
              Acumula <b className="text-marca-300">1 punto por cada sol</b> y canjea premios.
            </p>
            <div className="space-y-3">
              <button onClick={() => irA('registro')} className="btn-primary w-full py-4 text-base">
                Únete al Club ⭐
              </button>
              <button
                onClick={() => irA('login')}
                className="w-full rounded-xl border border-arena-50/15 bg-cacao-900/40 py-4 text-base font-semibold text-arena-100 hover:bg-cacao-900/70"
              >
                Ya soy cliente
              </button>
            </div>
          </>
        )}

        {/* Registro nuevo con clave */}
        {vista === 'registro' && (
          <>
            <h1 className="brand mb-2 text-center text-3xl text-arena-50">Únete al Club DF</h1>
            <p className="mb-8 text-center text-sm text-arena-300">
              Regístrate y recibe <b className="text-marca-300">50 puntos</b> de bienvenida.
            </p>
            <form onSubmit={onRegistro} className="space-y-4">
              <div>
                <label className="label text-arena-300">Nombre</label>
                <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" autoComplete="given-name" />
              </div>
              <div>
                <label className="label text-arena-300">WhatsApp</label>
                <input className="input" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="999 888 777" inputMode="numeric" autoComplete="tel" />
              </div>
              <div>
                <label className="label text-arena-300">Cumpleaños (para recuperar tu clave)</label>
                <input className="input" type="date" value={cumpleanos} onChange={(e) => setCumpleanos(e.target.value)} />
              </div>
              <PinInput value={pin} onChange={setPin} label="Crea tu clave (4 dígitos)" />
              <PinInput value={pin2} onChange={setPin2} label="Repite tu clave" />

              {error && <p className="rounded-lg border border-terra-500/40 bg-terra-950/40 px-3 py-2 text-sm text-terra-200">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
                {loading ? 'Creando…' : 'Crear mi cuenta ⭐'}
              </button>
            </form>
            <button onClick={() => irA('inicio')} className="mx-auto mt-6 block text-xs text-arena-500 underline hover:text-arena-300">
              ← Volver
            </button>
          </>
        )}

        {/* Login */}
        {vista === 'login' && (
          <>
            <h1 className="brand mb-2 text-center text-3xl text-arena-50">Ya soy cliente</h1>
            <p className="mb-8 text-center text-sm text-arena-300">Ingresa con tu WhatsApp y tu clave.</p>
            <form onSubmit={onLogin} className="space-y-4">
              <div>
                <label className="label text-arena-300">WhatsApp</label>
                <input className="input" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="999 888 777" inputMode="numeric" autoComplete="tel" />
              </div>
              <PinInput value={pin} onChange={setPin} label="Tu clave (4 dígitos)" />

              {error && <p className="rounded-lg border border-terra-500/40 bg-terra-950/40 px-3 py-2 text-sm text-terra-200">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
                {loading ? 'Entrando…' : 'Ver mis puntos'}
              </button>
            </form>
            <div className="mt-6 flex items-center justify-between text-xs">
              <button onClick={() => irA('olvide')} className="text-marca-300 underline hover:text-marca-200">
                Olvidé mi clave
              </button>
              <button onClick={() => irA('registro')} className="text-arena-500 underline hover:text-arena-300">
                Crear cuenta
              </button>
            </div>
          </>
        )}

        {/* Crear clave (cliente existente sin clave) */}
        {vista === 'crear_clave' && (
          <>
            <h1 className="brand mb-2 text-center text-2xl text-arena-50">Crea tu clave</h1>
            <p className="mb-8 text-center text-sm text-arena-300">
              Ya estás registrado. Crea una clave de 4 dígitos para proteger tus puntos.
            </p>
            <form onSubmit={onCrearClave} className="space-y-4">
              <div>
                <label className="label text-arena-300">Confirma tu cumpleaños</label>
                <input className="input" type="date" value={cumpleanos} onChange={(e) => setCumpleanos(e.target.value)} />
              </div>
              <PinInput value={pin} onChange={setPin} label="Nueva clave (4 dígitos)" autoFocus />
              <PinInput value={pin2} onChange={setPin2} label="Repite tu clave" />

              {error && <p className="rounded-lg border border-terra-500/40 bg-terra-950/40 px-3 py-2 text-sm text-terra-200">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
                {loading ? 'Guardando…' : 'Crear clave y entrar'}
              </button>
            </form>
            <button onClick={() => irA('login')} className="mx-auto mt-6 block text-xs text-arena-500 underline hover:text-arena-300">
              ← Volver
            </button>
          </>
        )}

        {/* Olvidé mi clave */}
        {vista === 'olvide' && (
          <>
            <h1 className="brand mb-2 text-center text-2xl text-arena-50">Recuperar mi clave</h1>
            <p className="mb-8 text-center text-sm text-arena-300">
              Verifica tu identidad con tu cumpleaños y define una clave nueva.
            </p>
            <form onSubmit={onOlvide} className="space-y-4">
              <div>
                <label className="label text-arena-300">WhatsApp</label>
                <input className="input" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="999 888 777" inputMode="numeric" autoComplete="tel" />
              </div>
              <div>
                <label className="label text-arena-300">Tu cumpleaños</label>
                <input className="input" type="date" value={cumpleanos} onChange={(e) => setCumpleanos(e.target.value)} />
              </div>
              <PinInput value={pin} onChange={setPin} label="Nueva clave (4 dígitos)" />
              <PinInput value={pin2} onChange={setPin2} label="Repite tu clave" />

              {error && <p className="rounded-lg border border-terra-500/40 bg-terra-950/40 px-3 py-2 text-sm text-terra-200">{error}</p>}

              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
                {loading ? 'Verificando…' : 'Recuperar acceso'}
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-arena-500">
              ¿No recuerdas tu cumpleaños? Acércate a la barra y el personal puede resetear tu clave.
            </p>
            <button onClick={() => irA('login')} className="mx-auto mt-4 block text-xs text-arena-500 underline hover:text-arena-300">
              ← Volver
            </button>
          </>
        )}

        {/* Sesión activa: tarjeta + historial */}
        {vista === 'sesion' && sesion && (
          <>
            <h1 className="brand mb-6 text-center text-2xl text-arena-50">Tu tarjeta</h1>
            <TarjetaDF nombre={sesion.nombre} puntos={sesion.puntos} historicos={sesion.historicos} />

            {/* Historial de movimientos (C4) */}
            <div className="mt-6 rounded-2xl border border-arena-50/10 bg-cacao-900/40 p-5">
              <p className="mb-3 text-sm font-semibold text-arena-100">Tu historial</p>
              {historial === null ? (
                <p className="text-xs text-arena-400">Cargando…</p>
              ) : historial.length === 0 ? (
                <p className="text-xs text-arena-400">Aún no tienes movimientos. ¡Tu próximo consumo suma puntos!</p>
              ) : (
                <ul className="space-y-2">
                  {historial.map((m, i) => (
                    <li key={i} className="flex items-center justify-between border-b border-arena-50/5 pb-2 text-sm last:border-0">
                      <span className="text-arena-300">
                        {m.detalle}
                        <span className="ml-2 text-xs text-arena-500">
                          {new Date(m.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                        </span>
                      </span>
                      <span className={m.puntos >= 0 ? 'font-semibold text-marca-300' : 'font-semibold text-terra-300'}>
                        {m.puntos >= 0 ? `+${m.puntos}` : m.puntos}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button onClick={salir} className="mx-auto mt-8 block text-xs text-arena-500 underline hover:text-arena-300">
              Cerrar sesión en este teléfono
            </button>
          </>
        )}
      </main>
    </div>
  )
}
