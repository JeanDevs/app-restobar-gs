import type { Orden } from '../types'
import { fecha, hora, etiquetaMesa } from './format'

// Escapa un valor para CSV (comillas, comas, saltos de línea).
function csvEscape(v: string | number): string {
  const s = String(v ?? '')
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// Exporta el historial de órdenes a un CSV que Excel abre directamente.
// Incluye `sep=,` + BOM UTF-8 para que Excel respete separador y acentos.
export function exportarHistorialCSV(ordenes: Orden[]): void {
  const headers = [
    'Fecha',
    'Hora',
    'Origen',
    'Comensal',
    'Ítems',
    'Total (S/)',
    'Tipo de pago',
    'Estado',
    'Mozo',
    'Detalle',
  ]

  const filas = ordenes.map((o) => [
    fecha(o.cerrado_en),
    hora(o.cerrado_en),
    etiquetaMesa(o.mesa_numero),
    o.comensal ?? '',
    o.cantidad,
    (o.total_final ?? o.total).toFixed(2),
    o.tipo_pago ?? '',
    o.estado,
    o.mozo ?? '',
    (o.items ?? []).map((it) => `${it.item_nombre} x${it.cantidad}`).join(' | '),
  ])

  const csv = [headers, ...filas]
    .map((row) => row.map(csvEscape).join(','))
    .join('\r\n')

  const contenido = '﻿' + 'sep=,\r\n' + csv
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `historial-restobar-gs-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
