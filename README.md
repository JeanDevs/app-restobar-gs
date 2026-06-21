# Restobar GS · Control de Mesas

POS web (laptop + navegador) para un restobar. El **mozo** registra consumo por mesa
y cierra con tipo de pago; el **admin** gestiona el menú y ve reportes en vivo.

## Estado

- **Fase 1 (actual):** app local navegable con **datos mock** (en memoria + `localStorage`).
  No requiere internet ni cuentas. Toda la UI funciona.
- **Fase 2 (siguiente):** swap del mock por **Supabase** (PostgreSQL + Auth + Realtime),
  repo en **GitHub** y deploy en **Vercel**. El esquema ya está listo en `supabase/`.

## Stack

React 18 · Vite · TypeScript · Tailwind CSS · Zustand · (Fase 2: Supabase · Vercel)

## Correr en local

```bash
npm install
npm run dev        # http://localhost:5173
```

### Credenciales de prueba (Fase 1)

| Rol   | Usuario | Contraseña |
|-------|---------|------------|
| Mozo  | `mozo1` | `mozo12`   |
| Admin | `admin` | `mood12`   |

## Arquitectura clave

La UI nunca habla directo con la base de datos: habla con el contrato
[`DataClient`](src/services/dataClient.ts). En Fase 1 lo implementa
[`mockClient`](src/services/mockClient.ts); en Fase 2 lo implementará un
`supabaseClient` con la **misma firma**. Cambiar de uno a otro es un swap en
[`src/services/index.ts`](src/services/index.ts) — **sin tocar componentes ni hooks**.

```
src/
├── components/  Auth · Mozo · Admin · Shared
├── hooks/       useAuth · useItems · useMesas · useOrdenes · useReportes
├── services/    dataClient (contrato) · mockClient (Fase 1) · seed
├── store/       Zustand (sesión, mesa activa, toasts)
├── pages/       Login · Mozo · Admin
└── types/       Item · Mesa · Orden · OrdenItem · Perfil
supabase/        schema.sql + seed.sql (listos para Fase 2)
```

## Decisiones de arquitectura

- **D-B** Auth: Supabase Auth con emails sintéticos (`mozo1@restobar-gs.local`, …).
- **D-C** Persistencia: la orden se guarda **al instante** (estado `ABIERTA`) → sobrevive a refresh + habilita realtime.
- **D-D** Menú: cada presentación es un ítem (ej. `Cerveza (1 und)`, `Cerveza (3 und)`).

> Moneda: **S/ (soles)**. 14 mesas. Pagos: Yape / Plan / Efectivo.
