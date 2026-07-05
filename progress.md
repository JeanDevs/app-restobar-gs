# progress.md — app-restobar-gs (ciclos SDD cerrados)

> Un registro por ciclo de feature cerrado (regla Documentation First del HARNESS-SDD).
> El estado vivo del proyecto está en `context.md`.

## 2026-07-05 · Enlace Club DF ↔ POS (P1 + P2) — `specs/club-pos-enlace.md`

- **Qué:** clientes del Club DF vinculables a los pedidos por mesa; puntos por consumo
  (**1 sol = 1 punto, redondeo hacia arriba**); registro rápido por el mozo (bono 50 pts);
  canje de premios con descuento de puntos y registro en `canjes` (ítem 🎁 S/ 0.00 en la orden).
- **BD:** migraciones `club_pos_enlace` + `registrar_cliente_historicos` (100 % aditivas,
  backups `_backup_clientes_20260705` / `_backup_ordenes_20260705`). Conteos pre/post idénticos
  (20/25/42/3) — cero registros de cobros tocados (R7 cumplida).
- **Verificación:** smoke SQL (ceil ✓, canje ✓, guard anti-doble-acumulación ✓) + e2e en
  navegador contra BD real (registro rápido → cierre S/ 3.50 → +4 pts, canje −30, saldo 24,
  toasts correctos) + datos de prueba eliminados con el servicio real operando (4 mesas
  abiertas intactas). Build verde. Prod verificada por HTTP 200 y grep del bundle.
- **Deploy:** commit `74789bf` → `destinofinal.vercel.app` (dpl_EKm7Wekj READY).
- **Pendiente:** lista de premios de Jean (P2 inerte hasta sembrar `premios`); P3
  (buscar clientes desde POS + historial en `/club`) difierida.

## 2026-07-04 · Puertas públicas + Club DF — `specs/puertas-publicas-club.md`

- **Qué:** `app-restobar-gs` como puerta única de la marca **Destino Final**: `/` landing,
  `/carta` estática (rediseñada: logo, nav por categorías móvil/desktop, 4 categorías),
  `/club` (registro con bono 50 pts + tarjeta digital en localStorage), POS movido a `/app`.
- **BD:** tabla `clientes` + RPC `registrar_cliente` (SECURITY DEFINER, grant anon).
- **Deploy:** alias prod `destinofinal.vercel.app`; QR apunta a la raíz.
