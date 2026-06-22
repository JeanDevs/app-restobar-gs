import { useState } from 'react'
import Header from '../Shared/Header'
import PanelPedidos from './PanelPedidos'
import HistorialDia from './HistorialDia'

type Vista = 'pedidos' | 'historial'

export default function MozoLayout() {
  const [vista, setVista] = useState<Vista>('pedidos')

  const tab = (v: Vista) =>
    [
      'flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-semibold transition',
      vista === v ? 'bg-marca-500 text-white shadow' : 'text-cacao-600 hover:bg-cacao-200',
    ].join(' ')

  return (
    <div className="min-h-screen">
      <Header titulo="Mis Pedidos" />
      <main className="mx-auto max-w-4xl space-y-4 p-3 sm:p-4">
        {/* Conmutador de vista */}
        <div className="flex gap-1 rounded-xl bg-cacao-200/60 p-1">
          <button className={tab('pedidos')} onClick={() => setVista('pedidos')}>
            🍽️ Pedidos
          </button>
          <button className={tab('historial')} onClick={() => setVista('historial')}>
            📋 Historial del día
          </button>
        </div>

        {vista === 'pedidos' ? <PanelPedidos /> : <HistorialDia />}
      </main>
    </div>
  )
}
