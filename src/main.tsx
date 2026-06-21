import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { db } from './services'
import { useStore } from './store/useStore'

function mount() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}

// Hidratar la sesión persistida antes de renderizar.
// - Mock: getSesion() lee de localStorage de forma síncrona.
// - Supabase: restoreSession() es async (valida el token guardado).
const sesionSync = db.getSesion()
if (sesionSync) {
  useStore.getState().setSesion(sesionSync)
  mount()
} else if (db.restoreSession) {
  db.restoreSession().then((perfil) => {
    if (perfil) useStore.getState().setSesion(perfil)
  }).finally(mount)
} else {
  mount()
}
