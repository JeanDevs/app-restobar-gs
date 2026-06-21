import { create } from 'zustand'
import type { Perfil } from '../types'

export interface Toast {
  id: string
  mensaje: string
  tipo: 'ok' | 'error' | 'info'
}

interface AppState {
  // Sesión
  sesion: Perfil | null
  setSesion: (p: Perfil | null) => void

  // Mesa activa (UI del mozo)
  mesaActiva: number | null
  setMesaActiva: (n: number | null) => void

  // Toasts
  toasts: Toast[]
  pushToast: (mensaje: string, tipo?: Toast['tipo']) => void
  removeToast: (id: string) => void
}

export const useStore = create<AppState>((set) => ({
  sesion: null,
  setSesion: (p) => set({ sesion: p }),

  mesaActiva: null,
  setMesaActiva: (n) => set({ mesaActiva: n }),

  toasts: [],
  pushToast: (mensaje, tipo = 'info') =>
    set((s) => ({
      toasts: [
        ...s.toasts,
        { id: Math.random().toString(36).slice(2), mensaje, tipo },
      ],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
