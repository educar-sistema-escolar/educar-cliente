# RESUMEN ETAPA 2 — Unificación visual institucional

Fecha: 26/10/2026. Implementación local para revisión. Sin commit, push ni deploy.

## Alcance y estado inicial

Se leyó `RESUMEN_ETAPA_1_MIGRACIONES.md` antes de editar y se inspeccionaron los layouts, rutas activas, tokens, Button y useAccessibleDialog existentes. El workspace contiene dos repositorios independientes, frontend y backend; el directorio padre no es la raíz de estos repositorios.

El frontend y el backend ya tenían numerosos cambios sin confirmar. Se preservaron. Las rutas activas de familia y alumno utilizaban StudentPortalLayout; FamilyLayout era una implementación legacy sin uso en App.tsx. También se consolidó esa entrada para evitar mantener un tercer diseño familiar.

No se editaron Supabase, migraciones, RLS, roles, permisos, cuentas, contraseñas ni datos DEMO. No se modificaron el login, la página pública ni el footer DEMO y sus condiciones de habilitación. No se instalaron dependencias. Las pruebas de interfaz no guardaron formularios ni crearon publicaciones, inscripciones o registros institucionales.

## Diseño y componentes compartidos

- `InstitutionalLayout`: única estructura para Director/Administrador, Docente, Familia y Alumno. Sidebar de 256 px, logo existente, identificación del rol, navegación autorizada, estado activo, usuario, enlace institucional y cierre de sesión con estado de carga y error.
- Header azul común con sección actual, rol y acciones de navegación. Comunidad administrativa conserva su agrupación desplegable, sus cuatro opciones y el contador de solicitudes pendientes.
- `institutional.css`: reutiliza los nombres de tokens del proyecto y define su variante institucional dentro de `.institutional-shell`, sin cambiar el aspecto del sitio público. Azul existente #0046AA, acciones #2563EB, celeste #DBEAFE, fondo #F5F7FB, superficies blancas, bordes grises, texto oscuro. Variables compartidas para espaciado, radio y sombra; tipografía sans-serif existente.
- Se reutilizan Button y sus variantes primaria/secundaria/destructiva/ghost, los formularios, tablas, selectores, estados y diálogos existentes. Se homogeneizan altura mínima, foco, botones deshabilitados, interacción activa y texto secundario desde el ámbito institucional. No se añadieron wrappers de tarjetas ni una nueva librería UI.
- Los colores particulares verdes, beige y amarillos del portal académico y del docente fueron sustituidos por tokens institucionales. El CSS docente conserva la composición de materias, alumnos y agenda; elimina las reglas del shell retirado y la tipografía editorial.

## Mejoras por rol

**Director/Administrador.** Sigue siendo la referencia: azul, sidebar ordenado, header y tarjetas claras. Se retiraron las dos copias del menú desktop/móvil y se usa el mismo componente que los otros roles. Se conservan todas las opciones, el contador actualizado por `enrollment-updated`, Comunidad y las consultas existentes. Mejores títulos de sección para cursos, materias, niveles y otros destinos; foco y controles táctiles comunes.

**Docente.** Materias, cursos, selección, listado desplegable de alumnos, búsqueda, CSV, ciclo lectivo, actualización y agenda permanecen. El nombre se consulta en `people` por el perfil activo con la sesión actual y sus permisos existentes. Se prioriza ese nombre; si la consulta no está disponible, se conserva un nombre de perfil válido o el texto “Docente”, sin usar el correo como saludo. Se observó `Docente Demo Uno` en la cuenta y “Hola, Docente.” en el saludo, derivado de su primer nombre institucional.

**Familia.** Mismo sidebar/header que administración, manteniendo el selector de hijos dentro del bloque inicial visible. Se comprobaron Joaquin Ledesma y Emilia Fernandez; al cambiar la selección, cambian curso, materias, horarios y servicios. Conserva inscripción y novedades. Las tarjetas ahora usan blanco, gris claro y celeste, sin beige.

**Alumno.** Conserva ficha académica, materias, horarios, deportes, transporte, comedor, acceso al foro y asistente deportivo RF-23. Se retocó el color del título del asistente para usar el token común. No se alteraron reglas de recomendación ni de matrícula. El alumno probado tiene dos deportes y el asistente informa que no hay grupos compatibles.

## Responsive y accesibilidad

- Sidebar de escritorio desde 768 px. En móvil, drawer modal nativo con fondo inerte, desplazamiento del menú, cierre visible, Escape y bloqueo del scroll de fondo.
- Se reutiliza `useAccessibleDialog` para que Tab y Shift+Tab circulen dentro del drawer; en la revisión se detectó que el diálogo nativo por sí solo dejaba salir el foco hacia el navegador y se corrigió. Se verificó retorno al disparador y `aria-expanded` true/false.
- Skip link al contenido, nombres accesibles de controles nuevos, iconos decorativos ocultos al lector, navegación activa con aria-current de NavLink, áreas táctiles de al menos 44 px en controles institucionales y estados disabled/busy del cierre de sesión.
- Las tarjetas y la agenda se reorganizan por ancho. El encabezado docente y sus filtros admiten salto de línea. Las tablas conservan su contenedor con overflow-x auto; no se ocultan columnas.
- Se refuerzan textos secundarios y bordes de campos. Contrastes calculados de tokens: blanco/azul institucional 8,55:1; blanco/azul de acciones 5,17:1; texto secundario/blanco 7,58:1; borde de campo/blanco 3,46:1; navegación activa 8,46:1. Se conserva la regla global existente para movimiento reducido.
- Esto es una comprobación focalizada de accesibilidad, no una certificación WCAG 2.2 de todas las pantallas ni una prueba con lector de pantalla.

## Verificación técnica

| Comando en frontend | Resultado final |
|---|---|
| npm run lint | Aprobado, sin errores ni warnings |
| npm run build | Aprobado, TypeScript y Vite |
| npm test | 15/15 aprobadas |
| git diff --check | Aprobado; aviso preexistente LF/CRLF de RegistrationPage.tsx |

Se agregó un test del nombre institucional docente: nombre completo, filtro por perfil activo, ausencia de persona y error de consulta. Los tests anteriores de acceso docente, sesiones, agenda, CSV, recomendaciones y condiciones DEMO siguen pasando. Vite emite una advertencia de tiempo consumido en plugins; los tests mantienen el aviso experimental de VM Modules de Node.

## Pruebas reales en navegador

Se utilizó el navegador automatizado de la aplicación contra Vite local (`http://127.0.0.1:5175`) con las cuatro cuentas existentes y Supabase real. Se ingresó y cerró sesión con cada rol. No se incluyen credenciales en este informe.

| Verificación | Evidencia observada |
|---|---|
| Director | Tres solicitudes reales (una pendiente, una aprobada, una rechazada), contador de pendiente 1 |
| Navegación administrativa | Cuentas, permisos, niveles, cursos, materias, docentes, alumnos, registros, servicios, reportes, facturación y cuatro opciones de Comunidad conservan sus destinos; facturación informa el fallo remoto detallado abajo |
| Tabla de cursos | Seis cursos visibles. Tabla de 701 px con contenedor de 316 px en móvil y 422 px en tablet; desplazamiento interno auto |
| Diálogo académico | Abrir Nuevo, campos etiquetados, foco inicial y cerrar con Escape sin guardar |
| Docente | Dos materias/cursos, cuatro alumnos en el primer curso; búsqueda Alma reduce el listado; botón de descarga CSV ejecutado (no se inspeccionó el archivo descargado) |
| Agenda docente | Lunes 08:00–09:00 y 09:00–10:00, coherentes con Etapa 1 |
| Familia | Dos hijos; selección de Emilia actualiza ficha, tres materias y servicios correspondientes |
| Alumno | Alma Benitez, dos materias, dos deportes, transporte y comedor |
| RF-23 | Apertura y resultado sin grupos compatibles; no crea inscripción |
| Foro | Ruta y formulario de nueva publicación abren; cierre con Escape sin publicar; listado bloqueado por recurso remoto ausente |
| Menú móvil | Apertura/cierre, navegación a otra sección, Escape, retorno del foco y ciclo Tab/Shift+Tab comprobados |

Los cuatro paneles principales se capturaron a 390, 768 y 1440 px y se comparó su sidebar, header, paleta y superficies. No se observó desbordamiento horizontal de página: `scrollWidth` coincide con `clientWidth`. También se comprobó la tabla de cursos en los tres anchos y el foro a 390 px. No equivale a una prueba de todas las combinaciones de pantalla y ancho.

Se consultaron los registros de consola durante los recorridos: no se observaron excepciones JS ni advertencias nuevas. La inspección de red sí encontró HTTP 404 de recursos remotos ausentes, descritos debajo; no se afirma que todas las consultas de Supabase funcionan.

Evidencias locales reales en `frontend/tmp/etapa2/` (ignoradas por Git): capturas `director`, `docente`, `familia` y `alumno` con sufijos `390`, `768` y `1440`; además tabla de cursos, agenda, foro, asistente y `qa.json`. No son mockups. Las capturas se tomaron durante la implementación; el enlace adicional “Sitio institucional” del sidebar se incorporó después de las primeras capturas.

## Pendientes y límites

1. Foro: GET a `forum_discussions` devuelve HTTP 404 / PGRST205: Supabase no encuentra `public.forum_discussions` en el schema cache. La UI muestra el error del listado. El servicio del foro no fue editado en esta etapa.
2. Facturación: GET a `billing_values` y `transfer_submissions` devuelve HTTP 404 / PGRST205 por esas tablas ausentes del schema cache. La UI informa que no pudo cargar facturación. El servicio no fue editado; no se aplicaron migraciones para corregirlo.
3. En una repetición tardía de login durante QA la pantalla quedó validando y se recuperó recargando y se verificó después otro acceso y cierre docente; los cuatro accesos y cierres anteriores habían funcionado. No se modificó autenticación ni se atribuye una causa sin diagnóstico.
4. No se verificaron escrituras, envío de inscripciones, altas, aprobación, publicaciones o pagos: la restricción de conservar datos DEMO se respetó. Se probaron navegación, consultas y apertura/cierre de formularios.
5. No se hizo auditoría exhaustiva con lector de pantalla ni de todas las variantes de error, hover o modal. Se verificaron los componentes compartidos y los recorridos descritos.

## Archivos alcanzados por esta etapa

- `src/shared/components/layout/InstitutionalLayout.tsx`.
- `src/shared/components/layout/institutional.css`.
- `src/pages/admin/AdminLayout.tsx`.
- `src/pages/teacher/TeacherLayout.tsx`.
- `src/pages/teacher/teacher.css`.
- `src/features/teacher/services/teacherRepository.ts`.
- `src/pages/family/FamilyLayout.tsx`.
- `src/pages/student/StudentPortalLayout.tsx`.
- `src/pages/student/StudentPortalPage.tsx`.
- `src/pages/student/SportRecommendationAssistant.tsx`.
- `tests/teacher-display-name.test.mjs`.

También se crean este informe en el directorio padre y su copia versionable `frontend/docs/RESUMEN_ETAPA_2_DISENO.md`. No se tocó código de backend. Los cambios de otros archivos que aparecen en Git son trabajo previo a esta etapa.

## Estado final de Git

Ambos repositorios continúan en `codex/final-presentation-qa`. Hay cambios sin confirmar previos y de esta etapa. No se ejecutaron git add, commit, push, reset ni deploy. Las capturas están en tmp ignorado. A continuación se registra el estado completo para distinguirlo de la lista acotada anterior.

### Frontend

```text
 M .gitignore
 M package.json
 M src/App.tsx
 M src/features/auth/data/localDemoAccounts.ts
 M src/features/auth/services/demoAuth.ts
 D src/features/auth/services/localCredentialsStore.ts
 M src/features/auth/services/supabaseAuth.ts
 M src/features/student/services/studentPortalRepository.ts
 M src/features/teacher/services/teacherRepository.ts
 M src/index.css
 M src/pages/admin/AcademicMasterDataPage.tsx
 M src/pages/admin/ActivitiesPage.tsx
 M src/pages/admin/AdminLayout.tsx
 M src/pages/admin/CommentsModerationPage.tsx
 M src/pages/admin/CrearNoticiaPage.tsx
 M src/pages/admin/CuentasDelSistemaPage.tsx
 M src/pages/admin/EnrollmentRequestsPage.tsx
 M src/pages/admin/GestionNoticiasPage.tsx
 M src/pages/admin/OpinionModerationPage.tsx
 M src/pages/admin/ReportsPage.tsx
 M src/pages/admin/services/SportsServicesPage.tsx
 M src/pages/family/FamilyLayout.tsx
 M src/pages/home/components/ContactSection.tsx
 M src/pages/home/components/EnrollmentInviteSection.tsx
 M src/pages/jobs/JobsPage.tsx
 M src/pages/login/LoginPage.tsx
 M src/pages/news/NewsPage.tsx
 M src/pages/opiniones/OpinionsPage.tsx
 M src/pages/registration/RegistrationPage.tsx
 M src/pages/student/StudentActivitiesPage.tsx
 M src/pages/student/StudentPortalLayout.tsx
 M src/pages/student/StudentPortalPage.tsx
 M src/pages/teacher/TeacherDashboardPage.tsx
 M src/pages/teacher/TeacherLayout.tsx
 M src/pages/teacher/teacher.css
 M src/shared/components/layout/Footer.tsx
 M src/shared/components/layout/Header.tsx
 M src/shared/utils/userFacingError.ts
?? AUDITORIA_REQUERIMIENTOS.md
?? demo.env.example
?? docs/RESUMEN_ETAPA_2_DISENO.md
?? docs/demo-restringida.md
?? docs/demo.nginx.conf
?? scripts/
?? src/features/admin/services/sportScheduleRules.ts
?? src/features/student/services/sportRecommendationRules.ts
?? src/features/student/services/sportRecommendationsRepository.ts
?? src/pages/student/SportRecommendationAssistant.tsx
?? src/shared/components/layout/InstitutionalLayout.tsx
?? src/shared/components/layout/institutional.css
?? src/shared/components/ui/
?? src/shared/hooks/useAccessibleDialog.ts
?? src/shared/utils/demoAccess.ts
?? src/shared/utils/educationalLevelLabel.ts
?? tests/demo-access.test.mjs
?? tests/sport-recommendations.test.mjs
?? tests/sport-schedule-rules.test.mjs
?? tests/teacher-display-name.test.mjs
```

### Backend (cambios previos, sin modificaciones en esta etapa)

```text
 M supabase/config.toml
 M supabase/functions/admin-provision-user/index.ts
 M tests/billing-reminders.test.mjs
?? docs/operations/RESUMEN_ETAPA_1_MIGRACIONES.md
?? docs/operations/demo-unblock-20261026.md
?? scripts/
?? supabase/migrations/20261025120000_fix_enrollment_approval_and_dining_usage.sql
?? supabase/migrations/20261026030000_fix_demo_schedule_overlaps.sql
?? supabase/migrations/20261026120000_fix_guardian_link_ambiguity.sql
?? supabase/migrations/20261026133000_fix_approval_guardian_trigger_ambiguity.sql
?? tests/admin-provision-user.test.mjs
?? tests/database-regressions-acceptance.sql
?? tests/database-regressions-migration.test.mjs
?? tests/pending-rpcs-fixture.sql
?? tests/pg-schedule-regressions.test.mjs
?? tests/stage1-live-acceptance.sql
?? tests/stage1-postflight.sql
```
