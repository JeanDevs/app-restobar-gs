interface CantidadInputProps {
  value: number
  onChange: (n: number) => void
}

// Stepper compacto de cantidad (− valor +), pensado para usarse inline en listas.
export default function CantidadInput({ value, onChange }: CantidadInputProps) {
  const set = (n: number) => onChange(Math.max(1, Math.floor(n) || 1))

  return (
    <div className="inline-flex shrink-0 items-center rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center text-xl leading-none text-slate-500 active:bg-slate-100"
        onClick={() => set(value - 1)}
        aria-label="Disminuir"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center text-xl leading-none text-slate-500 active:bg-slate-100"
        onClick={() => set(value + 1)}
        aria-label="Aumentar"
      >
        +
      </button>
    </div>
  )
}
