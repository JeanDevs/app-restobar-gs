// Formato de moneda peruana (soles) y hora local.
export const soles = (n: number): string => `S/ ${(n ?? 0).toFixed(2)}`

// Etiqueta de origen del pedido: mesa numerada o Barra (mesa_numero === 0).
export const etiquetaMesa = (numero: number): string =>
  numero === 0 ? 'Barra' : `Mesa ${numero}`

export const hora = (iso: string | null): string =>
  iso
    ? new Date(iso).toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

export const fecha = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleDateString('es-PE') : '—'
