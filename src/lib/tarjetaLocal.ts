import type { TarjetaCliente } from './clubClient'

// La tarjeta del Club DF se recuerda en el teléfono del comensal (localStorage).
// Así, al volver a escanear el QR, ve su tarjeta sin re-registrarse.
const KEY = 'df_tarjeta'
// Token de sesión "recordar este teléfono" (90 días, ver spec club-identidad-pin).
// Es opaco: la BD guarda solo su hash sha256; este device conserva el original.
const TOKEN_KEY = 'df_token'

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

// ── Sesión (token de dispositivo) ───────────────────────────────────────────

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(t: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, t)
  } catch {
    /* no-op */
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* no-op */
  }
}
