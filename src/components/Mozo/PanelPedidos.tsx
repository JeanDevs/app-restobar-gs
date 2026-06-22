import { useEffect, useState } from 'react'
import MesaSelector from './MesaSelector'
import OrdenActual from './OrdenActual'
import AgregarItemPanel from './AgregarItemPanel'
import FinalizarModal from './FinalizarModal'
import ConfirmacionModal from './ConfirmacionModal'
import CobroParcialModal from './CobroParcialModal'
import AnularModal from './AnularModal'
import { useStore } from '../../store/useStore'
import { useOrdenes } from '../../hooks/useOrdenes'
import { useBorrador } from '../../hooks/useBorrador'
import { soles, etiquetaMesa } from '../../lib/format'
import { saldoPendiente } from '../../types'
import type { TipoPago } from '../../types'

// Panel de toma de pedidos. Lo usan el MOZO y el ADMIN (pestaña "Pedidos" y Barra).
export default function PanelPedidos() {
  const mesaActiva = useStore((s) => s.mesaActiva)
  const setMesaActiva = useStore((s) => s.setMesaActiva)
  const pushToast = useStore((s) => s.pushToast)
  const sesion = useStore((s) => s.sesion)
  const {
    orden,
    agregarItems,
    quitarItem,
    setComensal: guardarComensal,
    finalizarOrden,
    cobrarParcial,
    anular,
  } = useOrdenes(mesaActiva)

  // "Carrito" de selección múltiple: estado aislado en useBorrador (se resetea al
  // cambiar de mesa) y se manda a la orden de una vez en commitBorrador.
  const borrador = useBorrador(mesaActiva)

  const [comensal, setComensal] = useState('')
  const [showFinalizar, setShowFinalizar] = useState(false)
  const [tipoPago, setTipoPago] = useState<TipoPago | null>(null)
  const [busy, setBusy] = useState(false)
  const [showCobroParcial, setShowCobroParcial] = useState(false)
  const [showAnular, setShowAnular] = useState(false)
  const [anulando, setAnulando] = useState(false)

  // M-04 (light): un MOZO no opera la caja de una mesa tomada por otro mozo.
  // El ADMIN nunca se bloquea. Agregar ítems sí se permite.
  const bloqueado =
    sesion?.rol === 'MOZO' && !!orden?.mozo && orden.mozo !== sesion.usuario

  // Sincroniza el nombre del comensal cuando carga/cambia la orden (no en cada refresh).
  useEffect(() => {
    setComensal(orden?.comensal ?? '')
  }, [orden?.id])

  async function commitBorrador() {
    if (borrador.borrador.length === 0) return
    const nombre = comensal.trim()
    try {
      await agregarItems(
        borrador.borrador.map((b) => ({ itemId: b.item.id, cantidad: b.cantidad })),
      )
      if (nombre) await guardarComensal(nombre) // persiste el comensal recién tipeado
      pushToast(`Agregado: ${borrador.unidades} ítem(s)`, 'ok')
      borrador.reset()
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'No se pudo agregar', 'error')
    }
  }

  function persistComensal() {
    if (orden) guardarComensal(comensal) // solo si ya existe orden; si no, va en el commit
  }

  async function handleQuitar(ordenItemId: string) {
    await quitarItem(ordenItemId)
    pushToast('Ítem quitado', 'info')
  }

  function handleGuardar() {
    if (mesaActiva != null) pushToast(`Pedido (${etiquetaMesa(mesaActiva)}) guardado`, 'ok')
    setMesaActiva(null)
  }

  async function handleCierre() {
    if (!orden || !tipoPago) return
    setBusy(true)
    try {
      await finalizarOrden(orden.id, tipoPago)
      pushToast(`${etiquetaMesa(orden.mesa_numero)} cerrada · ${tipoPago}`, 'ok')
      setShowFinalizar(false)
      setTipoPago(null)
      setMesaActiva(null)
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'No se pudo cerrar', 'error')
    } finally {
      setBusy(false)
    }
  }

  // T3: cobro parcial. Cobra los ítems seleccionados; la orden sigue abierta.
  async function handleCobroParcial(ids: string[], tipo: TipoPago) {
    try {
      const actualizada = await cobrarParcial(ids, tipo)
      const monto = actualizada ? actualizada.pagado - (orden?.pagado ?? 0) : 0
      pushToast(`Cobrado: ${soles(monto)}`, 'ok')
      setShowCobroParcial(false)
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'No se pudo cobrar', 'error')
    }
  }

  // T5: anular mesa. En error (clave incorrecta) se deja el modal abierto.
  async function handleAnular(motivo: string, clave: string) {
    setAnulando(true)
    try {
      await anular(motivo, clave)
      pushToast('Mesa anulada', 'ok')
      setShowAnular(false)
      setMesaActiva(null)
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'No se pudo anular', 'error')
    } finally {
      setAnulando(false)
    }
  }

  return (
    <>
      <MesaSelector />

      {mesaActiva == null ? (
        <div className="card p-8 text-center text-cacao-400">
          Selecciona una mesa para empezar.
        </div>
      ) : (
        <>
          {/* Comensal (M-08) */}
          <div className="card p-3">
            <label className="label" htmlFor="comensal">
              Comensal en {etiquetaMesa(mesaActiva)} (opcional)
            </label>
            <input
              id="comensal"
              className="input"
              placeholder="Nombre o apodo corto…"
              value={comensal}
              onChange={(e) => setComensal(e.target.value)}
              onBlur={persistComensal}
            />
          </div>

          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
            {/* M-10: en móvil el módulo Agregar va DEBAJO de "Orden actual"
                (order-last); en desktop, columna izquierda. */}
            <div className="order-last min-w-0 md:order-none">
              <AgregarItemPanel
                borrador={borrador.borrador}
                unidades={borrador.unidades}
                total={borrador.total}
                enLista={borrador.enLista}
                onAddItem={borrador.addBorrador}
                onSetCantidad={borrador.setBorradorCantidad}
                onRemove={borrador.removeBorrador}
                onCommit={commitBorrador}
              />
            </div>

            {/* Orden actual. M-10: en móvil va ARRIBA (order-first). */}
            <div className="order-first min-w-0 md:order-none">
              <OrdenActual
                orden={orden}
                mesaNumero={mesaActiva}
                onQuitar={handleQuitar}
                onGuardar={handleGuardar}
                onFinalizar={() => setShowFinalizar(true)}
                onCobroParcial={() => setShowCobroParcial(true)}
                onAnular={() => setShowAnular(true)}
                bloqueado={bloqueado}
                mozoDueno={orden?.mozo}
              />
            </div>
          </div>
        </>
      )}

      {/* Modal 1: tipo de pago */}
      {showFinalizar && orden && !tipoPago && (
        <FinalizarModal
          orden={orden}
          onConfirmTipo={(t) => setTipoPago(t)}
          onCancel={() => setShowFinalizar(false)}
        />
      )}

      {/* Modal 2: doble confirmación. Con cobros parciales muestra el SALDO (T4). */}
      {showFinalizar && orden && tipoPago && (
        <ConfirmacionModal
          mesaNumero={orden.mesa_numero}
          total={orden.pagado > 0 ? saldoPendiente(orden) : orden.total}
          hayCobros={orden.pagado > 0}
          tipoPago={tipoPago}
          busy={busy}
          onConfirm={handleCierre}
          onCancel={() => setTipoPago(null)}
        />
      )}

      {/* Cobro parcial (D-E) */}
      {showCobroParcial && orden && (
        <CobroParcialModal
          orden={orden}
          onConfirm={handleCobroParcial}
          onCancel={() => setShowCobroParcial(false)}
        />
      )}

      {/* Anular mesa (D-F) */}
      {showAnular && orden && (
        <AnularModal
          orden={orden}
          busy={anulando}
          onConfirm={handleAnular}
          onCancel={() => setShowAnular(false)}
        />
      )}
    </>
  )
}
