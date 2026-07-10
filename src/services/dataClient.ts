import type {
  Categoria,
  ClienteClub,
  ClienteClubDetalle,
  Item,
  Mesa,
  Orden,
  Perfil,
  Premio,
  RegistroAuditoria,
  ResultadoClub,
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

  // ── Club DF (opcionales: solo Supabase; el mock no los implementa y la UI
  //    oculta la sección Club cuando no están — cero impacto en el POS base) ──
  // Busca un cliente del club por WhatsApp; null si no está registrado.
  buscarClienteClub?(whatsapp: string): Promise<ClienteClub | null>
  // Registro rápido por el mozo (R3): crea el cliente con el bono de 50 pts.
  registrarClienteRapido?(nombre: string, whatsapp: string): Promise<ClienteClub>
  // Catálogo de premios activos (P2). Vacío ⇒ la UI oculta el canje.
  getPremios?(): Promise<Premio[]>
  // Tras cerrar la orden: vincula cliente + acumula ceil(total) pts + canje opcional.
  finalizarClub?(
    ordenId: string,
    clienteId: string,
    premioId: string | null,
    mozo: string | null,
  ): Promise<ResultadoClub>
  // Sección "Clientes Club DF" del POS (C5): lista/busca clientes con sus puntos.
  // Gateada por rol del staff en el servidor. Solo lectura.
  listarClientesClub?(busqueda: string): Promise<ClienteClubDetalle[]>
  // Resetea la clave de un cliente (pin → null); el cliente crea una nueva luego.
  resetearClaveCliente?(clienteId: string): Promise<void>

  // ── Realtime (emulado en mock, Supabase Realtime en Fase 2) ──
  subscribe(callback: () => void): () => void // devuelve función de desuscripción

  // ── Restauración de sesión (opcional) ──
  // Si se implementa, main.tsx la llama al arrancar para rehidratar la sesión
  // persistida por el proveedor (ej. Supabase guarda el token en localStorage).
  restoreSession?(): Promise<import('../types').Perfil | null>
}
