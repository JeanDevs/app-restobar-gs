import { createClient } from '@supabase/supabase-js'
import type { DataClient, LineaPedido, NuevoItem, CierreDia } from './dataClient'
import type {
  ClienteClub,
  Item,
  Mesa,
  Orden,
  OrdenItem,
  Pago,
  Perfil,
  Premio,
  RegistroAuditoria,
  ResultadoClub,
  Rol,
  TipoPago,
} from '../types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!

// Cliente perezoso: NO se crea al importar el módulo. Así, en modo mock (sin las
// env vars de Supabase), importar este archivo no rompe la app — `createClient`
// solo corre cuando realmente se usa el cliente Supabase (VITE_DATA_SOURCE=supabase).
function makeClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
let _client: ReturnType<typeof makeClient> | null = null
function sb(): ReturnType<typeof makeClient> {
  if (!_client) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
    }
    _client = makeClient()
  }
  return _client
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>

function mapItem(r: Row): Item {
  return {
    id: r.id,
    nombre: r.nombre,
    precio: Number(r.precio),
    categoria: r.categoria,
    activo: r.activo,
    creado_en: r.creado_en,
  }
}

function mapPago(p: Row): Pago {
  return {
    id: p.id,
    orden_id: p.orden_id,
    monto: Number(p.monto),
    tipo_pago: p.tipo_pago,
    parcial: p.parcial,
    item_ids: (p.item_ids as string[]) ?? [],
    mozo: p.mozo ?? null,
    creado_en: p.creado_en,
  }
}

function mapOrden(r: Row): Orden {
  const items: OrdenItem[] = ((r.orden_items as Row[]) ?? []).map((oi) => ({
    id: oi.id,
    orden_id: oi.orden_id,
    item_id: oi.item_id,
    item_nombre: oi.item_nombre,
    item_precio: Number(oi.item_precio),
    cantidad: oi.cantidad,
    subtotal: Number(oi.subtotal),
    pagado: oi.pagado ?? false,
  }))
  const pagos: Pago[] = ((r.pagos as Row[]) ?? []).map(mapPago)
  return {
    id: r.id,
    mesa_numero: r.mesa_numero,
    mesa_id: r.mesa_id ?? '',
    total: Number(r.total),
    cantidad: r.cantidad,
    tipo_pago: r.tipo_pago ?? null,
    estado: r.estado,
    total_final: r.total_final !== null && r.total_final !== undefined ? Number(r.total_final) : null,
    pagado: r.pagado !== null && r.pagado !== undefined ? Number(r.pagado) : 0,
    mozo: r.mozo ?? null,
    comensal: r.comensal ?? null,
    dia_cerrado: r.dia_cerrado ?? false,
    motivo_anulacion: r.motivo_anulacion ?? null,
    creado_en: r.creado_en,
    cerrado_en: r.cerrado_en ?? null,
    items,
    pagos,
  }
}

function err(msg: string | undefined): never {
  throw new Error(msg ?? 'Error desconocido')
}

class SupabaseDataClient implements DataClient {
  private sesionCache: Perfil | null = null
  private listeners = new Set<() => void>()
  // Single shared channel — multiple subscribe() calls add to the same Set.
  private channel: ReturnType<ReturnType<typeof makeClient>['channel']> | null = null

  private emit() {
    this.listeners.forEach((cb) => cb())
  }

  private ensureChannel() {
    if (this.channel) return
    this.channel = sb()
      .channel('restobar-gs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ordenes' }, () => this.emit())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orden_items' }, () => this.emit())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pagos' }, () => this.emit())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mesas' }, () => this.emit())
      .subscribe()
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  async login(usuario: string, contrasena: string): Promise<Perfil> {
    const email = `${usuario}@restobar-gs.local`
    const { data, error } = await sb().auth.signInWithPassword({ email, password: contrasena })
    if (error || !data.user) err('Usuario o contraseña incorrectos')

    const { data: p, error: pe } = await sb()
      .from('perfiles')
      .select('id, usuario, rol')
      .eq('id', data.user.id)
      .single()
    if (pe || !p) err('Perfil no encontrado. Contacta al administrador.')

    this.sesionCache = { id: p.id, usuario: p.usuario, rol: p.rol as Rol }
    return this.sesionCache
  }

  async logout(): Promise<void> {
    await sb().auth.signOut()
    this.sesionCache = null
  }

  getSesion(): Perfil | null {
    return this.sesionCache
  }

  // Restaura la sesión de Supabase guardada en localStorage (llamado desde main.tsx).
  async restoreSession(): Promise<Perfil | null> {
    const { data: { session } } = await sb().auth.getSession()
    if (!session?.user) return null
    const { data: p } = await sb()
      .from('perfiles')
      .select('id, usuario, rol')
      .eq('id', session.user.id)
      .single()
    if (!p) return null
    this.sesionCache = { id: p.id, usuario: p.usuario, rol: p.rol as Rol }
    return this.sesionCache
  }

  // ── Items ─────────────────────────────────────────────────────────────────

  async getItems(): Promise<Item[]> {
    const { data, error } = await sb()
      .from('items')
      .select('*')
      .eq('activo', true)
      .order('categoria')
      .order('nombre')
    if (error) err(error.message)
    return (data ?? []).map(mapItem)
  }

  async createItem(d: NuevoItem): Promise<Item> {
    const { data, error } = await sb()
      .from('items')
      .insert({ nombre: d.nombre, precio: d.precio, categoria: d.categoria })
      .select()
      .single()
    if (error) err(error.message)
    return mapItem(data)
  }

  async updateItem(id: string, d: Partial<NuevoItem>): Promise<Item> {
    const { data, error } = await sb().from('items').update(d).eq('id', id).select().single()
    if (error) err(error.message)
    return mapItem(data)
  }

  async deleteItem(id: string): Promise<void> {
    const { error } = await sb().from('items').update({ activo: false }).eq('id', id)
    if (error) err(error.message)
  }

  // ── Mesas ─────────────────────────────────────────────────────────────────

  async getMesas(): Promise<Mesa[]> {
    const { data, error } = await sb().from('mesas').select('*').order('numero')
    if (error) err(error.message)
    return (data ?? []).map((m) => ({ id: m.id, numero: m.numero, estado: m.estado }))
  }

  // ── Órdenes ───────────────────────────────────────────────────────────────

  async getOrdenAbierta(mesaNumero: number): Promise<Orden | null> {
    const { data, error } = await sb()
      .from('ordenes')
      .select('*, orden_items(*), pagos(*)')
      .eq('mesa_numero', mesaNumero)
      .eq('estado', 'ABIERTA')
      .maybeSingle()
    if (error) err(error.message)
    return data ? mapOrden(data) : null
  }

  async agregarItem(mesaNumero: number, itemId: string, cantidad: number): Promise<Orden> {
    return this.agregarItems(mesaNumero, [{ itemId, cantidad }])
  }

  async agregarItems(mesaNumero: number, lineas: LineaPedido[]): Promise<Orden> {
    const validas = lineas.filter((l) => l.cantidad >= 1)
    if (validas.length === 0) err('No hay ítems por agregar')

    // 1. Obtener o crear la orden abierta.
    let { data: ordenRow, error: getErr } = await sb()
      .from('ordenes')
      .select('*, orden_items(*), pagos(*)')
      .eq('mesa_numero', mesaNumero)
      .eq('estado', 'ABIERTA')
      .maybeSingle()
    if (getErr) err(getErr.message)

    if (!ordenRow) {
      let mesaId: string | null = null
      if (mesaNumero > 0) {
        const { data: mesa } = await sb()
          .from('mesas').select('id').eq('numero', mesaNumero).single()
        mesaId = mesa?.id ?? null
        if (mesaId) {
          await sb().from('mesas').update({ estado: 'OCUPADA' }).eq('id', mesaId)
        }
      }
      const { data: nueva, error: newErr } = await sb()
        .from('ordenes')
        .insert({ mesa_numero: mesaNumero, mesa_id: mesaId, mozo: this.sesionCache?.usuario ?? null })
        .select('*, orden_items(*), pagos(*)')
        .single()
      if (newErr) err(newErr.message)
      ordenRow = nueva
    }

    // 2. Obtener snapshots de nombre/precio de los ítems solicitados.
    const { data: itemsData, error: itemsErr } = await sb()
      .from('items').select('id, nombre, precio').in('id', validas.map((l) => l.itemId))
    if (itemsErr) err(itemsErr.message)
    const itemsMap = new Map((itemsData ?? []).map((i) => [i.id, i]))
    const existentes: Row[] = ordenRow.orden_items ?? []

    // 3. Upsert de cada línea.
    for (const linea of validas) {
      const item = itemsMap.get(linea.itemId)
      if (!item) continue
      const existe = existentes.find((oi) => oi.item_id === linea.itemId)
      if (existe) {
        const nuevaCant = existe.cantidad + linea.cantidad
        await sb().from('orden_items').update({
          cantidad: nuevaCant,
          subtotal: nuevaCant * Number(item.precio),
        }).eq('id', existe.id)
      } else {
        await sb().from('orden_items').insert({
          orden_id: ordenRow.id,
          item_id: item.id,
          item_nombre: item.nombre,
          item_precio: Number(item.precio),
          cantidad: linea.cantidad,
          subtotal: Number(item.precio) * linea.cantidad,
        })
      }
    }

    // 4. Recalcular totales en la orden.
    return this._recalcularOrden(ordenRow.id)
  }

  async quitarItem(ordenItemId: string): Promise<Orden | null> {
    const { data: oi } = await sb()
      .from('orden_items').select('orden_id').eq('id', ordenItemId).single()
    if (!oi) return null

    await sb().from('orden_items').delete().eq('id', ordenItemId)

    const { data: restantes } = await sb()
      .from('orden_items').select('cantidad, subtotal').eq('orden_id', oi.orden_id)

    if (!restantes || restantes.length === 0) {
      const { data: o } = await sb()
        .from('ordenes').select('mesa_id').eq('id', oi.orden_id).single()
      await sb().from('ordenes').delete().eq('id', oi.orden_id)
      if (o?.mesa_id) await sb().from('mesas').update({ estado: 'VACIA' }).eq('id', o.mesa_id)
      return null
    }

    return this._recalcularOrden(oi.orden_id)
  }

  async setComensal(mesaNumero: number, nombre: string): Promise<Orden | null> {
    const { data: o } = await sb()
      .from('ordenes').select('id').eq('mesa_numero', mesaNumero).eq('estado', 'ABIERTA').maybeSingle()
    if (!o) return null
    const { error } = await sb()
      .from('ordenes').update({ comensal: nombre.trim() || null }).eq('id', o.id)
    if (error) err(error.message)
    return this._fetchOrden(o.id)
  }

  // Inserta un cobro sobre los ítems no pagados indicados, los marca y recalcula `pagado`.
  // Devuelve el monto cobrado.
  private async _registrarPago(
    ordenId: string,
    ordenItemIds: string[],
    tipoPago: TipoPago,
    parcial: boolean,
  ): Promise<number> {
    const { data: items } = await sb()
      .from('orden_items').select('id, subtotal, pagado').eq('orden_id', ordenId).in('id', ordenItemIds)
    const cubiertos = (items ?? []).filter((it) => !it.pagado)
    const monto = cubiertos.reduce((s, it) => s + Number(it.subtotal), 0)
    if (cubiertos.length === 0) return 0

    const ids = cubiertos.map((it) => it.id)
    await sb().from('orden_items').update({ pagado: true }).in('id', ids)
    await sb().from('pagos').insert({
      orden_id: ordenId,
      monto,
      tipo_pago: tipoPago,
      parcial,
      item_ids: ids,
      mozo: this.sesionCache?.usuario ?? null,
    })
    // Recalcular `pagado` agregado en la orden.
    const { data: pagos } = await sb().from('pagos').select('monto').eq('orden_id', ordenId)
    const pagado = (pagos ?? []).reduce((s, p) => s + Number(p.monto), 0)
    await sb().from('ordenes').update({ pagado }).eq('id', ordenId)
    return monto
  }

  async cobrarParcial(
    ordenId: string,
    ordenItemIds: string[],
    tipoPago: TipoPago,
  ): Promise<Orden> {
    const monto = await this._registrarPago(ordenId, ordenItemIds, tipoPago, true)
    if (monto <= 0) err('Esos ítems ya estaban cobrados')
    return this._fetchOrden(ordenId)
  }

  async finalizarOrden(ordenId: string, tipoPago: TipoPago): Promise<void> {
    const { data: o, error: getErr } = await sb()
      .from('ordenes').select('mesa_id, total').eq('id', ordenId).single()
    if (getErr || !o) err('Orden no encontrada')

    // Salda el resto pendiente (ítems no cobrados) con este tipo de pago.
    const { data: pendientes } = await sb()
      .from('orden_items').select('id').eq('orden_id', ordenId).eq('pagado', false)
    const idsPendientes = (pendientes ?? []).map((it) => it.id)
    if (idsPendientes.length > 0) {
      await this._registrarPago(ordenId, idsPendientes, tipoPago, false)
    }

    const { error } = await sb().from('ordenes').update({
      estado: 'CERRADA',
      tipo_pago: tipoPago,
      total_final: o.total,
      pagado: o.total,
      cerrado_en: new Date().toISOString(),
    }).eq('id', ordenId)
    if (error) err(error.message)
    if (o.mesa_id) {
      await sb().from('mesas').update({ estado: 'VACIA' }).eq('id', o.mesa_id)
    }
  }

  // ── Club DF (spec club-pos-enlace) ─────────────────────────────────────────

  async buscarClienteClub(whatsapp: string): Promise<ClienteClub | null> {
    const { data, error } = await sb().rpc('buscar_cliente_club', { p_whatsapp: whatsapp })
    if (error) err(error.message)
    const row = Array.isArray(data) ? data[0] : data
    if (!row) return null
    return { id: row.id, nombre: row.nombre, puntos: Number(row.puntos) }
  }

  async registrarClienteRapido(nombre: string, whatsapp: string): Promise<ClienteClub> {
    // Reusa registrar_cliente (bono 50 pts; upsert por WhatsApp — si ya existía, lo devuelve).
    const { data, error } = await sb().rpc('registrar_cliente', {
      p_nombre: nombre,
      p_whatsapp: whatsapp,
    })
    if (error) err(error.message)
    const row = Array.isArray(data) ? data[0] : data
    if (!row) err('No se pudo registrar al cliente')
    return { id: row.id, nombre: row.nombre, puntos: Number(row.puntos) }
  }

  async getPremios(): Promise<Premio[]> {
    const { data, error } = await sb()
      .from('premios')
      .select('id, nombre, costo_puntos')
      .eq('activo', true)
      .order('costo_puntos', { ascending: true })
    if (error) err(error.message)
    return (data ?? []).map((p) => ({
      id: p.id,
      nombre: p.nombre,
      costo_puntos: Number(p.costo_puntos),
    }))
  }

  async finalizarClub(
    ordenId: string,
    clienteId: string,
    premioId: string | null,
    mozo: string | null,
  ): Promise<ResultadoClub> {
    const { data, error } = await sb().rpc('finalizar_club', {
      p_orden_id: ordenId,
      p_cliente_id: clienteId,
      p_premio_id: premioId,
      p_mozo: mozo,
    })
    if (error) err(error.message)
    const row = Array.isArray(data) ? data[0] : data
    if (!row) err('El club no respondió')
    return {
      puntos_ganados: Number(row.puntos_ganados),
      puntos_canjeados: Number(row.puntos_canjeados),
      saldo: Number(row.saldo),
    }
  }

  async anularOrden(ordenId: string, motivo: string, claveAdmin: string): Promise<void> {
    const ok = await this.verificarClaveAdmin(claveAdmin)
    if (!ok) err('Clave de administrador incorrecta')
    const motivoLimpio = motivo.trim()
    if (!motivoLimpio) err('El motivo es obligatorio')

    const { data: o, error: getErr } = await sb()
      .from('ordenes').select('mesa_id, mesa_numero, total, pagado').eq('id', ordenId).single()
    if (getErr || !o) err('Orden no encontrada')

    const { error } = await sb().from('ordenes').update({
      estado: 'ANULADA',
      motivo_anulacion: motivoLimpio,
      cerrado_en: new Date().toISOString(),
    }).eq('id', ordenId)
    if (error) err(error.message)
    if (o.mesa_id) await sb().from('mesas').update({ estado: 'VACIA' }).eq('id', o.mesa_id)

    const origen = o.mesa_numero === 0 ? 'Barra' : `Mesa ${o.mesa_numero}`
    const yaCobrado = Number(o.pagado) > 0 ? ` · ya cobrado S/ ${Number(o.pagado).toFixed(2)}` : ''
    await this._auditar(
      'ANULAR_ORDEN',
      `${origen} · S/ ${Number(o.total).toFixed(2)}${yaCobrado} · motivo: ${motivoLimpio} · autorizado con clave admin`,
    )
  }

  async getOrdenesCerradas(): Promise<Orden[]> {
    const { data, error } = await sb()
      .from('ordenes')
      .select('*, orden_items(*), pagos(*)')
      .in('estado', ['CERRADA', 'PAGADA', 'ANULADA'])
      .order('cerrado_en', { ascending: false })
    if (error) err(error.message)
    return (data ?? []).map(mapOrden)
  }

  // Valida la clave del admin con un cliente Supabase efímero (no toca la sesión activa).
  async verificarClaveAdmin(clave: string): Promise<boolean> {
    const tmp = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, storageKey: 'rgs-verify' },
    })
    const { error } = await tmp.auth.signInWithPassword({
      email: 'admin@restobar-gs.local',
      password: clave,
    })
    await tmp.auth.signOut()
    return !error
  }

  private async _auditar(
    accion: RegistroAuditoria['accion'],
    detalle: string,
  ): Promise<void> {
    await sb().from('auditoria').insert({
      accion,
      usuario: this.sesionCache?.usuario ?? 'sistema',
      detalle,
    })
  }

  async getAuditoria(): Promise<RegistroAuditoria[]> {
    const { data, error } = await sb()
      .from('auditoria').select('*').order('creado_en', { ascending: false })
    if (error) err(error.message)
    return (data ?? []).map((r) => ({
      id: r.id,
      accion: r.accion,
      usuario: r.usuario,
      detalle: r.detalle,
      creado_en: r.creado_en,
    }))
  }

  async cerrarDia(claveAdmin: string): Promise<CierreDia> {
    const ok = await this.verificarClaveAdmin(claveAdmin)
    if (!ok) err('Clave de administrador incorrecta')
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

    const { data, error } = await sb()
      .from('ordenes')
      .select('id, total_final')
      .in('estado', ['CERRADA', 'PAGADA'])
      .eq('dia_cerrado', false)
      .gte('cerrado_en', startOfDay)
      .lt('cerrado_en', endOfDay)
    if (error) err(error.message)
    if (!data || data.length === 0) return { fecha: now.toISOString(), total: 0, conteo: 0 }

    const total = data.reduce((s, o) => s + Number(o.total_final ?? 0), 0)
    await sb().from('ordenes').update({ dia_cerrado: true }).in('id', data.map((o) => o.id))
    await this._auditar('CIERRE_DIA', `S/ ${total.toFixed(2)} · ${data.length} pedido(s)`)
    return { fecha: now.toISOString(), total, conteo: data.length }
  }

  // ── Realtime ──────────────────────────────────────────────────────────────

  subscribe(callback: () => void): () => void {
    this.ensureChannel()
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  // ── Privados ──────────────────────────────────────────────────────────────

  private async _recalcularOrden(ordenId: string): Promise<Orden> {
    const { data: items } = await sb()
      .from('orden_items').select('cantidad, subtotal').eq('orden_id', ordenId)
    const total = (items ?? []).reduce((s, oi) => s + Number(oi.subtotal), 0)
    const cantidad = (items ?? []).reduce((s, oi) => s + oi.cantidad, 0)
    const { error } = await sb().from('ordenes').update({ total, cantidad }).eq('id', ordenId)
    if (error) err(error.message)
    return this._fetchOrden(ordenId)
  }

  private async _fetchOrden(ordenId: string): Promise<Orden> {
    const { data, error } = await sb()
      .from('ordenes').select('*, orden_items(*), pagos(*)').eq('id', ordenId).single()
    if (error) err(error.message)
    return mapOrden(data)
  }
}

export function createSupabaseClient(): DataClient & { restoreSession(): Promise<Perfil | null> } {
  return new SupabaseDataClient()
}
