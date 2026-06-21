import type { DataClient } from './dataClient'
import { createMockClient } from './mockClient'
import { createSupabaseClient } from './supabaseClient'

const fuente = import.meta.env.VITE_DATA_SOURCE ?? 'mock'

export const db: DataClient = fuente === 'supabase' ? createSupabaseClient() : createMockClient()

export const FUENTE_DATOS = fuente
export type { DataClient }
