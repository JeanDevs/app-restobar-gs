# Spec — reservas-google-calendar

**Estado:** borrador
**Proyecto:** app-restobar-gs (Destino Final)  ·  **Fase:** 3-development  ·  **Fecha:** 2026-07-09

## Objetivo (1 frase)

Que el mozo/admin registre reservas de mesa desde el POS (`/app`) y cada una se sincronice como
evento en el Google Calendar del negocio, visible junto al resto de la agenda sin salir de Calendar.

## Reglas (3–7 bullets)

- Solo staff autenticado (mozo/admin) crea, edita o cancela reservas — no hay formulario público.
- Datos mínimos por reserva: nombre del cliente, teléfono, fecha/hora, número de personas; mesa es opcional.
- Un único Google Calendar del negocio (cuenta compartida), no un calendario por mozo.
- Cada reserva creada/editada/cancelada en la app refleja el mismo cambio en Calendar (crear/actualizar/borrar evento).
- Google Calendar es **secundario, no bloqueante**: si la API falla, la reserva igual se guarda en Supabase.
- La reserva NO bloquea automáticamente la mesa física en el POS en este ciclo (ver Fuera de alcance).

## Ejemplos input → output

| # | Input / acción del usuario | Output / resultado esperado |
|---|---|---|
| 1 | Mozo crea reserva: "María López, 987654321, 12/07 20:00, 4 personas, mesa 6" | Se guarda en `reservas` (Supabase) y aparece evento "Reserva: María López (4 pax) · Mesa 6" en el Calendar del negocio |
| 2 | Admin cambia la hora de la reserva de María a 20:30 | El mismo evento en Calendar se actualiza (no se duplica) |
| 3 | Mozo cancela la reserva de María | El evento se elimina de Calendar; la reserva queda `estado='cancelada'` en la app (no se borra el registro) |
| 4 | Se cae la conexión a Google Calendar al crear una reserva | La reserva se guarda igual en Supabase con `sync_calendar=false`, para reintentar después |

## Edge cases

- **Reserva duplicada** (misma mesa, mismo horario): se permite pero se muestra advertencia visual — no se bloquea en este ciclo.
- **Token OAuth expirado/revocado:** la app reintenta refresh; si falla, la reserva se guarda con `sync_calendar=false` y se loguea el error (sin romper el flujo del mozo).
- **Evento borrado manualmente en Calendar** (por error humano): la app no debe fallar; en la próxima edición desde el POS se recrea el evento.
- **Reserva en el pasado:** el sistema no impide registrarla (útil para cargar historial), pero no genera recordatorio.

## Criterios de aceptación (verificables — contrato del Verifier)

- [ ] Crear una reserva desde el POS genera un evento en el Google Calendar del negocio con el formato de título acordado.
- [ ] Editar fecha/hora/personas de una reserva actualiza el mismo evento en Calendar (se verifica que el `event_id` no cambia).
- [ ] Cancelar una reserva elimina su evento en Calendar y dispara `estado='cancelada'` en Supabase.
- [ ] Si la llamada a la API de Calendar falla (simulado), la reserva se guarda igual en Supabase con `sync_calendar=false`.
- [ ] Solo usuarios con rol `mozo` o `admin` autenticados pueden ver/crear/editar/cancelar reservas (RLS verificado).
- [ ] Existe una pestaña "Reservas" en el POS que lista las reservas del día ordenadas por hora.

## Fuera de alcance

- Formulario público de reservas para clientes (tipo `/club`) — posible fase futura, spec aparte.
- Bloqueo automático del estado de la mesa física en el POS al crear una reserva.
- Calendario por mozo individual o soporte Outlook/Microsoft 365.
- Notificación automática al cliente (WhatsApp/SMS) al confirmar/cancelar — spec aparte si se prioriza.

## Modelo de datos

**Tabla `reservas` (Supabase, nueva, aditiva — no toca tablas existentes):**

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | `gen_random_uuid()` |
| `nombre_cliente` | text | obligatorio |
| `telefono` | text | obligatorio |
| `fecha_hora` | timestamptz | obligatorio |
| `personas` | int | obligatorio, > 0 |
| `mesa_numero` | int | nullable |
| `estado` | text | `'pendiente' \| 'confirmada' \| 'cancelada' \| 'completada'`, default `'pendiente'` |
| `notas` | text | nullable |
| `google_event_id` | text | nullable — id del evento en Calendar |
| `sync_calendar` | boolean | default `false`; `true` solo cuando el evento se creó/actualizó con éxito |
| `creado_por` | uuid | FK a `perfiles` |
| `created_at` | timestamptz | default `now()` |

**Interfaz TypeScript (`src/types/reserva.ts`):**

```ts
interface Reserva {
  id: string;
  nombreCliente: string;
  telefono: string;
  fechaHora: string; // ISO
  personas: number;
  mesaNumero?: number;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  notas?: string;
  googleEventId?: string;
  syncCalendar: boolean;
  creadoPor: string;
  createdAt: string;
}
```

**Archivo nuevo:** `src/services/googleCalendar.ts` — cliente que encapsula `events.insert` /
`events.update` / `events.delete` contra el Calendar del negocio (autenticación por definir en el
plan técnico: OAuth de cuenta de servicio vs. OAuth delegado — decisión de arquitectura, no de este spec).

## Planificación ordenada (ningún paso deja la app rota)

1. **Modelo de datos** — migración `reservas` + RLS (solo `mozo`/`admin`). Verificable: insert/select
   funciona desde el SQL Editor de Supabase; app sigue funcionando igual (nada roto).
2. **UI de reservas en el POS** — pestaña "Reservas": crear, listar, editar, cancelar — **sin** Calendar
   todavía (solo Supabase). Verificable: flujo completo de una reserva desde el POS.
3. **Conexión a Google Calendar** — credenciales del negocio + función que crea el evento al guardar
   una reserva. Verificable: reserva creada en el POS aparece en Calendar.
4. **Sincronía de edición/cancelación** — actualizar o borrar el evento correspondiente. Verificable:
   editar cambia el evento existente; cancelar lo elimina.
5. **Manejo de fallos** — reintentos + bandera `sync_calendar` para reservas no sincronizadas.
   Verificable: con la API caída (simulada), la reserva se guarda igual y queda marcada para reintento.

## Decisiones tomadas y descartadas

- **Tomada:** reservas gestionadas solo por staff desde el POS. **Descartada:** formulario público
  (estilo `/club`) — mayor alcance y validación anti-spam; se evalúa como spec futura si hay demanda.
- **Tomada:** un solo Google Calendar de negocio (cuenta compartida). **Descartada:** un calendario
  por mozo — fragmentaría la agenda y complicaría permisos.
- **Tomada:** Google Calendar. **Descartada:** Outlook/Microsoft 365 — Jean confirmó que ya usa Google.
- **Tomada:** Calendar como sistema secundario, no bloqueante (la reserva vive primero en Supabase).
  **Descartada:** usar Calendar como fuente de verdad — riesgo de perder reservas si el token expira
  o la API falla.
- **Tomada:** no vincular la reserva al estado físico de la mesa en este ciclo. **Descartada:**
  bloqueo automático de mesa — mayor complejidad (conflictos de horario, mesas compartidas); se deja
  para una iteración posterior una vez validado el flujo básico.

## Preguntas abiertas para Jean

- ¿La cuenta de Google Calendar del negocio ya existe (Gmail dedicado a Destino Final) o se crea una nueva?
- ¿Cuántas reservas por día se esperan hoy? (define si vale la pena priorizar el bloqueo de mesa física pronto)
- ¿Quieres que, en una fase futura, el cliente reciba confirmación por WhatsApp, o por ahora es solo uso interno del staff?
