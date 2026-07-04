import { useState } from 'react'
import { registrarCliente, normalizarWhatsapp, type TarjetaCliente } from '../../lib/clubClient'
import { getTarjeta, setTarjeta, clearTarjeta } from '../../lib/tarjetaLocal'
import TarjetaDF from './TarjetaDF'

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

export default function PublicClub() {
  const [tarjeta, setTarjetaState] = useState<TarjetaCliente | null>(() => getTarjeta())
  const [nombre, setNombre] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [cumpleanos, setCumpleanos] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (nombre.trim().length < 2) {
      setError('Ingresa tu nombre.')
      return
    }
    if (normalizarWhatsapp(whatsapp).length < 9) {
      setError('Ingresa un número de WhatsApp válido (9 dígitos).')
      return
    }

    setLoading(true)
    try {
      const t = await registrarCliente(nombre, whatsapp, cumpleanos || null)
      setTarjeta(t)
      setTarjetaState(t)
    } catch {
      setError('No pudimos guardar tu registro. Revisa tu conexión e intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function salir() {
    clearTarjeta()
    setTarjetaState(null)
    setNombre('')
    setWhatsapp('')
    setCumpleanos('')
  }

  return (
    <div className="min-h-full bg-[#08080a] text-arena-100">
      <Header />
      <main className="mx-auto max-w-md px-6 pb-24 pt-8">
        {tarjeta ? (
          <>
            <h1 className="brand mb-2 text-center text-2xl text-arena-50">¡Bienvenido al Club! 🎉</h1>
            <p className="mb-6 text-center text-sm text-arena-300">Esta es tu tarjeta digital.</p>
            <TarjetaDF tarjeta={tarjeta} />
            <button
              onClick={salir}
              className="mx-auto mt-8 block text-xs text-arena-500 underline hover:text-arena-300"
            >
              No soy {tarjeta.nombre} · registrar otra persona
            </button>
          </>
        ) : (
          <>
            <h1 className="brand mb-2 text-center text-3xl text-arena-50">Únete al Club DF</h1>
            <p className="mb-8 text-center text-sm text-arena-300">
              Déjanos tus datos y recibe <b className="text-marca-300">50 puntos</b> de bienvenida.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="label text-arena-300">Nombre</label>
                <input
                  className="input"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="label text-arena-300">WhatsApp</label>
                <input
                  className="input"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="999 888 777"
                  inputMode="numeric"
                  autoComplete="tel"
                />
              </div>
              <div>
                <label className="label text-arena-300">Cumpleaños (opcional)</label>
                <input
                  className="input"
                  type="date"
                  value={cumpleanos}
                  onChange={(e) => setCumpleanos(e.target.value)}
                />
              </div>

              {error && (
                <p className="rounded-lg border border-terra-500/40 bg-terra-950/40 px-3 py-2 text-sm text-terra-200">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
                {loading ? 'Guardando…' : 'Obtener mi tarjeta ⭐'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-arena-500">
              Tu tarjeta se guarda en este teléfono para tu próxima visita.
            </p>
          </>
        )}
      </main>
    </div>
  )
}
