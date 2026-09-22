# Etapa 3: identidades y autorización

## Implementado

- El panel de Cuentas usa Supabase Auth y la Edge Function `admin-provision-user`; no usa credenciales ni `localStorage` para provisioning.
- Se pueden invitar perfiles `teacher`, `student`, `guardian` y los roles vigentes `parent`/`superadmin`.
- La respuesta y la tabla muestran invitación pendiente, cuenta activa o inactiva.
- El panel permite vincular un adulto responsable con un alumno mediante el RPC transaccional del servidor.
- La ruta `/privado/*` continúa protegida por sesión Supabase y perfil `superadmin` activo.

## Límites de esta vertical slice

La migración y el provisioning son reales, pero los portales docente, alumno y familia todavía no fueron migrados desde demo/localStorage. La confirmación del correo actualiza el estado de la invitación mediante un trigger server-side; todavía no existe el flujo completo de primer acceso de esos portales.

Quedan fuera: recuperación completa de cuenta, portales docente/alumno/familia, permisos UI avanzados, reportes y las etapas 4–8. Las áreas demo no relacionadas no se modificaron.

## Operación

Aplicar primero la migración `servidor/supabase/migrations/20260922090000_stage3_identity_authorization.sql`. El CLI/link de Supabase está bloqueado en este entorno, por lo que debe ejecutarse manualmente y luego reconciliar la ledger de migraciones cuando vuelva el acceso.
