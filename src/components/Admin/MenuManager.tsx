import { useState } from 'react'
import Modal from '../Shared/Modal'
import LoadingSpinner from '../Shared/LoadingSpinner'
import { useItems } from '../../hooks/useItems'
import { useStore } from '../../store/useStore'
import { soles } from '../../lib/format'
import type { Item } from '../../types'

const CATEGORIAS = ['Cervezas', 'Gaseosas', 'Aguas', 'Cigarros', 'Cócteles', 'Platos', 'Postres']

type Edicion = { id: string | null; nombre: string; precio: string; categoria: string }

const VACIO: Edicion = { id: null, nombre: '', precio: '', categoria: 'Cervezas' }

export default function MenuManager() {
  const { items, loading, createItem, updateItem, deleteItem } = useItems()
  const pushToast = useStore((s) => s.pushToast)
  const [edicion, setEdicion] = useState<Edicion | null>(null)
  const [porEliminar, setPorEliminar] = useState<Item | null>(null)
  const [busy, setBusy] = useState(false)

  function abrirNuevo() {
    setEdicion({ ...VACIO })
  }
  function abrirEditar(it: Item) {
    setEdicion({ id: it.id, nombre: it.nombre, precio: String(it.precio), categoria: it.categoria })
  }

  async function guardar() {
    if (!edicion) return
    const precio = Number(edicion.precio)
    if (!edicion.nombre.trim()) return pushToast('El nombre es obligatorio', 'error')
    if (!Number.isFinite(precio) || precio < 0) return pushToast('Precio inválido', 'error')

    setBusy(true)
    try {
      const data = { nombre: edicion.nombre.trim(), precio, categoria: edicion.categoria }
      if (edicion.id) {
        await updateItem(edicion.id, data)
        pushToast('Ítem actualizado', 'ok')
      } else {
        await createItem(data)
        pushToast('Ítem creado', 'ok')
      }
      setEdicion(null)
    } catch (e) {
      pushToast(e instanceof Error ? e.message : 'Error al guardar', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function confirmarEliminar() {
    if (!porEliminar) return
    setBusy(true)
    try {
      await deleteItem(porEliminar.id)
      pushToast(`Eliminado: ${porEliminar.nombre}`, 'info')
      setPorEliminar(null)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <LoadingSpinner texto="Cargando menú…" />

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-cacao-200 px-4 py-3">
        <h2 className="font-bold text-cacao-800">Gestionar menú</h2>
        <button className="btn-primary" onClick={abrirNuevo}>
          + Agregar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cacao-200 bg-cacao-50 text-left text-xs uppercase tracking-wide text-cacao-500">
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Categoría</th>
              <th className="px-4 py-2 text-right">Precio</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-cacao-100 last:border-b-0">
                <td className="px-4 py-2 font-medium text-cacao-800">{it.nombre}</td>
                <td className="px-4 py-2 text-cacao-500">{it.categoria}</td>
                <td className="px-4 py-2 text-right font-semibold">{soles(it.precio)}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    className="mr-2 text-cacao-500 hover:text-marca-600"
                    onClick={() => abrirEditar(it)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className="text-cacao-500 hover:text-red-600"
                    onClick={() => setPorEliminar(it)}
                    title="Eliminar"
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-cacao-400">
                  Sin ítems.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal crear / editar */}
      {edicion && (
        <Modal
          titulo={edicion.id ? 'Editar ítem' : 'Nuevo ítem'}
          onClose={() => setEdicion(null)}
        >
          <div className="space-y-3">
            <div>
              <label className="label">Nombre</label>
              <input
                className="input"
                autoFocus
                value={edicion.nombre}
                onChange={(e) => setEdicion({ ...edicion, nombre: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Categoría</label>
              <input
                className="input"
                list="categorias"
                value={edicion.categoria}
                onChange={(e) => setEdicion({ ...edicion, categoria: e.target.value })}
              />
              <datalist id="categorias">
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="label">Precio (S/)</label>
              <input
                type="number"
                min={0}
                step="0.5"
                className="input"
                value={edicion.precio}
                onChange={(e) => setEdicion({ ...edicion, precio: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button className="btn-ghost flex-1" onClick={() => setEdicion(null)}>
                Cancelar
              </button>
              <button className="btn-primary flex-1" onClick={guardar} disabled={busy}>
                {busy ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmación eliminar */}
      {porEliminar && (
        <Modal titulo="¿Eliminar ítem?" onClose={() => setPorEliminar(null)}>
          <p className="mb-5 text-sm text-cacao-600">
            Se ocultará <span className="font-semibold">{porEliminar.nombre}</span> del menú.
          </p>
          <div className="flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => setPorEliminar(null)}>
              Cancelar
            </button>
            <button className="btn-danger flex-1" onClick={confirmarEliminar} disabled={busy}>
              {busy ? 'Eliminando…' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
