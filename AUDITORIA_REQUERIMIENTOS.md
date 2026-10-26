> Actualización 26/10/2026: el cierre vigente es RESUMEN_ETAPA_3_QA_FINAL.md. Los estados históricos de foro, facturación, sesiones y RF-23 quedan superados por la evidencia de ese informe.

# Auditoría funcional y técnica — Educar para Transformar

Fecha: 25 de octubre de 2026. Alcance: web `frontend` y servidor Supabase `backend`; la aplicación móvil no se auditó.

## Resultado actualizado

Los repositorios están organizados bajo `METODOLOGIA DE SISTEMA II`:

- `frontend`: React, TypeScript y cliente Supabase.
- `backend`: migraciones PostgreSQL, RLS, RPC, Edge Functions y pruebas.

La auditoría anterior sólo tenía el cliente. El servidor resuelve esa falta **en código versionado**: contiene las tablas, restricciones, triggers, RPC y políticas que usa el frontend para alumnos, profesores, familias, deporte, transporte, comedor, cursado y reportes. Las RPC invocadas por el frontend existen con contratos compatibles en el backend.

No se puede afirmar que las migraciones estén aplicadas en la instancia Supabase reactivada. No hubo acceso a un proyecto de prueba/producción, no está instalado el CLI de Supabase y no se ejecutaron migraciones ni SQL remoto. Por ello, una función implementada pero no ejecutada en Supabase se clasifica como **No verificable**, no como completa.

| Estado | Criterio |
|---|---|
| Completo | Implementación y funcionamiento comprobados en ejecución. |
| Parcial | Existe implementación, pero falta una regla, persistencia o parte del flujo. |
| Pendiente | No se localizó implementación. |
| No verificable | El código y/o pruebas existen, pero no se ejecutaron contra Supabase. |

## Actualización y verificación local

| Repositorio | Ruta | Estado |
|---|---|---|
| Frontend | `frontend` | `main` sincronizada con `origin/main`; sólo este informe queda sin trackear. |
| Backend | `backend` | Clonado desde `main` en `a2a5f42`, sin cambios locales. |

Se instalaron las dependencias declaradas del frontend con `npm ci` (215 paquetes). Ese comando informó 12 alertas de dependencias (2 bajas, 1 moderada y 9 altas); no se aplicó una actualización automática. El backend no declara `package.json` ni `package-lock.json` en su raíz, por lo que no tiene dependencias Node instalables para este alcance.

El frontend compiló correctamente con `npm run build`. Los cuatro checks docentes pasaron: acceso, sesión, datos y agenda. `npm run lint` falla con cuatro errores existentes por `setState` síncrono dentro de `useEffect` en `CrearNoticiaPage.tsx`, `GestionNoticiasPage.tsx` y `Header.tsx`, más cuatro advertencias de dependencias de hooks. Vite advierte un bundle JavaScript de 1,084 kB sin comprimir; no bloqueó el build.

## Contratos frontend–backend

El frontend invoca las RPC `submit_enrollment_request`, `list_enrollment_requests`, `approve_enrollment_request`, `reject_enrollment_request`, `archive_enrollment_request`, `create_student`, `update_student`, `create_teacher`, `update_teacher`, `enroll_student_in_subject`, `record_academic_history`, `enroll_student_in_sport_group`, `enroll_student_in_transport`, `enroll_student_in_dining`, `record_dining_usage`, `link_student_guardian` y `get_admin_report`.

Todas están definidas en `backend/supabase/migrations`. `get_admin_report(text, jsonb)` conserva el contrato usado por `frontend/src/features/admin/services/reportsRepository.ts`; delega a la implementación filtrada. La Edge Function `admin-provision-user` existe en `backend/supabase/functions/admin-provision-user/index.ts` y coincide con la invocación del panel de cuentas.

Las mutaciones directas del frontend sobre catálogos administrativos están permitidas únicamente al superadmin por RLS. El frontend desactiva servicios directamente en tabla aunque el backend también ofrece `deactivate_student_service_enrollment`; no rompe el contrato, pero la RPC es el control más explícito.

## Requerimientos funcionales

| Requerimiento | Estado actualizado | Evidencia frontend | Evidencia backend | Qué falta | Prioridad |
|---|---|---|---|---|---|
| RF-01 Registro y solicitud de alumno | No verificable | Formulario y RPC en `features/inscripcion/services/enrollmentStore.ts`. | `20260921220000_stage2_enrollment_requests.sql`: tabla, validación, normalización, alta y aprobación transaccional. | Aplicar y probar alta, duplicado y rechazo. | Alta |
| RF-02 Consulta de alumno | No verificable | `listStudents` y `/privado/alumnos`. | `people`, `students`, inscripciones y RLS en etapas 1–3. | Probar consulta con superadmin. | Alta |
| RF-03 Modificación de alumno | No verificable | RPC `update_student`. | `update_student(jsonb)` exige superadmin. | Probar actualización, DNI duplicado y RLS. | Alta |
| RF-04 Aprobación y estado | No verificable | Panel y acciones aprobar/rechazar/archivar. | RPC bloquean solicitud/curso, crean o reutilizan alumno e inscripción. | Ejecutar flujo con fixtures. | Alta |
| RF-05 Registro de profesor | No verificable | RPC `create_teacher` y formulario. | `create_teacher(jsonb)`, índices de DNI/legajo y RLS. | Probar altas, duplicados y permisos. | Alta |
| RF-06 Consulta de profesor y materias | No verificable | Administración y portal docente. | Relaciones `teachers`, `course_subjects` y políticas de docente. | Probar con docente autenticado. | Media |
| RF-07 Modificación de profesor | No verificable | RPC `update_teacher`. | `update_teacher(jsonb)` protegida. | Probar actualización y revocación. | Media |
| RF-08 Deporte y responsable | Parcial | Alta de deporte/grupo y selector docente. | `sports`, `sport_groups`, FK y RLS. | `sport_groups.teacher_id` admite `NULL`; falta hacer responsable obligatorio. | Alta |
| RF-09 Grupos por nivel y horario | No verificable | UI valida inicio menor a fin. | Trigger rechaza grupo inactivo y horarios solapados del grupo. | Ejecutar casos de solapamiento/nivel. | Alta |
| RF-10 Inscripción deportiva | No verificable | RPC `enroll_student_in_sport_group`. | Trigger serializa por alumno/año y valida curso/nivel, máximo dos, deporte repetido, conflicto horario y cupo; índice único y aceptación SQL. | Aplicar y ejecutar pruebas de límite, duplicado, cupo y solapamiento. | Crítica |
| RF-11 Transporte y cuatro recorridos | No verificable | UI limita rutas 1–4 y llama RPC. | `check (route_number between 1 and 4)`, único; trigger valida alumno, ruta/parada/cupo y evita doble inscripción activa. | Ejecutar pruebas. | Alta |
| RF-12 Comedor | No verificable | RPC de inscripción y uso. | Servicios, turnos, inscripciones, uso, checks, cupo y únicos por alumno/año y uso/día. | Ejecutar pruebas de cupo, duplicado y uso inactivo. | Alta |
| RF-13 Usuarios y roles | Parcial | Panel usa `admin-provision-user`; registro demo continúa local. | Edge Function, `profiles`, permisos y vínculos de identidad. | Retirar/inhabilitar demo con credenciales locales y comprobar Function desplegada. | Crítica |
| RF-14 Padres/tutores e hijos | No verificable | RPC de vínculo y portal familiar. | `student_guardians`, `is_guardian_of_student` y RLS; `student_portal_access.test.sql` cubre hijo propio/no relacionado. | Aplicar y correr prueba. React depende de RLS para el filtro. | Crítica |
| RF-15 Permisos por rol | Parcial | Guards separan superadmin, alumno, familia y docente. | RLS, roles, permisos y helpers basados en `auth.uid()`. | Confirmar policies desplegadas y eliminar flujo demo local. | Crítica |
| RF-16 Niveles educativos | No verificable | CRUD `/privado/niveles`. | Tabla con checks, RLS y policy administrativa. | Probar persistencia y permisos. | Media |
| RF-17 Cursos y nivel | No verificable | CRUD exige nivel/ciclo. | FK, checks y único `(educational_level_id, code, academic_year)`. | Probar FK, duplicado y capacidad. | Alta |
| RF-18 Materias | No verificable | CRUD de `subjects`. | Código único, checks y RLS. | Probar administración y duplicado. | Media |
| RF-19 Horarios | No verificable | CRUD de `academic_schedules`. | Esquema y validaciones en `20260922100000_work_unit_a_academic_records.sql`. | Ejecutar casos inválidos y RLS. | Alta |
| RF-20 Inscripción al cursado | No verificable | RPC `enroll_student_in_subject`. | Valida superadmin, curso activo, pertenencia alumno–curso/año e índice único activo; aceptación SQL disponible. | Ejecutar alumno ajeno al curso y duplicado. | Crítica |
| RF-21 Profesor, materia y curso | No verificable | `course_subjects` en administración. | FKs y `validate_course_subject` validan ciclo y entidades activas. | Probar combinaciones válidas/erróneas. | Alta |
| RF-22 Reportes institucionales | No verificable | `ReportsPage` filtra y exporta CSV desde `get_admin_report`. | `get_admin_report(text,jsonb)` cubre 12 códigos y exige superadmin o `reports:read`; existe `reporting-acceptance.sql`. | Aplicar y ejecutar cada reporte con fixtures. | Crítica |
| RF-23 Chatbot deportivo | Pendiente | Sin ruta, componente ni servicio. | Sin migración, RPC ni Edge Function. | Implementar después de verificar RF-10. | Media |

## Reglas de negocio

| Regla | Estado | Evidencia backend | Qué falta | Prioridad |
|---|---|---|---|---|
| Máximo dos deportes | No verificable | Trigger cuenta activos por alumno/año con bloqueo asesorado. | Ejecutar tercera inscripción concurrente. | Crítica |
| Sin superposición deportiva | No verificable | Triggers para grupo y para deportes activos del alumno. | Ejecutar solapamiento parcial y total. | Crítica |
| Sin duplicados | No verificable | Índices únicos parciales en deporte, transporte, comedor y cursado. | Aplicar y probar concurrencia. | Crítica |
| Un alumno por curso/ciclo | No verificable | Trigger de inscripción valida curso/año/capacidad. | Confirmar y probar la restricción de único curso activo por ciclo. | Crítica |
| Curso en un nivel | No verificable | FK no nula y único por nivel/código/año. | Probar. | Alta |
| Materia en varios cursos/profesores | No verificable | `course_subjects` y FKs modelan la asociación. | Probar dos cursos/docentes. | Alta |
| Deporte con responsable | Parcial | `teacher_id` es FK pero nullable. | Hacerlo obligatorio. | Alta |
| Tutor sólo ve hijos propios | No verificable | RLS usa `is_guardian_of_student(auth.uid())`; test SQL cubre aislamiento. | Desplegar y ejecutar prueba. | Crítica |
| Cuatro recorridos | No verificable | Check y único de `route_number`. | Probar. | Alta |
| Permisos por rol | No verificable | RLS exige cuenta activa y rol/permiso. | Prueba integrada y retiro del demo. | Crítica |

## Reportes solicitados

| Reporte | Estado | Evidencia frontend | Evidencia backend | Qué falta |
|---|---|---|---|---|
| Información completa por alumno | No verificable | `student_overview`. | Rama de `get_admin_report`. | Ejecutar aceptación. |
| Cursos y horarios por profesor | No verificable | `teachers_by_course_schedule`. | RPC filtrada implementada. | Ejecutar aceptación. |
| Alumnos por curso | No verificable | `students_by_course`. | RPC filtrada implementada. | Ejecutar aceptación. |
| Alumnos por materia | No verificable | `students_by_subject`. | RPC filtrada implementada. | Ejecutar aceptación. |
| Docentes por nivel | No verificable | `teachers_by_level`. | RPC filtrada implementada. | Ejecutar aceptación. |
| Alumnos por deporte | No verificable | `students_by_sport`. | RPC de servicios/reporting. | Ejecutar aceptación. |
| Alumnos por deporte y nivel | No verificable | `students_by_sport_level`. | Rama de reporte completada. | Ejecutar aceptación. |
| Deporte, nivel, horario y profesor | No verificable | `students_by_sport_schedule_teacher`. | Rama de reporte completada. | Ejecutar aceptación. |
| Alumnos por recorrido | No verificable | `students_by_transport`. | RPC usa rutas y paradas. | Ejecutar aceptación. |

La interfaz también incorpora `teachers_by_level_courses`, `students_by_sport_schedule` y `transport_and_dining`. El CSV se genera en el navegador sobre filas del RPC; no introduce otra fuente de datos.

## RLS, seguridad y pruebas

- Las migraciones habilitan RLS en perfiles, personas, alumnos, docentes, catálogos, inscripciones, deportes, transporte, comedor y foro.
- Las operaciones administrativas exigen `is_active_superadmin()`. Las lecturas de alumno/familia/docente derivan identidad de `auth.uid()`, no de IDs aportados por cliente.
- `student_portal_access.test.sql` prueba aislamiento de familia, aprobación y revocación. `student_forum.test.sql` prueba autoría, votos y RLS. `work-unit-a-acceptance.sql`, `work-unit-b-services-acceptance.sql` y `reporting-acceptance.sql` cubren los módulos solicitados.
- Los tests SQL no se ejecutaron porque requerirían una instancia desechable con migraciones; el entorno tiene `psql` y Docker, pero no Supabase CLI. La prohibición de aplicar migraciones se respetó.

Siguen dos riesgos de cliente: `localCredentialsStore.ts` guarda contraseñas demo en texto plano y `demoAuth.ts` puede confirmar un registro local cuando falla el backend. No deben presentarse como autenticación institucional.

## Cambios respecto de la auditoría anterior y recomendación

RF-10, RF-12, RF-20 y RF-22 dejaron de estar “sin evidencia de backend”: están implementados y tienen restricciones/pruebas versionadas. También se confirmó RLS para familia y las funciones de aprobación, transporte, profesor y administración.

Sigue faltando comprobar el despliegue de Supabase y ejecutar los tests de aceptación. Primero debe usarse una instancia Supabase de prueba autorizada, aplicar las migraciones en orden y guardar las salidas de los scripts de aceptación. Después se deben probar los cuatro roles desde el frontend y deshabilitar el flujo demo antes de la demostración. RF-23 permanece pendiente.

No se modificaron migraciones, base de datos ni código de aplicación; la única modificación funcional del repositorio es este informe.
