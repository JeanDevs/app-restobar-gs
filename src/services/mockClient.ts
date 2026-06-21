import type { CierreDia, DataClient, LineaPedido, NuevoItem } from './dataClient'
import type {
  Item,
  Mesa,
  Orden,
  OrdenItem,
  Pago,
  Perfil,
  RegistroAuditoria,
  TipoPago,
} from '../types'
import { saldoPendiente } from '../types'
import { etiquetaMesa, soles } from '../lib/format'
import {
  CREDENCIALES_MOCK,
  ITEMS_SEED,
  MESAS_SEED,
  PERFILES_SEED,
} from './seed'

// ─────────────────────────────────────────────────────────────────────────────
// Implementación MOCK del DataClient (Fase 1).
//
// - Estado en memoria, persistido en localStorage → la orden ABIERTA sobrevive a
//   un refresh (igual que con Supabase). Emula la decisión D-C (persistencia
//   inmediata) y D-B (sesión guardada en el navegador).
// - Realtime emulado: un Set de listeners que se notifican en cada mutación, +
//   sincronización entre pestañas vía el evento 'storage'.
// ─────────────────────────────────────────────────────────────────────────────

// v2: agrega pagos[]/pagado/auditoria (cobro parcial + anular + auditoría, D-E/D-F/D-G).
const LS_KEY = 'restobar-gs:db:v2'
const LS_SESION = 'restobar-gs:sesion:v1'

interface DB {
  items: Item[]
  mesas: Mesa[]
  ordenes: Orden[]
  auditoria: RegistroAuditoria[]
}

function uid(prefix: string): string {
  const rnd =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)
  return `${prefix}-${rnd}`
}

function semilla(): DB {
  return {
    items: ITEMS_SEED.map((i) => ({ ...i })),
    mesas: MESAS_SEED.map((m) => ({ ...m })),
    ordenes: [],
    auditoria: [],
  }
}

function cargar(): DB {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw) as DB
  } catch {
    /* ignore */
  }
  const db = semilla()
  localStorage.setItem(LS_KEY, JSON.stringify(db))
  return db
}

function recalcular(orden: Orden): Orden {
  orden.cantidad = orden.items.reduce((s, it) => s + it.cantidad, 0)
  orden.total = orden.items.reduce((s, it) => s + it.subtotal, 0)
  orden.pagado = orden.pagos.reduce((s, p) => s + p.monto, 0)
  return orden
}

class MockClient implements DataClient {
  private db: DB = cargar()
  private listeners = new Set<() => void>()

  constructor() {
    // Sincroniza entre pestañas: si otra pestaña muta la BD, recargamos y avisamos.
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === LS_KEY) {
          this.db = cargar()
          this.emit()
        }
      })
    }
  }

  private persistir() {
    localStorage.setItem(LS_KEY, JSON.stringify(this.db))
  }

  private emit() {
    this.listeners.forEach((cb) => cb())
  }

  private commit() {
    this.persistir()
    this.emit()
  }

  // Simula la latencia de red para que la UI muestre estados de carga reales.
  private async tick<T>(value: T): Promise<T> {
    await new Promise((r) => setTimeout(r, 90))
    return value
  }

  // ── Auth ──
  async login(usuario: string, contrasena: string): Promise<Perfil> {
    await this.tick(null)
    const esperada = CREDENCIALES_MOCK[usuario]
    const perfil = PERFILES_SEED.find((p) => p.usuario === usuario)
    if (!esperada || esperada !== contrasena || !perfil) {
      throw new Error('Usuario o contraseña incorrectos')
    }
    localStorage.setItem(LS_SESION, JSON.stringify(perfil))
    return perfil
  }

  async logout(): Promise<void> {
    localStorage.removeItem(LS_SESION)
  }

  getSesion(): Perfil | null {
    try {
      const raw = localStorage.getItem(LS_SESION)
      return raw ? (JSON.parse(raw) as Perfil) : null
    } catch {
      return null
    }
  }

  // ── Items ──
  async getItems(): Promise<Item[]> {
    return this.tick(this.db.items.filter((i) => i.activo))
  }

  async createItem(data: NuevoItem): Promise<Item> {
    const nuevo: Item = {
      id: uid('item'),
      nombre: data.nombre,
      precio: data.precio,
      categoria: data.categoria,
      activo: true,
      creado_en: new Date().toISOString(),
    }
    this.db.items.push(nuevo)
    this.commit()
    return this.tick(nuevo)
  }

  async updateItem(id: string, data: Partial<NuevoItem>): Promise<Item> {
    const it = this.db.items.find((i) => i.id === id)
    if (!it) throw new Error('Ítem no encontrado')
    Object.assign(it, data)
    this.commit()
    return this.tick(it)
  }

  async deleteItem(id: string): Promise<void> {
    const it = this.db.items.find((i) => i.id === id)
    if (it) {
      it.activo = false // soft delete
      this.commit()
    }
    await this.tick(null)
  }

  // ── Mesas ──
  async getMesas(): Promise<Mesa[]> {
    return this.tick(this.db.mesas.slice().sort((a, b) => a.numero - b.numero))
  }

  private setMesaEstado(mesaNumero: number, estado: Mesa['estado']) {
    const mesa = this.db.mesas.find((m) => m.numero === mesaNumero)
    if (mesa) mesa.estado = estado
  }

  // ── Órdenes ──
  async getOrdenAbierta(mesaNumero: number): Promise<Orden | null> {
    const orden = this.db.ordenes.find(
      (o) => o.mesa_numero === mesaNumero && o.estado === 'ABIERTA',
    )
    return this.tick(orden ?? null)
  }

  private crearOrden(mesaNumero: number): Orden {
    const mesa = this.db.mesas.find((m) => m.numero === mesaNumero)
    const orden: Orden = {
      id: uid('orden'),
      mesa_numero: mesaNumero,
      mesa_id: mesa?.id ?? '',
      total: 0,
      cantidad: 0,
      tipo_pago: null,
      estado: 'ABIERTA',
      total_final: null,
      pagado: 0,
      mozo: this.getSesion()?.usuario ?? null,
      comensal: null,
      dia_cerrado: false,
      motivo_anulacion: null,
      creado_en: new Date().toISOString(),
      cerrado_en: null,
      items: [],
      pagos: [],
    }
    this.db.ordenes.push(orden)
    this.setMesaEstado(mesaNumero, 'OCUPADA')
    return orden
  }

  // Inserta o mergea UNA línea en la orden (sin commit ni tick).
  private aplicarLinea(orden: Orden, itemId: string, cantidad: number) {
    const item = this.db.items.find((i) => i.id === itemId)
    if (!item || cantidad < 1) return
    const existente = orden.items.find((oi) => oi.item_id === itemId)
    if (existente && !existente.pagado) {
      // Solo mergeamos en una línea NO pagada (una pagada queda intacta en su cobro).
      existente.cantidad += cantidad
      existente.subtotal = existente.cantidad * existente.item_precio
    } else {
      const oi: OrdenItem = {
        id: uid('oi'),
        orden_id: orden.id,
        item_id: item.id,
        item_nombre: item.nombre,
        item_precio: item.precio,
        cantidad,
        subtotal: item.precio * cantidad,
        pagado: false,
      }
      orden.items.push(oi)
    }
  }

  async agregarItem(mesaNumero: number, itemId: string, cantidad: number): Promise<Orden> {
    return this.agregarItems(mesaNumero, [{ itemId, cantidad }])
  }

  // Agrega varias líneas en una sola operación (un solo commit → un solo evento realtime).
  async agregarItems(mesaNumero: number, lineas: LineaPedido[]): Promise<Orden> {
    const validas = lineas.filter((l) => l.cantidad >= 1)
    if (validas.length === 0) throw new Error('No hay ítems por agregar')

    let orden = this.db.ordenes.find(
      (o) => o.mesa_numero === mesaNumero && o.estado === 'ABIERTA',
    )
    if (!orden) orden = this.crearOrden(mesaNumero)

    for (const l of validas) this.aplicarLinea(orden, l.itemId, l.cantidad)
    recalcular(orden)
    this.commit()
    return this.tick(orden)
  }

  async quitarItem(ordenItemId: string): Promise<Orden | null> {
    const orden = this.db.ordenes.find(
      (o) => o.estado === 'ABIERTA' && o.items.some((oi) => oi.id === ordenItemId),
    )
    if (!orden) return this.tick(null)

    // No se puede quitar un ítem ya cobrado (cobro parcial): el dinero ya entró.
    const objetivo = orden.items.find((oi) => oi.id === ordenItemId)
    if (objetivo?.pagado) throw new Error('No se puede quitar un ítem ya cobrado')

    orden.items = orden.items.filter((oi) => oi.id !== ordenItemId)
    recalcular(orden)

    // Si la orden queda vacía, se descarta y la mesa vuelve a VACIA.
    if (orden.items.length === 0) {
      this.db.ordenes = this.db.ordenes.filter((o) => o.id !== orden.id)
      this.setMesaEstado(orden.mesa_numero, 'VACIA')
      this.commit()
      return this.tick(null)
    }
    this.commit()
    return this.tick(orden)
  }

  async setComensal(mesaNumero: number, nombre: string): Promise<Orden | null> {
    const orden = this.db.ordenes.find(
      (o) => o.mesa_numero === mesaNumero && o.estado === 'ABIERTA',
    )
    if (!orden) return this.tick(null)
    orden.comensal = nombre.trim() || null
    this.commit()
    return this.tick(orden)
  }

  // Registra un cobro sobre los ítems indicados (los que aún no estén pagados) y los marca.
  // Devuelve el monto efectivamente cobrado. No hace commit (lo hace quien llama).
  private registrarPago(
    orden: Orden,
    ordenItemIds: string[],
    tipoPago: TipoPago,
    parcial: boolean,
  ): number {
    const cubiertos = orden.items.filter(
      (it) => ordenItemIds.includes(it.id) && !it.pagado,
    )
    const monto = cubiertos.reduce((s, it) => s + it.subtotal, 0)
    cubiertos.forEach((it) => {
      it.pagado = true
    })
    const pago: Pago = {
      id: uid('pago'),
      orden_id: orden.id,
      monto,
      tipo_pago: tipoPago,
      parcial,
      item_ids: cubiertos.map((it) => it.id),
      mozo: this.getSesion()?.usuario ?? null,
      creado_en: new Date().toISOString(),
    }
    orden.pagos.push(pago)
    return monto
  }

  async cobrarParcial(
    ordenId: string,
    ordenItemIds: string[],
    tipoPago: TipoPago,
  ): Promise<Orden> {
    const orden = this.db.ordenes.find((o) => o.id === ordenId && o.estado === 'ABIERTA')
    if (!orden) throw new Error('Orden no encontrada o ya cerrada')
    const monto = this.registrarPago(orden, ordenItemIds, tipoPago, true)
    if (monto <= 0) throw new Error('Esos ítems ya estaban cobrados')
    recalcular(orden)
    this.commit()
    return this.tick(orden)
  }

  async finalizarOrden(ordenId: string, tipoPago: TipoPago): Promise<void> {
    const orden = this.db.ordenes.find((o) => o.id === ordenId)
    if (!orden) throw new Error('Orden no encontrada')
    // Salda el resto pendiente (ítems aún no cobrados) con este tipo de pago.
    const pendientes = orden.items.filter((it) => !it.pagado).map((it) => it.id)
    if (pendientes.length > 0) this.registrarPago(orden, pendientes, tipoPago, false)
    orden.estado = 'CERRADA'
    orden.tipo_pago = tipoPago // pago del cierre (el detalle por tipo vive en orden.pagos)
    orden.total_final = orden.total
    orden.cerrado_en = new Date().toISOString()
    recalcular(orden) // pagado pasa a ser igual al total
    this.setMesaEstado(orden.mesa_numero, 'VACIA')
    this.commit()
    await this.tick(null)
  }

  async anularOrden(ordenId: string, motivo: string, claveAdmin: string): Promise<void> {
    if (!this.esClaveAdmin(claveAdmin)) throw new Error('Clave de administrador incorrecta')
    const orden = this.db.ordenes.find((o) => o.id === ordenId)
    if (!orden) throw new Error('Orden no encontrada')
    const motivoLimpio = motivo.trim()
    if (!motivoLimpio) throw new Error('El motivo es obligatorio')

    orden.estado = 'ANULADA'
    orden.motivo_anulacion = motivoLimpio
    orden.cerrado_en = new Date().toISOString()
    this.setMesaEstado(orden.mesa_numero, 'VACIA')

    const yaCobrado = orden.pagado > 0 ? ` · ya cobrado ${soles(orden.pagado)}` : ''
    this.registrarAuditoria(
      'ANULAR_ORDEN',
      `${etiquetaMesa(orden.mesa_numero)} · ${soles(orden.total)}${yaCobrado} · motivo: ${motivoLimpio} · autorizado con clave admin`,
    )
    this.commit()
    await this.tick(null)
  }

  async getOrdenesCerradas(): Promise<Orden[]> {
    // Incluye ANULADA para que el historial las muestre (los reportes las excluyen de ventas).
    const cerradas = this.db.ordenes
      .filter(
        (o) => o.estado === 'CERRADA' || o.estado === 'PAGADA' || o.estado === 'ANULADA',
      )
      .sort((a, b) => (b.cerrado_en ?? '').localeCompare(a.cerrado_en ?? ''))
    return this.tick(cerradas)
  }

  async cerrarDia(claveAdmin: string): Promise<CierreDia> {
    if (!this.esClaveAdmin(claveAdmin)) throw new Error('Clave de administrador incorrecta')
    const hoy = new Date().toDateString()
    const delDia = this.db.ordenes.filter(
      (o) =>
        (o.estado === 'CERRADA' || o.estado === 'PAGADA') &&
        !o.dia_cerrado &&
        o.cerrado_en &&
        new Date(o.cerrado_en).toDateString() === hoy,
    )
    const total = delDia.reduce((s, o) => s + (o.total_final ?? 0), 0)
    for (const o of delDia) o.dia_cerrado = true
    this.registrarAuditoria('CIERRE_DIA', `${soles(total)} · ${delDia.length} pedido(s)`)
    this.commit()
    await this.tick(null)
    return { fecha: new Date().toISOString(), total, conteo: delDia.length }
  }

  // ── Seguridad / auditoría (D-F, D-G) ──
  private esClaveAdmin(clave: string): boolean {
    const admin = PERFILES_SEED.find((p) => p.rol === 'ADMIN')
    return !!admin && CREDENCIALES_MOCK[admin.usuario] === clave
  }

  private registrarAuditoria(
    accion: RegistroAuditoria['accion'],
    detalle: string,
  ): void {
    this.db.auditoria.push({
      id: uid('aud'),
      accion,
      usuario: this.getSesion()?.usuario ?? 'sistema',
      detalle,
      creado_en: new Date().toISOString(),
    })
  }

  async verificarClaveAdmin(clave: string): Promise<boolean> {
    return this.tick(this.esClaveAdmin(clave))
  }

  async getAuditoria(): Promise<RegistroAuditoria[]> {
    const orden = this.db.auditoria
      .slice()
      .sort((a, b) => b.creado_en.localeCompare(a.creado_en))
    return this.tick(orden)
  }

  // ── Realtime ──
  subscribe(callback: () => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }
}

export function createMockClient(): DataClient {
  return new MockClient()
}
