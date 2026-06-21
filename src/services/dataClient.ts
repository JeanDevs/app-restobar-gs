import type {
  Categoria,
  Item,
  Mesa,
  Orden,
  Perfil,
  RegistroAuditoria,
  TipoPago,
} from '../types'

// ─────────────────────────────────────────────────────────────────────────────
// CONTRATO de la capa de datos.
//
// La UI nunca habla directo con el mock ni con Supabase: habla con esta interfaz.
// Fase 1 → implementación `mockClient` (en memoria + localStorage).
// Fase 2 → implementación `supabaseClient` con la MISMA firma. Cambiar de una a
//          otra es un swap en services/index.ts, sin tocar componentes ni hooks.
// ─────────────────────────────────────────────────────────────────────────────

export interface NuevoItem {
  nombre: string
  precio: number
  categoria: Categoria
}

// Una línea del "carrito" de selección múltiple antes de mandarla a la orden.
export interface LineaPedido {
  itemId: string
  cantidad: number
}

// Resultado de un cierre de día (corte de caja).
export interface CierreDia {
  fecha: string
  total: number
  conteo: number
}

export interface DataClient {
  // ── Auth ──
  login(usuario: string, contrasena: string): Promise<Perfil>
  logout(): Promise<void>
  getSesion(): Perfil | null

  // ── Items / menú ──
  getItems(): Promise<Item[]>
  createItem(data: NuevoItem): Promise<Item>
  updateItem(id: string, data: Partial<NuevoItem>): Promise<Item>
  deleteItem(id: string): Promise<void> // soft delete (activo = false)

  // ── Mesas ──
  getMesas(): Promise<Mesa[]>

  // ── Órdenes (núcleo) ──
  getOrdenAbierta(mesaNumero: number): Promise<Orden | null>
  agregarItem(mesaNumero: number, itemId: string, cantidad: number): Promise<Orden>
  // Agrega varias líneas a la vez (carrito de selección múltiple) en una sola operación.
  agregarItems(mesaNumero: number, lineas: LineaPedido[]): Promise<Orden>
  quitarItem(ordenItemId: string): Promise<Orden | null>
  // Asigna el nombre del comensal a la orden abierta de la mesa (si existe).
  setComensal(mesaNumero: number, nombre: string): Promise<Orden | null>
  // Cobro parcial (D-E): cobra ciertos ítems con un tipo de pago; la orden sigue ABIERTA
  // con saldo pendiente. Devuelve la orden actualizada.
  cobrarParcial(ordenId: string, ordenItemIds: string[], tipoPago: TipoPago): Promise<Orden>
  // Finaliza la orden: salda el resto pendiente con `tipoPago` y la cierra.
  finalizarOrden(ordenId: string, tipoPago: TipoPago): Promise<void>
  // Anula una orden con consumo (D-F): requiere la clave del admin + motivo. Marca
  // ANULADA, libera la mesa y deja registro de auditoría. Lanza si la clave es inválida.
  anularOrden(ordenId: string, motivo: string, claveAdmin: string): Promise<void>
  getOrdenesCerradas(): Promise<Orden[]>
  // Cierre de día (D-G): exige la clave del admin; marca las órdenes de hoy como
  // contabilizadas y deja registro de auditoría. Lanza si la clave es inválida.
  cerrarDia(claveAdmin: string): Promise<CierreDia>
  // Valida la clave del admin sin abrir sesión nueva (gates de UI: anular, cerrar día).
  verificarClaveAdmin(clave: string): Promise<boolean>
  // Registro de auditoría (solo admin), más reciente primero.
  getAuditoria(): Promise<RegistroAuditoria[]>

  // ── Realtime (emulado en mock, Supabase Realtime en Fase 2) ──
  subscribe(callback: () => void): () => void // devuelve función de desuscripción

  // ── Restauración de sesión (opcional) ──
  // Si se implementa, main.tsx la llama al arrancar para rehidratar la sesión
  // persistida por el proveedor (ej. Supabase guarda el token en localStorage).
  restoreSession?(): Promise<import('../types').Perfil | null>
}
