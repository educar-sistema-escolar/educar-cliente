# Despliegue y operación

## Separar cliente y servidor

Publicar el frontend no aplica SQL ni despliega Edge Functions. Coordinar una versión compatible del [backend](https://github.com/educar-sistema-escolar/educar-servidor), sus políticas y sus datos antes de habilitar flujos.

## Publicar el frontend

1. Revisar el diff y ejecutar las [comprobaciones pertinentes](pruebas.md).
2. Configurar las variables públicas de [instalación](instalacion.md) con el proyecto Supabase de destino explícito.
3. Instalar con `npm ci`, compilar con `npm run build` y publicar `dist/` mediante HTTPS.
4. Configurar una regla SPA: las rutas internas deben devolver `index.html` sin cambiar la URL.
5. Verificar el sitio publicado, no solo el build local.

En Vercel, [`vercel.json`](../vercel.json) contiene la reescritura SPA. No define por sí mismo proyecto remoto, dominio, variables, rama de producción ni pipeline de pruebas. Revisar esos ajustes en el servicio; un push exitoso no acredita un despliegue exitoso.

`npm run build:demo` genera `dist-demo/` con modo `demo`. Ese modo **no oculta credenciales DEMO en producción normal**: las tarjetas publican los valores configurados en ambos casos. `demo-restringida.md` describe una estrategia histórica, no una garantía actual de restricción.

## Lista previa a producción

- [ ] Variables del proyecto correcto, sin secretos de servidor en `VITE_*`.
- [ ] Exposición de cuentas DEMO decidida expresamente; solo datos ficticios.
- [ ] Acceso directo y recarga de `/alumnos`, `/docentes`, `/familias` y rutas administrativas.
- [ ] Invitaciones y recuperación con dominio/redirecciones autorizados.
- [ ] Cada rol limitado a su portal; estados de cuenta inactiva y vínculo ausente comprobados.
- [ ] Notas, horarios y servicios propios; salir/cambiar de cuenta limpia los datos previos.
- [ ] Solicitudes y cambios administrativos/docentes probados en un entorno autorizado, incluidos permisos del servidor.
- [ ] Chat de solo lectura, navegación, errores y controles accesibles comprobados.

## Migraciones y funciones de servidor

Comparar primero el historial **real** del entorno con la rama elegida, revisar dependencias y disponer de respaldo/recuperación. No usar reinicios ni aplicaciones masivas como reparación automática.

El `main` servidor revisado contiene dos archivos con prefijo `20261026190000` (restricción de solicitudes y gestión de notas docentes). Conciliar esa colisión y el historial remoto antes de ejecutar herramientas basadas en versiones. Esta guía no corrige ni marca migraciones como aplicadas.

| Función | Configuración privada y operación |
|---|---|
| `admin-provision-user` | Valida al administrador; requiere configuración Supabase y `SUPABASE_SERVICE_ROLE_KEY` solo en servidor |
| `billing-reminders` | Requiere `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `BILLING_CRON_SECRET`, `RESEND_API_KEY`, `BILLING_FROM_EMAIL`; revisar disparador, proveedor y cola antes de habilitar envíos |

La presencia de código/secretos no demuestra que una función, tarea programada o proveedor esté activo. Revisar los documentos operativos del servidor y el entorno de destino. No probar correos masivos con destinatarios reales durante una instalación de desarrollo.

## Diagnóstico y recuperación

| Problema | Primera acción segura |
|---|---|
| Compilación falla | Revisar Node, instalación reproducible y primer error de tipos/build |
| 404 al recargar | Comprobar regla SPA y directorio publicado |
| Acceso rechazado | Auth, perfil/estado/rol y vínculo, sin desactivar RLS |
| Sin datos | Distinguir ausencia, falta de vínculo y fallo de consulta |
| Cambios no visibles entre navegadores | Comprobar almacenamiento local: noticias/opiniones/comentarios aún lo usan |
| Correo no recibido | Distinguir `mailto:` del envío de servidor y revisar proveedor cuando corresponda |

Si el problema es exclusivo del cliente, republicar una versión validada o revertir mediante un commit revisado. Revertir frontend no revierte datos ni migraciones: el servidor necesita su propio plan. Conservar evidencia sin JWT, credenciales o datos personales y volver a probar el flujo afectado.

## Mantener las guías

Actualizar documentación junto con rutas, variables, scripts, políticas o capacidades. Priorizar código y resultados reproducibles frente a informes históricos. No registrar contraseñas ni datos de estudiantes en ejemplos o incidencias.
