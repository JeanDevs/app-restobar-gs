import { useMesas } from '../../hooks/useMesas'
import { useStore } from '../../store/useStore'
import { MESA_BARRA } from '../../types'

export default function MesaSelector() {
  const { mesas } = useMesas()
  const mesaActiva = useStore((s) => s.mesaActiva)
  const setMesaActiva = useStore((s) => s.setMesaActiva)
  const esAdmin = useStore((s) => s.sesion?.rol === 'ADMIN')

  return (
    <div className="card p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Mesa
      </h2>
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
        {mesas.map((mesa) => {
          const activa = mesa.numero === mesaActiva
          const ocupada = mesa.estado === 'OCUPADA'
          return (
            <button
              key={mesa.id}
              onClick={() => setMesaActiva(activa ? null : mesa.numero)}
              className={[
                'relative flex h-14 items-center justify-center rounded-lg border text-base font-bold transition sm:h-12 sm:text-sm',
                activa
                  ? 'border-marca-600 bg-marca-500 text-white shadow'
                  : ocupada
                    ? 'border-amber-300 bg-amber-50 text-amber-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-marca-400',
              ].join(' ')}
              title={`Mesa ${mesa.numero} · ${mesa.estado}`}
            >
              {mesa.numero}
              {ocupada && !activa && (
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-500" />
              )}
            </button>
          )
        })}
      </div>

      {/* Venta de barra (no asociada a mesa) — solo admin / quien esté en barra */}
      {esAdmin && (
        <button
          onClick={() =>
            setMesaActiva(mesaActiva === MESA_BARRA ? null : MESA_BARRA)
          }
          className={[
            'mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border text-sm font-bold transition',
            mesaActiva === MESA_BARRA
              ? 'border-marca-600 bg-marca-500 text-white shadow'
              : 'border-slate-200 bg-white text-slate-700 hover:border-marca-400',
          ].join(' ')}
        >
          🍸 Barra (venta sin mesa)
        </button>
      )}
    </div>
  )
}
