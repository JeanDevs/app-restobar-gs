import { useState } from 'react'
import Header from '../Shared/Header'
import EstadisticasPanel from './EstadisticasPanel'
import OrdenesTable from './OrdenesTable'
import MenuManager from './MenuManager'
import LogoutButton from './LogoutButton'
import CerrarDia from './CerrarDia'
import PanelPedidos from '../Mozo/PanelPedidos'

type Vista = 'resumen' | 'pedidos' | 'menu'

export default function AdminLayout() {
  const [vista, setVista] = useState<Vista>('resumen')

  const navBtn = (v: Vista) =>
    [
      'flex-1 rounded-lg px-3 py-2.5 text-center text-sm font-medium transition md:w-full md:flex-none md:text-left',
      vista === v ? 'bg-marca-500 text-white' : 'text-slate-600 hover:bg-slate-100',
    ].join(' ')

  return (
    <div className="min-h-screen">
      <Header titulo="Panel Admin" />

      <div className="mx-auto flex max-w-6xl flex-col gap-4 p-3 sm:p-4 md:flex-row">
        {/* Sidebar (tabs en móvil, columna en desktop) */}
        <aside className="card h-fit w-full shrink-0 p-3 md:w-48">
          <nav className="flex gap-2 md:flex-col">
            <button className={navBtn('resumen')} onClick={() => setVista('resumen')}>
              📊 Resumen
            </button>
            <button className={navBtn('pedidos')} onClick={() => setVista('pedidos')}>
              🍽️ Pedidos
            </button>
            <button className={navBtn('menu')} onClick={() => setVista('menu')}>
              📋 Menú
            </button>
            <div className="mt-2 hidden border-t border-slate-100 pt-2 md:block">
              <LogoutButton />
            </div>
          </nav>
        </aside>

        {/* Contenido */}
        <main className="min-w-0 flex-1 space-y-4">
          {vista === 'resumen' && (
            <>
              <EstadisticasPanel />
              <CerrarDia />
              <OrdenesTable />
            </>
          )}
          {vista === 'pedidos' && <PanelPedidos />}
          {vista === 'menu' && <MenuManager />}
        </main>
      </div>
    </div>
  )
}
