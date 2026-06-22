import Modal from './Modal'
import { soles, fecha, hora, etiquetaMesa } from '../../lib/format'
import type { Orden } from '../../types'

interface DetalleOrdenModalProps {
  orden: Orden
  onClose: () => void
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-cacao-400">{label}</p>
      <p className="font-medium text-cacao-700">{valor}</p>
    </div>
  )
}

export default function DetalleOrdenModal({ orden, onClose }: DetalleOrdenModalProps) {
  const items = orden.items ?? []

  return (
    <Modal titulo={`Pedido · ${etiquetaMesa(orden.mesa_numero)}`} onClose={onClose}>
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-cacao-50 px-3 py-3">
        <Dato label="Fecha" valor={fecha(orden.cerrado_en)} />
        <Dato label="Hora" valor={hora(orden.cerrado_en)} />
        <Dato label="Tipo de pago" valor={orden.tipo_pago ?? '—'} />
        <Dato label="Mozo" valor={orden.mozo ?? '—'} />
        {orden.comensal && <Dato label="Comensal" valor={orden.comensal} />}
      </div>

      <p className="label">Detalle</p>
      <div className="mb-4 overflow-hidden rounded-lg border border-cacao-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-cacao-50 text-left text-xs uppercase tracking-wide text-cacao-500">
              <th className="px-3 py-2">Ítem</th>
              <th className="px-3 py-2 text-center">Cant.</th>
              <th className="px-3 py-2 text-right">Precio</th>
              <th className="px-3 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-t border-cacao-100">
                <td className="px-3 py-2 text-cacao-700">{it.item_nombre}</td>
                <td className="px-3 py-2 text-center text-cacao-500">{it.cantidad}</td>
                <td className="px-3 py-2 text-right text-cacao-500">{soles(it.item_precio)}</td>
                <td className="px-3 py-2 text-right font-medium">{soles(it.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-4 flex items-center justify-between border-t border-cacao-200 pt-3">
        <span className="text-sm font-medium text-cacao-500">Total</span>
        <span className="text-xl font-extrabold text-cacao-800">
          {soles(orden.total_final ?? orden.total)}
        </span>
      </div>

      <button className="btn-ghost w-full" onClick={onClose}>
        Cerrar
      </button>
    </Modal>
  )
}
