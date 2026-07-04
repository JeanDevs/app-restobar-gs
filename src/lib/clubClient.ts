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
