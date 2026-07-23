import { useState } from 'react'
import Header from '../Shared/Header'
import EstadisticasPanel from './EstadisticasPanel'
import OrdenesTable from './OrdenesTable'
import MenuManager from './MenuManager'
import LogoutButton from './LogoutButton'
import CerrarDia from './CerrarDia'
import AuditoriaPanel from './AuditoriaPanel'
import ClientesClubPanel from './ClientesClubPanel'
import PanelPedidos from '../Mozo/PanelPedidos'

type Vista = 'resumen' | 'pedidos' | 'menu' | 'clientes' | 'auditoria'

export default function AdminLayout() {
  const [vista, setVista] = useState<Vista>('resumen')

  const navBtn = (v: Vista) =>
    [
      'rounded-lg px-3 py-2.5 text-center text-sm font-medium transition md:w-full md:text-left',
      vista === v ? 'bg-marca-500 text-white' : 'text-cacao-600 hover:bg-cacao-100',
    ].join(' ')

  return (
    <div className="min-h-screen">
      <Header titulo="Panel Admin" />

      <div className="mx-auto flex max-w-6xl flex-col gap-4 p-3 sm:p-4 md:flex-row">
        {/* Sidebar (tabs en móvil, columna en desktop) */}
        <aside className="card h-fit w-full shrink-0 p-3 md:w-48">
          {/* flex-wrap: en móvil las pestañas se acomodan en varias filas si no
              caben todas en el ancho de pantalla (nunca se desbordan de la
              tarjeta). En desktop vuelven a ser una columna vertical. */}
          <nav className="flex flex-wrap gap-2 md:flex-col md:flex-nowrap">
            <button className={navBtn('resumen')} onClick={() => setVista('resumen')}>
              📊 Resumen
            </button>
            <button className={navBtn('pedidos')} onClick={() => setVista('pedidos')}>
              🍽️ Pedidos
            </button>
            <button className={navBtn('menu')} onClick={() => setVista('menu')}>
              📋 Menú
            </button>
            <button className={navBtn('clientes')} onClick={() => setVista('clientes')}>
              ⭐ Clientes
            </button>
            <button className={navBtn('auditoria')} onClick={() => setVista('auditoria')}>
              🔒 Auditoría
            </button>
            <div className="mt-2 hidden border-t border-cacao-100 pt-2 md:block">
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
          {vista === 'clientes' && <ClientesClubPanel />}
          {vista === 'auditoria' && <AuditoriaPanel />}
        </main>
      </div>
    </div>
  )
}
