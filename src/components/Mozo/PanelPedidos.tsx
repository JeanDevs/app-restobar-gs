import { useEffect, useState } from 'react'
import MesaSelector from './MesaSelector'
import ItemSearcher from './ItemSearcher'
import CantidadInput from './CantidadInput'
import OrdenActual from './OrdenActual'
import FinalizarModal from './FinalizarModal'
import ConfirmacionModal from './ConfirmacionModal'
import CollapsibleCard from '../Shared/CollapsibleCard'
import { useStore } from '../../store/useStore'
import { useOrdenes } from '../../hooks/useOrdenes'
import { soles, etiquetaMesa } from '../../lib/format'
import type { Item, TipoPago } from '../../types'

interface Linea {
  item: Item
  cantidad: number
}

// Panel de toma de pedidos. Lo usan el MOZO y el ADMIN (pestaña "Pedidos" y Barra).
export default function PanelPedidos() {
  const mesaActiva = useStore((s) => s.mesaActiva)
  const setMesaActiva = useStore((s) => s.setMesaActiva)
  const pushToast = useStore((s) => s.pushToast)
  const {
    orden,
    agregarItems,
    quitarItem,
    setComensal: guardarComensal,
    finalizarOrden,
  } = useOrdenes(mesaActiva)

  // "Carrito" de selección múltiple: se arma aquí y se manda a la orden de una vez.
  const [borrador, setBorrador] = useState<Linea[]>([])
  const [comensal, setComensal] = useState('')
  const [showFinalizar, setShowFinalizar] = useState(false)
  const [tipoPago, setTipoPago] = useState<TipoPago | null>(null)
  const [busy, setBusy] = useState(false)

  // Al cambiar de mesa, descartamos el borrador no confirmado.
  useEffect(() => {
    setBorrador([])
  }, [mesaActiva])

  // Sincroniza el nombre del comensal cuando carga/cambia la orden (no en cada refresh).
  useEffect(() => {
    setComensal(orden?.comensal ?? '')
  }, [orden?.id])

  function addBorrador(item: Item) {
    setBorrador((prev) => {
      const i = prev.findIndex((b) => b.item.id === item.id)
      if (i >= 0) {
        const copia = [...prev]
        copia[i] = { ...copia[i], cantidad: copia[i].cantidad + 1 }
        return copia
      }
      return [...prev, { item, cantidad: 1 }]
    })
  }

  function setBorradorCantidad(itemId: string, cantidad: number) {
    setBorrador((prev) =>
      prev.map((b) => (b.item.id === itemId ? { ...b, cantidad } : b)),
    )
  }

  function removeBorrador(itemId: string) {
    setBorrador((prev) => prev.filter((b) => b.item.id !== itemId))
  }

  const unidades = borrador.reduce((s, b) => s + b.cantidad, 0)
  const borradorTotal = borrador.reduce((s, b) => s + b.item.precio * b.cantidad, 0)
  const enLista = Object.fromEntries(borrador.map((b) => [b.item.id, b.cantidad]))

  async function commitBorrador() {
    if (borrador.length === 0) return
    const nombre = comensal.trim()
    try {
      await agregarItems(borrador.map((b) => ({ itemId: b.item.id, cantidad: b.cantidad })))
      if (nombre) await guardarComensal(nombre) // persiste el comensal recién tipeado
      pushToast(`Agregado: ${unidades} ítem(s)`, 'ok')
      setBorrador([])
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

  return (
    <>
      <MesaSelector />

      {mesaActiva == null ? (
        <div className="card p-8 text-center text-slate-400">
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
            {/* Módulo agregar (colapsable): botón ARRIBA (M-09), luego carrito y catálogo */}
            <CollapsibleCard
              titulo="Agregar ítem"
              derecha={
                unidades > 0 ? (
                  <span className="text-xs font-semibold text-marca-600">
                    {unidades} por agregar
                  </span>
                ) : undefined
              }
            >
              <div className="space-y-4">
                {/* Botón Agregar en la parte superior */}
                <button
                  className="btn-success w-full"
                  disabled={borrador.length === 0}
                  onClick={commitBorrador}
                >
                  {borrador.length === 0
                    ? 'Agregar'
                    : `Agregar ${unidades} ítem(s) · ${soles(borradorTotal)}`}
                </button>

                {borrador.length > 0 && (
                  <div className="rounded-lg border border-marca-200 bg-marca-50/50 p-3">
                    <p className="mb-2 text-sm font-semibold text-slate-600">
                      Por agregar ({borrador.length})
                    </p>
                    <div className="divide-y divide-marca-100">
                      {borrador.map((b) => (
                        <div key={b.item.id} className="flex items-center gap-2 py-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {b.item.nombre}
                            </p>
                            <p className="text-xs text-slate-400">
                              {soles(b.item.precio)} c/u
                            </p>
                          </div>
                          <CantidadInput
                            value={b.cantidad}
                            onChange={(n) => setBorradorCantidad(b.item.id, n)}
                          />
                          <span className="w-16 text-right text-sm font-semibold text-slate-700">
                            {soles(b.item.precio * b.cantidad)}
                          </span>
                          <button
                            onClick={() => removeBorrador(b.item.id)}
                            className="text-red-500 hover:text-red-700"
                            aria-label={`Quitar ${b.item.nombre}`}
                            title="Quitar"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <ItemSearcher onAdd={addBorrador} enLista={enLista} />
              </div>
            </CollapsibleCard>

            {/* Orden actual (colapsable) */}
            <OrdenActual
              orden={orden}
              mesaNumero={mesaActiva}
              onQuitar={handleQuitar}
              onGuardar={handleGuardar}
              onFinalizar={() => setShowFinalizar(true)}
            />
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

      {/* Modal 2: doble confirmación */}
      {showFinalizar && orden && tipoPago && (
        <ConfirmacionModal
          mesaNumero={orden.mesa_numero}
          total={orden.total}
          tipoPago={tipoPago}
          busy={busy}
          onConfirm={handleCierre}
          onCancel={() => setTipoPago(null)}
        />
      )}
    </>
  )
}
