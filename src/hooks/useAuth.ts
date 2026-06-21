import { useStore } from '../store/useStore'
import { db } from '../services'

export function useAuth() {
  const sesion = useStore((s) => s.sesion)
  const setSesion = useStore((s) => s.setSesion)
  const setMesaActiva = useStore((s) => s.setMesaActiva)

  async function login(usuario: string, contrasena: string) {
    const perfil = await db.login(usuario.trim(), contrasena)
    setSesion(perfil)
    return perfil
  }

  async function logout() {
    await db.logout()
    setSesion(null)
    setMesaActiva(null)
  }

  return { sesion, login, logout }
}
