// Puerta de entrada pública (comensal): elige Carta o Club DF.
export default function PublicLanding() {
  return (
    <div className="relative min-h-full overflow-hidden bg-cacao-950 text-arena-100">
      {/* Glow dorado de fondo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-72 w-[130%] -translate-x-1/2 rounded-full bg-marca-500/15 blur-[120px]" />
      </div>

      <div className="relative mx-auto flex min-h-full max-w-md flex-col items-center justify-center px-6 py-16 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.4em] text-marca-400">Resto · Bar</p>
        <h1 className="brand text-5xl text-arena-50 sm:text-6xl">Destino Final</h1>

        <div className="mt-5 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-marca-500/60" />
          <span className="text-sm tracking-wide text-arena-300">Licor &amp; Piqueos</span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-marca-500/60" />
        </div>

        <div className="mt-12 flex w-full flex-col gap-4">
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

        <p className="mt-10 max-w-xs text-xs leading-relaxed text-arena-400">
          Regístrate en el Club DF y acumula puntos en cada visita.
        </p>

        <footer className="mt-14 space-y-1 text-xs text-arena-500">
          <p>📍 Av. El Sol 527 · Urb. Canto Grande</p>
          <p>🕔 Lun a Dom · 5:00 p. m. – 1:00 a. m.</p>
        </footer>
      </div>
    </div>
  )
}
