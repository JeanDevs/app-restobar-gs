import type { TarjetaCliente } from '../../lib/clubClient'

export const META_PUNTOS = 500

// Tarjeta digital del Club DF: saldo + regla + progreso hacia el canje.
export default function TarjetaDF({ tarjeta }: { tarjeta: TarjetaCliente }) {
  const pct = Math.min(100, Math.round((tarjeta.puntos / META_PUNTOS) * 100))
  const faltan = Math.max(0, META_PUNTOS - tarjeta.puntos)

  return (
    <div className="w-full">
      {/* La tarjeta */}
      <div className="relative overflow-hidden rounded-3xl border border-marca-500/30 bg-gradient-to-br from-cacao-900 to-cacao-950 p-6 shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-marca-500/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-marca-400">Club DF</span>
            <span className="brand text-sm text-arena-200">Destino Final</span>
          </div>

          <p className="mt-6 text-sm text-arena-300">Hola,</p>
          <p className="brand text-2xl text-arena-50">{tarjeta.nombre}</p>

          <div className="mt-6 flex items-end gap-2">
            <span className="text-5xl font-bold text-marca-400">{tarjeta.puntos}</span>
            <span className="mb-1 text-sm text-arena-300">puntos</span>
          </div>

          {/* Progreso hacia el canje */}
          <div className="mt-4">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-arena-50/10">
              <div
                className="h-full rounded-full bg-marca-500 transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-arena-400">
              {faltan > 0
                ? `Te faltan ${faltan} pts para canjear un beneficio 🎁`
                : '¡Ya puedes canjear un beneficio! 🎁'}
            </p>
          </div>
        </div>
      </div>

      {/* Reglas */}
      <div className="mt-5 rounded-2xl border border-arena-50/10 bg-cacao-900/40 p-5 text-sm text-arena-300">
        <p className="mb-2 font-semibold text-arena-100">¿Cómo funciona?</p>
        <ul className="space-y-1.5">
          <li>⭐ Cada compra suma <b className="text-marca-300">50 puntos</b>.</li>
          <li>🎁 Al llegar a <b className="text-marca-300">500 puntos</b> canjeas un beneficio.</li>
          <li>📱 Muestra esta tarjeta al personal en tu próxima visita.</li>
        </ul>
      </div>
    </div>
  )
}
