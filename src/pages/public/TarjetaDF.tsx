// Tarjeta digital del Club DF: saldo real + regla (1 sol = 1 punto).
// Presentacional: recibe el saldo ya resuelto (de la sesión del cliente).
export default function TarjetaDF({
  nombre,
  puntos,
  historicos = null,
}: {
  nombre: string
  puntos: number
  historicos?: number | null
}) {
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
          <p className="brand text-2xl text-arena-50">{nombre}</p>

          <div className="mt-6 flex items-end gap-2">
            <span className="text-5xl font-bold text-marca-400">{puntos}</span>
            <span className="mb-1 text-sm text-arena-300">puntos</span>
          </div>

          {historicos !== null && historicos > puntos && (
            <p className="mt-2 text-xs text-arena-400">Has ganado {historicos} pts en total 🏆</p>
          )}
        </div>
      </div>

      {/* Reglas (R8: 1 sol = 1 punto) */}
      <div className="mt-5 rounded-2xl border border-arena-50/10 bg-cacao-900/40 p-5 text-sm text-arena-300">
        <p className="mb-2 font-semibold text-arena-100">¿Cómo funciona?</p>
        <ul className="space-y-1.5">
          <li>⭐ Cada sol consumido = <b className="text-marca-300">1 punto</b> (S/ 1 = 1 pt).</li>
          <li>📱 Al pagar, da tu número de WhatsApp al personal para sumar tus puntos.</li>
          <li>🎁 Canjea premios con tus puntos — pregunta por los premios disponibles.</li>
        </ul>
      </div>
    </div>
  )
}
