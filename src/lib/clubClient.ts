import { createClient } from '@supabase/supabase-js'

// Cliente Supabase dedicado a las puertas públicas (comensal).
// persistSession:false + storageKey propio → no interfiere con la sesión del POS (mozo/admin).
const URL = import.meta.env.VITE_SUPABASE_URL as string
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

let _c: ReturnType<typeof createClient> | null = null
function client() {
  if (!_c) {
    if (!URL || !KEY) throw new Error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
    _c = createClient(URL, KEY, {
      auth: { persistSession: false, autoRefreshToken: false, storageKey: 'df-club' },
    })
  }
  return _c
}

export interface TarjetaCliente {
  id: string
  nombre: string
  whatsapp: string
  puntos: number
  created_at: string
}

// Normaliza a los últimos 9 dígitos (celular Perú) para que un mismo número
// no genere tarjetas duplicadas por diferencias de formato.
export function normalizarWhatsapp(raw: string): string {
  return raw.replace(/\D/g, '').slice(-9)
}

export async function registrarCliente(
  nombre: string,
  whatsapp: string,
  cumpleanos: string | null,
): Promise<TarjetaCliente> {
  // rpc laxo: la función es nueva y no está en los tipos generados de Supabase.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = client() as any
  const { data, error } = await sb.rpc('registrar_cliente', {
    p_nombre: nombre.trim(),
    p_whatsapp: normalizarWhatsapp(whatsapp),
    p_cumpleanos: cumpleanos || null,
  })
  if (error) throw new Error(error.message)
  const row = Array.isArray(data) ? data[0] : data
  if (!row) throw new Error('No se pudo registrar. Intenta de nuevo.')
  return row as TarjetaCliente
}

export interface SaldoClub {
  puntos: number
  puntos_historicos: number
  puntos_usados: number
}

// Consulta el saldo REAL en la BD (la tarjeta local puede estar desactualizada
// porque los puntos se acumulan desde el POS al cerrar la mesa).
export async function consultarPuntos(whatsapp: string): Promise<SaldoClub | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = client() as any
  const { data, error } = await sb.rpc('consultar_puntos', {
    p_whatsapp: normalizarWhatsapp(whatsapp),
  })
  if (error) throw new Error(error.message)
  const row = Array.isArray(data) ? data[0] : data
  return row ? (row as SaldoClub) : null
}

// ── Identidad del cliente (clave de 4 dígitos + sesión) ─────────────────────
// Ver spec `specs/club-identidad-pin.md`. La clave se valida SIEMPRE en el
// servidor (RPC SECURITY DEFINER); el frontend nunca ve el hash.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rpc() {
  return client() as any
}

// Datos de sesión que devuelve el servidor tras autenticar.
export interface SesionCliente {
  nombre: string
  whatsapp: string
  puntos: number
  puntos_historicos: number
  puntos_usados: number
}

export type EstadoLogin = 'ok' | 'no_existe' | 'sin_clave' | 'bloqueado' | 'clave_incorrecta'

export interface ResultadoLogin {
  estado: EstadoLogin
  token?: string
  nombre?: string
  puntos?: number
  puntos_historicos?: number
  puntos_usados?: number
}

// Crea la clave de 4 dígitos. Solo si el cliente aún no tiene clave (registro
// nuevo o cliente antiguo). Si ya tiene cumpleaños en la BD, se exige que
// coincida (anti-secuestro). Lanza con el mensaje del servidor si falla.
export async function establecerPin(
  whatsapp: string,
  pin: string,
  cumpleanos: string | null,
): Promise<void> {
  const { error } = await rpc().rpc('establecer_pin', {
    p_whatsapp: normalizarWhatsapp(whatsapp),
    p_pin: pin,
    p_cumpleanos: cumpleanos || null,
  })
  if (error) throw new Error(error.message)
}

// Valida la clave. Devuelve el estado; si es 'ok', incluye token de sesión + saldo.
export async function verificarPin(whatsapp: string, pin: string): Promise<ResultadoLogin> {
  const { data, error } = await rpc().rpc('verificar_pin', {
    p_whatsapp: normalizarWhatsapp(whatsapp),
    p_pin: pin,
  })
  if (error) throw new Error(error.message)
  const row = Array.isArray(data) ? data[0] : data
  if (!row) return { estado: 'no_existe' }
  return {
    estado: row.estado as EstadoLogin,
    token: row.token ?? undefined,
    nombre: row.nombre ?? undefined,
    puntos: row.puntos ?? undefined,
    puntos_historicos: row.puntos_historicos ?? undefined,
    puntos_usados: row.puntos_usados ?? undefined,
  }
}

// "Olvidé mi clave": verifica por cumpleaños y define una clave nueva. Devuelve
// token + saldo (queda logueado). Lanza si los datos no coinciden.
export async function recuperarPin(
  whatsapp: string,
  cumpleanos: string,
  pinNuevo: string,
): Promise<ResultadoLogin> {
  const { data, error } = await rpc().rpc('recuperar_pin', {
    p_whatsapp: normalizarWhatsapp(whatsapp),
    p_cumpleanos: cumpleanos,
    p_pin_nuevo: pinNuevo,
  })
  if (error) throw new Error(error.message)
  const row = Array.isArray(data) ? data[0] : data
  if (!row) throw new Error('No se pudo recuperar tu acceso.')
  return {
    estado: 'ok',
    token: row.token,
    nombre: row.nombre,
    puntos: row.puntos,
    puntos_historicos: row.puntos_historicos,
    puntos_usados: row.puntos_usados,
  }
}

// Login silencioso por token de dispositivo. null si el token ya no es válido.
export async function sesionValida(token: string): Promise<SesionCliente | null> {
  const { data, error } = await rpc().rpc('sesion_valida', { p_token: token })
  if (error) throw new Error(error.message)
  const row = Array.isArray(data) ? data[0] : data
  return row ? (row as SesionCliente) : null
}

export async function cerrarSesion(token: string): Promise<void> {
  await rpc().rpc('cerrar_sesion', { p_token: token })
}

export interface Movimiento {
  fecha: string
  tipo: 'ganado' | 'canje'
  puntos: number
  detalle: string
}

// Historial de puntos (ganados por consumo + canjes). Requiere sesión válida.
export async function historialCliente(token: string): Promise<Movimiento[]> {
  const { data, error } = await rpc().rpc('historial_cliente', { p_token: token })
  if (error) throw new Error(error.message)
  return (Array.isArray(data) ? data : []) as Movimiento[]
}
