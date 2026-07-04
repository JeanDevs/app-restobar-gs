import { MARCA } from '../../lib/marca'

// Puerta de entrada pública (comensal): elige Carta o Club DF.
export default function PublicLanding() {
  return (
    <div className="relative min-h-full overflow-hidden bg-[#08080a] text-arena-100">
      {/* Glow dorado de fondo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-80 w-[140%] -translate-x-1/2 rounded-full bg-marca-500/15 blur-[130px]" />
        <div className="absolute bottom-0 left-1/2 h-64 w-[120%] -translate-x-1/2 rounded-full bg-marca-700/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-6 py-14 text-center">
        <h1 className="sr-only">{MARCA.nombre} — Restobar & Eventos</h1>

        {/* Logo dorado (DF). Si falta el archivo, se muestra el texto de respaldo. */}
        <img
          src={MARCA.logo}
          alt={MARCA.nombre}
          className="mb-2 h-40 w-40 object-contain drop-shadow-[0_4px_24px_rgba(244,169,0,0.25)]"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextElementSibling?.classList.remove('hidden')
          }}
        />
        <p className="brand hidden text-4xl text-marca-300">Destino Final</p>

        <p className="mt-1 text-xs uppercase tracking-[0.4em] text-marca-400">{MARCA.subtitle}</p>

        <div className="mt-5 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-marca-500/60" />
          <span className="text-sm italic tracking-wide text-arena-300">{MARCA.tagline}</span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-marca-500/60" />
        </div>

        <div className="mt-11 flex w-full flex-col gap-4">
          <a href="/carta" className="btn-primary w-full py-4 text-base">
            🍽️ Ver la Carta
          </a>
          <a
            href="/club"
            className="btn w-full border border-marca-500/50 bg-transparent py-4 text-base font-semibold text-marca-300 hover:bg-marca-500/10"
          >
            ⭐ Únete al Club DF
          </a>
        </div>

        <p className="mt-9 max-w-xs text-xs leading-relaxed text-arena-400">
          Regístrate en el Club DF y acumula puntos en cada visita.
        </p>

        <footer className="mt-12 space-y-1.5 text-xs text-arena-500">
          <p>
            <a href={MARCA.reservasWa} className="text-marca-400 hover:text-marca-300">
              📞 Reservas: {MARCA.reservas}
            </a>
          </p>
          <p>📍 {MARCA.direccion}</p>
          <p>🕔 {MARCA.horario}</p>
        </footer>
      </div>
    </div>
  )
}
