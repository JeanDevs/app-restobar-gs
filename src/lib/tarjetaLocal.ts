import type { TarjetaCliente } from './clubClient'

// La tarjeta del Club DF se recuerda en el teléfono del comensal (localStorage).
// Así, al volver a escanear el QR, ve su tarjeta sin re-registrarse.
const KEY = 'df_tarjeta'

export function getTarjeta(): TarjetaCliente | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as TarjetaCliente) : null
  } catch {
    return null
  }
}

export function setTarjeta(t: TarjetaCliente): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(t))
  } catch {
    /* almacenamiento no disponible: la tarjeta igual se mostró en pantalla */
  }
}

export function clearTarjeta(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* no-op */
  }
}
