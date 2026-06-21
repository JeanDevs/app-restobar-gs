# Sistema de Control de Mesas - WEB 100% - CONTEXTO FINAL

## 📋 Descripción del Proyecto

**Goal:** App web única (laptop + navegador) donde:
- **Mozo:** Ingresa con login → Registra consumo por mesa (ítem, cantidad, tipo pago) → Finaliza
- **Admin (Jean):** Ingresa con login → Actualiza menú, ve reportes
- **BD:** Supabase (super simple, solo lo esencial)
- **Deploy:** Vercel + GitHub

---

## 🎯 Requisitos Funcionales (MINIMALISTA)

### Para MOZO
1. **Login:** usuario "mozo1" / contraseña "mozo12"
2. **Pantalla principal:**
   - Selector de mesa (1-14)
   - Búsqueda/select de ítem
   - Input cantidad
   - Botón "Agregar"
3. **Lista de consumo actual:**
   - Mostrar items agregados
   - Opción eliminar (❌)
4. **Finalizar pedido:**
   - Botón "Finalizar"
   - Modal: seleccionar tipo de pago (Yape / Plan / Efectivo)
   - Guardar en BD
   - Liberar mesa
5. **Logout**

### Para ADMIN (Jean)
1. **Login:** usuario "admin" / contraseña "mood12"
2. **Pantalla principal:**
   - Gestionar menú (items: crear, editar, eliminar, precio)
   - Ver órdenes pagadas (tabla: mesa, total, tipo pago, estado, fecha)
   - Ver estadísticas (total hoy, órdenes, promedio)
3. **Logout**

### Base de datos (SOLO LO ESENCIAL)

---

## 💾 Esquema de BD Simplificado (PostgreSQL Supabase)

### Tabla: `items`
```
id              UUID PRIMARY KEY
nombre          TEXT (Hamburguesa, Cerveza, etc)
precio          DECIMAL(10,2)
categoria       TEXT (Platos, Bebidas, Postres)
activo          BOOLEAN DEFAULT TRUE
creado_en       TIMESTAMP DEFAULT NOW()
```

### Tabla: `mesas`
```
id              UUID PRIMARY KEY
numero          INTEGER (1-14) UNIQUE
estado          TEXT DEFAULT 'VACIA' (VACIA, OCUPADA)
creado_en       TIMESTAMP DEFAULT NOW()
```

### Tabla: `ordenes` ⭐ (LA TABLA CLAVE)
```
id              UUID PRIMARY KEY
mesa_numero     INTEGER (1-14)
mesa_id         UUID FK → mesas.id
total           DECIMAL(10,2) (suma de items)
cantidad        INTEGER (cantidad de items agregados)
tipo_pago       TEXT (Yape / Plan / Efectivo) - NULL si abierta
estado          TEXT DEFAULT 'ABIERTA' (ABIERTA, CERRADA, PAGADA)
total_final     DECIMAL(10,2) (cuando se cierra/paga)
creado_en       TIMESTAMP DEFAULT NOW()
cerrado_en      TIMESTAMP (cuando mozo cierra)
```

### Tabla: `orden_items` (Detalle de orden)
```
id              UUID PRIMARY KEY
orden_id        UUID FK → ordenes.id
item_id         UUID FK → items.id
item_nombre     TEXT (snapshot: "Hamburguesa")
item_precio     DECIMAL(10,2) (snapshot: 15.00)
cantidad        INTEGER
subtotal        DECIMAL(10,2)
creado_en       TIMESTAMP DEFAULT NOW()
```

### Tabla: `usuarios`
```
id              UUID PRIMARY KEY
usuario         TEXT UNIQUE (mozo1, admin)
contraseña      TEXT (hash, encrypted)
rol             TEXT (MOZO, ADMIN)
activo          BOOLEAN DEFAULT TRUE
creado_en       TIMESTAMP DEFAULT NOW()
```

---

## 🔐 Autenticación Supabase Auth

**Usuarios precargados:**
```
Usuario:      mozo1
Contraseña:   mozo12
Rol:          MOZO

Usuario:      admin
Contraseña:   mood12
Rol:          ADMIN
```

**Flow:**
1. Mozo entra a https://mi-pos.vercel.app
2. Ve login (usuario/contraseña)
3. Ingresa "mozo1" / "mozo12"
4. Supabase valida → token JWT
5. Session guardada en navegador
6. Redirige a pantalla mozo

---

## 🛠️ Stack Final

```
Frontend:      React 18 + Vite + TypeScript + Tailwind CSS
Autenticación: Supabase Auth (email/password)
BD:            Supabase (PostgreSQL)
Hosting:       Vercel (free)
Versionamiento: GitHub
Estado:        Zustand (local) + Supabase Realtime (cloud)
```

---

## 🏗️ Arquitectura (Diagrama)

```
NAVEGADOR (Mozo o Admin en laptop)
           ↓ (HTTPS)
        Vercel (React app)
           ↓
      Supabase Auth (login)
           ↓
    Supabase PostgreSQL (BD)
           ↓
    ┌──────┴──────┐
    ↓             ↓
  items        órdenes
  
✅ Todo en HTTPS
✅ Datos centralizados (Supabase)
✅ Realtime updates (Supabase)
```

---

## 📁 Estructura Carpetas (React + Supabase)

```
mi-pos-web/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx          ← Formulario usuario/contraseña
│   │   │   └── ProtectedRoute.tsx     ← Validar sesión
│   │   │
│   │   ├── Mozo/
│   │   │   ├── MozoLayout.tsx         ← Layout principal
│   │   │   ├── MesaSelector.tsx       ← Select mesa 1-14
│   │   │   ├── ItemSearcher.tsx       ← Buscar + select item
│   │   │   ├── CantidadInput.tsx      ← Input cantidad
│   │   │   ├── OrdenActual.tsx        ← Lista items + eliminar
│   │   │   ├── FinalizarModal.tsx     ← Select tipo pago (Yape/Plan/Efectivo)
│   │   │   └── ConfirmacionModal.tsx  ← Double-confirm cerrar
│   │   │
│   │   ├── Admin/
│   │   │   ├── AdminLayout.tsx        ← Layout admin
│   │   │   ├── MenuManager.tsx        ← CRUD items (tabla)
│   │   │   ├── OrdenesTable.tsx       ← Todas órdenes (historial)
│   │   │   ├── EstadisticasPanel.tsx  ← Total hoy, órdenes, promedio
│   │   │   └── LogoutButton.tsx
│   │   │
│   │   └── Shared/
│   │       ├── Header.tsx             ← Logo, nombre usuario, logout
│   │       ├── Toast.tsx              ← Notificaciones
│   │       └── LoadingSpinner.tsx
│   │
│   ├── pages/
│   │   ├── LoginPage.tsx              ← Pantalla login (ambos)
│   │   ├── MozoPage.tsx               ← Pantalla mozo
│   │   └── AdminPage.tsx              ← Pantalla admin
│   │
│   ├── services/
│   │   ├── supabase.ts                ← Cliente + tipos
│   │   ├── auth.ts                    ← Login/logout
│   │   ├── items.ts                   ← CRUD items
│   │   ├── mesas.ts                   ← CRUD mesas
│   │   ├── ordenes.ts                 ← CRUD órdenes (LA PRINCIPAL)
│   │   └── orden_items.ts             ← CRUD orden_items
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                 ← Autenticación
│   │   ├── useMesas.ts                ← Mesas
│   │   ├── useItems.ts                ← Items
│   │   ├── useOrdenes.ts              ← Órdenes (realtime)
│   │   └── useReportes.ts             ← Cálculos
│   │
│   ├── store/
│   │   └── useStore.ts                ← Zustand (mesa actual, items en orden)
│   │
│   ├── types/
│   │   └── index.ts                   ← TypeScript (Item, Mesa, Orden, etc)
│   │
│   ├── App.tsx                        ← Router (login → mozo/admin)
│   ├── main.tsx
│   └── index.css                      ← Tailwind
│
├── .env.example
├── .env.local
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── package.json
└── README.md
```

---

## 🎨 INTERFAZ MOZO (Ultra-simple)

```
┌─────────────────────────────────────────┐
│  🍽️ MIS PEDIDOS          Mozo1 [Salir]  │
├─────────────────────────────────────────┤
│                                         │
│  Mesa:  [Select ▼ 1-14]                │
│         (o botones: 1 2 3 4...)        │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Buscar ítem: [Hamburgue...           │
│  [Sugerencias: Hamburguesa, etc]       │
│                                         │
│  Cantidad: [1 ▲▼]                      │
│  Precio:   $15.00 (read-only)          │
│                                         │
│  [AGREGAR] 🟢                           │
│                                         │
├─────────────────────────────────────────┤
│  ORDEN ACTUAL (Mesa 3) - 2 items       │
│                                         │
│  • Hamburguesa × 2  ........ $30.00 ❌ │
│  • Cerveza × 2      ........ $12.00 ❌ │
│                                         │
│  TOTAL: $42.00                          │
│                                         │
│  [FINALIZAR PEDIDO] 🔴                  │
│                                         │
└─────────────────────────────────────────┘
```

---

## 🎨 MODAL FINALIZAR (Mozo)

```
┌─────────────────────────────────┐
│  ¿FINALIZAR PEDIDO?             │
├─────────────────────────────────┤
│                                 │
│  Mesa: 3                        │
│  Total: $42.00                  │
│                                 │
│  Tipo de pago:                  │
│  ⭕ Yape                         │
│  ⭕ Plan                         │
│  ⭕ Efectivo                     │
│                                 │
│  [CONFIRMAR]  [CANCELAR]        │
│                                 │
└─────────────────────────────────┘
```

Después de confirmar → Modal de doble confirmación:

```
┌─────────────────────────────────┐
│  CONFIRMAR CIERRE               │
├─────────────────────────────────┤
│                                 │
│  ¿Está seguro?                  │
│  Mesa 3                         │
│  Total: $42.00                  │
│  Pago: Yape                     │
│                                 │
│  [SÍ, CERRAR]  [CANCELAR]       │
│                                 │
└─────────────────────────────────┘
```

---

## 🎨 INTERFAZ ADMIN (Jean - Laptop)

```
┌────────────────────────────────────────────────────────┐
│  🍽️ PANEL ADMIN                   Admin [Salir]       │
├────────────────┬──────────────────────────────────────┤
│                │                                      │
│  📋 MENÚ       │  ESTADÍSTICAS HOY                   │
│  📊 ÓRDENES    │                                      │
│  ⚙️ CONFIG     │  Total ingresos: $1,250.50          │
│                │  Órdenes: 24                        │
│                │  Promedio: $52.10                   │
│                │                                      │
│                │  Tipos de pago:                     │
│                │  • Yape: $750.00 (60%)              │
│                │  • Plan: $350.00 (28%)              │
│                │  • Efectivo: $150.50 (12%)          │
│                │                                      │
├────────────────┴──────────────────────────────────────┤
│  HISTORIAL ÓRDENES                                    │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Mesa | Total  | Cantidad | Pago    | Estado | Hora │
│  ─────┼────────┼──────────┼─────────┼────────┼──────│
│  3    | $42.00 | 2        | Yape    | CERRADA| 19:45│
│  7    | $78.50 | 4        | Plan    | CERRADA| 19:32│
│  12   | $15.00 | 1        | Efectivo| CERRADA| 19:20│
│  ...  | ...    | ...      | ...     | ...    | ...  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🎨 MENU MANAGER (Admin)

```
┌─────────────────────────────────────────────────┐
│  GESTIONAR MENÚ                 [Agregar nuevo]│
├─────────────────────────────────────────────────┤
│                                                 │
│  Items activos:                                │
│                                                 │
│  Nombre            | Categoría | Precio | Acc │
│  ───────────────────┼───────────┼────────┼─────│
│  Hamburguesa       | Platos    | $15.00 │ ✏️❌│
│  Cerveza           | Bebidas   | $6.00  │ ✏️❌│
│  Postre chocolate  | Postres   | $5.00  │ ✏️❌│
│  Papas fritas      | Acompañ.  | $3.50  │ ✏️❌│
│                                                 │
└─────────────────────────────────────────────────┘

Click ✏️ → Abre modal para editar
Click ❌ → Pregunta "¿Eliminar?" + confirma
Click [Agregar nuevo] → Form para crear
```

---

## 🔄 Flujo de Usuario (Mozo) - Ejemplo Real

```
1. MOZO ENTRA A LA WEB
   https://mi-pos.vercel.app
   → Ve formulario login

2. INGRESA CREDENCIALES
   Usuario: mozo1
   Contraseña: mozo12
   → Supabase valida
   → Redirige a pantalla mozo

3. CLIENTE LLEGA A MESA 3
   - Click/Select "Mesa 3"
   - Sistema marca: OCUPADA

4. CLIENTE PIDE COMIDA
   - Search: "H" → sugiere "Hamburguesa"
   - Click "Hamburguesa"
   - Cantidad: 2
   - [AGREGAR]
   → Suma $30 al total

5. CLIENTE PIDE MÁS
   - Search: "Cerv..."
   - Click "Cerveza"
   - Cantidad: 2
   - [AGREGAR]
   → Total ahora: $42

6. CLIENTE TERMINA DE COMER
   - [FINALIZAR PEDIDO]
   → Modal: "Mesa 3 - $42.00 - Tipo pago?"
   
7. SELECCIONA TIPO DE PAGO
   - Radio: selecciona "Yape"
   - [CONFIRMAR]
   
8. DOBLE CONFIRMACIÓN
   - Modal: "¿Está seguro? Mesa 3, $42, Yape"
   - [SÍ, CERRAR]
   
9. ORDEN GUARDADA EN BD
   - Estado: CERRADA
   - Tipo pago: Yape
   - Mesa: VACIA (lista para próximos clientes)
   
10. JEAN VE EN ADMIN
    - Tabla actualiza automático (realtime)
    - Nueva orden aparece
    - Total hoy aumenta en $42
```

---

## 📡 API Supabase (Queries necesarias)

### AUTENTICACIÓN
- **supabase.auth.signIn(usuario, contraseña)** → JWT token
- **supabase.auth.signOut()** → Logout
- **supabase.auth.getSession()** → Usuario actual + rol

### ITEMS
- **getItems()** → Todos los items activos (para búsqueda)
- **createItem(nombre, precio, categoría)** → Admin
- **updateItem(id, nombre, precio, categoría)** → Admin
- **deleteItem(id)** → Admin (marcar inactivo)

### MESAS
- **getMesas()** → Todas (1-14) con estado actual
- **updateMesaEstado(id, estado)** → VACIA, OCUPADA

### ÓRDENES (LA PRINCIPAL)
- **createOrden(mesa_numero)** → Nueva orden
- **getOrdenActual(mesa_numero)** → Orden abierta de esa mesa
- **agregarItemAOrden(orden_id, item_id, cantidad)** → Suma item
- **eliminarItemDeOrden(orden_item_id)** → Quita item
- **finalizarOrden(orden_id, tipo_pago)** → Cierra y guarda
- **getOrdenesHoy()** → Todas las órdenes de hoy (admin)

### REPORTES
- **getTotalHoy()** → Suma total de órdenes cerradas hoy
- **getOrdenesPorTipoPago()** → Desglose Yape/Plan/Efectivo
- **getOrdenesCerradas()** → Todas (para tabla admin)

---

## 🔐 Seguridad

**Para MVP:**
- Supabase Auth (email/password)
- Row Level Security (RLS) básico:
  - Mozo solo ve mesas (no edita items)
  - Admin ve todo

**Producción (Futuro):**
- Contraseñas hasheadas (Supabase maneja)
- Session tokens vencen en 1 hora
- Refresh tokens para re-auth automático

---

## 📊 Variables de Entorno (.env.local)

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

---

## 🚀 Setup Inicial (Step by step)

### 1. SUPABASE
- [ ] Crear proyecto en supabase.com
- [ ] Obtener URL + ANON_KEY
- [ ] Crear tablas (items, mesas, órdenes, orden_items, usuarios)
- [ ] Pre-cargar usuarios: mozo1/mozo12 (MOZO) y admin/mood12 (ADMIN)
- [ ] Habilitar Auth
- [ ] Habilitar Realtime en tablas: ordenes, orden_items

### 2. GITHUB
- [ ] Crear repo: mi-pos-web
- [ ] Clone local
- [ ] npm create vite... (React + TS)

### 3. DESARROLLO LOCAL
- [ ] npm install (dependencias)
- [ ] Instalar: @supabase/supabase-js, zustand, tailwindcss
- [ ] Crear estructura de carpetas
- [ ] Componentes Mozo
- [ ] Componentes Admin
- [ ] Integración Supabase

### 4. VERCEL
- [ ] Login en Vercel
- [ ] Import GitHub repo
- [ ] Agregar env vars (SUPABASE_URL, ANON_KEY)
- [ ] Deploy automático

### 5. ACCESO
- [ ] Mozo: https://mi-pos.vercel.app → usuario "mozo1" / "mozo12"
- [ ] Admin: https://mi-pos.vercel.app → usuario "admin" / "mood12"

---

## ⚡ Performance

- **Carga inicial:** <1s (React cached)
- **Login:** <500ms (Supabase auth)
- **Agregar item:** <200ms (Supabase insert)
- **Finalizar:** <300ms (Supabase + realtime)
- **Admin ve actualización:** <100ms (Realtime)

**Tamaño app:** ~50KB (súper ligero)

---

## 📈 Roadmap

### Fase 1: MVP (AHORA)
- [x] Login (mozo + admin)
- [x] Agregar consumo (items, cantidad)
- [x] Finalizar pedido (tipo pago)
- [x] Ver órdenes (admin)
- [x] CRUD menú (admin)
- [x] Deploy Vercel

### Fase 2 (Semana 2)
- [ ] Reportes avanzados (gráficos)
- [ ] Export a Excel
- [ ] Descuentos por mesa
- [ ] Foto de items

### Fase 3 (Futuro)
- [ ] App móvil (React Native)
- [ ] Múltiples locales
- [ ] Impresoras de ticket
- [ ] Caja registradora

---

## 🧪 Testing Checklist (Mozo)

- [ ] Login funciona
- [ ] Seleccionar mesa
- [ ] Buscar item
- [ ] Agregar item
- [ ] Cantidad se calcula bien
- [ ] Eliminar item de orden
- [ ] Finalizar pedido
- [ ] Select tipo pago
- [ ] Double-confirm
- [ ] Orden guardada
- [ ] Mesa vuelve a VACIA
- [ ] Logout

**Testing Checklist (Admin)**

- [ ] Login funciona
- [ ] Ver menú
- [ ] Crear item nuevo
- [ ] Editar precio
- [ ] Eliminar item
- [ ] Ver órdenes en tabla
- [ ] Estadísticas correctas
- [ ] Logout

---

## ✅ RESUMEN: BD FINAL (Super simple)

| Tabla | Campos Clave |
|-------|--------------|
| **items** | id, nombre, precio, categoría |
| **mesas** | id, numero (1-14) |
| **órdenes** | id, mesa_numero, total, cantidad, tipo_pago (Yape/Plan/Efectivo), estado, total_final |
| **orden_items** | id, orden_id, item_id, cantidad, subtotal |
| **usuarios** | id, usuario, contraseña, rol |

**Eso es TODO.**

---

## 📞 Contacto

**Propietario:** Jean (Agents Future AI)  
**Caso:** Control de mesas (restaurante/bar)  
**Usuarios:** 1 mozo + 1 admin (Jean)  
**Mesas:** 14  
**Tipo:** Web 100% (Vercel + Supabase)  
**Plazo:** ASAP  
**Presupuesto:** $0

---

**Última actualización:** 2024  
**Versión:** 3.0 - WEB 100% + LOGINS SIMPLES  
**Estado:** Especificación final - Listo para desarrollo
