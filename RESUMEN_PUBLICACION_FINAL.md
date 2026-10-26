# Publicación final — Educar para Transformar

Fecha de verificación: 26/10/2026. Sitio probado: https://educar-cliente.vercel.app/ mediante el navegador integrado, sobre la URL pública. No se utilizó localhost como evidencia de funcionamiento de producción.

## Resultado

El frontend actualizado está publicado en GitHub `main` y sus cambios ya son visibles en Vercel. Los cuatro roles ingresaron manualmente y accedieron a sus paneles con Supabase. Se corrigió y publicó un 404 al recargar rutas internas.

La entrega tiene dos pendientes concretos: el build remoto carece de las credenciales DEMO y deshabilita sus cuatro botones; GitHub rechaza el push del backend por permisos. No se declara completada la publicación de ambos repositorios ni la precarga pública de credenciales.

## GitHub y commits

| Repositorio | Rama | Commit | Resultado |
| --- | --- | --- | --- |
| educar-cliente | main | `3601be430436041ad1cba1c6117683248ba91501` — Finalizar paneles institucionales y publicar accesos DEMO del frontend | Push confirmado |
| educar-cliente | main | `31292791594706d7a44f2b2311e34b0be3156473` — Corregir recarga de rutas internas en Vercel | Push confirmado |
| educar-servidor | main local | `14665a65d25766908d32f024ffd58741ab263784` — Completar migraciones, datos DEMO y validaciones de la presentación | Commit e integración local realizados; push rechazado |

Este informe se agrega mediante un commit documental posterior del frontend; su identificador puede consultarse con `git log -1 -- RESUMEN_PUBLICACION_FINAL.md`.

Se revisaron los inventarios acumulados tomando como referencia `REVISION_FINAL_ANTES_DE_PUSH.md`, se preservaron los cambios de etapas anteriores y se hizo fetch antes de integrar. Ambos repositorios partían de 0/0 contra origin/main. La integración desde `codex/final-presentation-qa` fue fast-forward, sin conflictos, sin reset y sin force push.

El push del backend fue rechazado dos veces con: `Permission to educar-sistema-escolar/educar-servidor.git denied to mmoschen` (HTTP 403). El acceso del conector tampoco permitió consultar permisos (`Resource not accessible by integration`). El remoto del backend continúa en `a2a5f424ec0ec5fc4a5bfe092c68bdac010e6c94`, mientras main local conserva el commit pendiente. No se cambiaron remotos ni se enviaron cambios a otro repositorio.

## Validaciones finales

| Comprobación | Resultado |
| --- | --- |
| Frontend `npm run lint` | PASS |
| Frontend `npm run build` | PASS |
| Frontend `npm test` | PASS, 18/18 |
| Control del build local | PASS: 69 archivos y ocho valores DEMO públicos incluidos; sin patrones de claves privadas, claves Supabase de servidor o JWT service_role |
| Backend `node --test tests/*.test.mjs` | PASS, 17/17, incluidos los tests PostgreSQL descartables |
| `git diff --cached --check` antes de commits | PASS después de limpiar espacios finales y una línea vacía sobrante en dos archivos nuevos del backend |
| Candidatos Git | Revisados sin archivos .env/.env.local, contraseñas DEMO configuradas, patrones de claves privadas o de servidor |
| Ajuste de rutas | JSON validado; verificado posteriormente en producción |

Por las dependencias afectadas por OneDrive, los comandos frontend se ejecutaron en la copia local `C:/Users/juanm/AppData/Local/educar-stage4-frontend`, con el mismo lockfile. Se comprobó igualdad byte a byte de 169 archivos de fuentes, recursos, tests y configuración del repositorio; manifiesto SHA-256 `a510a29d93e6c5b1652b309cbbf7402395cccdc2668f3cbb0698391aaacc873b`. El añadido posterior `vercel.json` se validó en el repositorio y mediante recargas reales de producción; no altera el bundle. PostgreSQL usó las herramientas temporales ya preparadas fuera del producto. No se agregaron dependencias.

Avisos no bloqueantes: normalización LF/CRLF de Git, VM Modules experimental de Node y tiempos de plugins de Vite. No se omitieron tests.

## Cambios y pruebas visibles en producción

| Prueba pública | Resultado y alcance |
| --- | --- |
| Portada | Carga correcta; textos actualizados de inscripción y contacto presentes |
| Footer | Cuatro tarjetas azul oscuro: Superadministrador, Docente, Familia y Estudiante |
| Credenciales y botones del footer | PENDIENTE: las cuatro muestran “No disponible” y “Cuenta de demostración sin configurar en este entorno”; botones deshabilitados. La precarga pública no puede darse por aprobada |
| Superadministrador | Login manual, panel `/privado/solicitudes`, solicitudes DEMO y logout correctos |
| Docente | Login manual, dos materias, búsqueda “Alma”, agenda con dos bloques de lunes y logout correctos |
| Familia | Login manual, dos alumnos vinculados, cambio a Emilia Fernandez con actualización de curso y servicios y logout correctos |
| Estudiante | Login manual, ciclo 2027, materias/horarios/servicios y logout correctos |
| Facturación | Cargan importes DEMO, alumnos y transferencia `DEMO-2027-REVISION-ABRIL` con botón de comprobante; se ejecutó consulta de reporte de pagos. No se aprobaron pagos, emitieron facturas ni modificaron importes |
| Reportes | Tabla real, filtro académico 2027 y botón Exportar CSV ejecutados. No se certifica una descarga nueva ni se vuelve a presentar el CSV histórico como evidencia de esta ejecución |
| Niveles educativos | Listado de tres niveles, apertura de modal Nuevo, intento vacío y Cancelar; no se creó registro. No se certifica en esta ejecución el texto del error del modal |
| Foro | Cuatro publicaciones DEMO, categorías, autores, fechas, votos y respuestas visibles. Búsqueda “bienvenida” devuelve una publicación; se abrió el hilo y su respuesta. No se escribieron publicaciones, respuestas ni votos |
| Inscripción pública | Navegación al paso de alumno; campos vacíos rechazados con mensajes de nombre, apellido, DNI y fecha. No se envió solicitud nueva |
| Registro | Aviso de habilitación institucional y enlaces correctos; recarga de `/registro` verificada |
| Responsive | Paneles administrativo, docente, familiar, alumno y footer a 390, 768 y 1440 px; sin desbordamiento horizontal en las vistas medidas |
| Consola | Captura final sin errores ni warnings. No se generó un HAR exhaustivo ni se afirma cobertura de todas las peticiones |
| Supabase | Login y consultas reales de los cuatro roles correctos; datos académicos, foro, reportes y facturación cargados |

Las credenciales para los ingresos manuales fueron las existentes y verificadas del proyecto CentroEducativo `nhwsgmijdsxzuxgpllhy`, introducidas manualmente en el formulario público. No se modificaron cuentas, contraseñas ni permisos. Esto permite comprobar el login por separado de las variables ausentes en el build.

## Error corregido y publicado

Al recargar `/docentes/agenda`, Vercel respondió `404 NOT_FOUND`, aunque la navegación dentro de la aplicación funcionaba. Faltaba la regla de entrada para la SPA. Se agregó `vercel.json` con un rewrite de `/(.*)` a `/index.html`, conforme a la [documentación oficial de Vercel para Vite](https://vercel.com/docs/frameworks/frontend/vite), y se publicó el commit `3129279`.

Después del despliegue automático observado, una recarga autenticada del hilo `/alumnos/foro/discusion/84000000-0000-4000-8000-000000000001` conservó la discusión y su respuesta. El acceso directo posterior a `/docentes/agenda`, sin sesión, resolvió correctamente al login en lugar de devolver 404. También recargó correctamente `/registro`.

No se accedió al panel de Vercel, no se modificaron variables remotas ni se ejecutó una publicación manual desde CLI. El ajuste es un archivo versionado del frontend; la actualización del sitio se constató navegando su dominio público. No se certifican aquí el identificador interno del despliegue ni sus logs del proveedor.

## Pendientes que requieren intervención externa

1. En el proyecto Vercel existente, cargar para Production los valores DEMO verificados de las ocho variables públicas siguientes y ejecutar un nuevo build: `VITE_DEMO_SUPERADMIN_EMAIL`, `VITE_DEMO_SUPERADMIN_PASSWORD`, `VITE_DEMO_TEACHER_EMAIL`, `VITE_DEMO_TEACHER_PASSWORD`, `VITE_DEMO_FAMILY_EMAIL`, `VITE_DEMO_FAMILY_PASSWORD`, `VITE_DEMO_STUDENT_EMAIL`, `VITE_DEMO_STUDENT_PASSWORD`. Las tarjetas ya son públicas por código, sin flags de acceso ni protección adicional. No poner claves privadas ni credenciales de servidor en variables VITE. Después, repetir botones y precarga en el dominio público.
2. Resolver el permiso o alcance de la autenticación GitHub de `mmoschen` para escribir en `educar-sistema-escolar/educar-servidor`. Luego ejecutar fetch, confirmar que el remoto es antecesor de main local y hacer `git push origin main` desde backend, sin force. El trabajo está conservado en el commit indicado.

Los informes anteriores se conservan como registro histórico; sus indicaciones de posponer publicación u ocultar DEMO en producción fueron reemplazadas por las instrucciones posteriores del propietario y por los resultados de este informe.

## Evidencias

Evidencia local excluida de Git: `frontend/tmp/publicacion-final/browser-results.json` (roles, módulos, medidas responsive y consola) y `footer-vercel.jpg` (cuatro tarjetas sin variables). Logs finales en `../tmp/publicacion-final/`: lint, build, tests frontend y backend. Las capturas, archivos de entorno, temporales y builds no se incluyeron en los commits.
