import { useState, type ReactNode } from 'react'

interface CollapsibleCardProps {
  titulo: string
  derecha?: ReactNode // contenido a la derecha del encabezado (contador, total…)
  defaultOpen?: boolean
  children: ReactNode
}

// Tarjeta con encabezado clickeable que despliega/minimiza su contenido (flecha ▼).
export default function CollapsibleCard({
  titulo,
  derecha,
  defaultOpen = true,
  children,
}: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="card min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-[48px] w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {titulo}
        </span>
        <span className="flex items-center gap-3">
          {derecha}
          <svg
            className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}
