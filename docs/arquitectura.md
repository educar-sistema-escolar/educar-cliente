# Arquitectura y funcionalidades

## Vista general

```text
Navegador: React + React Router
  ├─ pages/ y componentes compartidos
  ├─ features/*/services: consultas, mapeos y reglas
  └─ Cliente Supabase con sesión del usuario
       ├─ Auth: identidad y sesión
       ├─ PostgreSQL/PostgREST/RPC: datos y autorización RLS
       └─ Edge Functions: operaciones privilegiadas de servidor
```

No hay un backend exclusivo para el chatbot ni un modelo generativo. El navegador consulta con la identidad autenticada; las protecciones visuales **no reemplazan** las políticas del servidor.

## Organización del frontend

| Ubicación | Responsabilidad |
|---|---|
| [`src/App.tsx`](../src/App.tsx) | Rutas, carga diferida y validación de acceso |
| `src/pages/` | Pantallas y composición de cada portal |
| `src/features/auth/` | Auth institucional, rol y contexto de sesión |
| `src/features/admin/` | Repositorios, tipos y reglas administrativas |
| `src/features/student/`, `src/features/teacher/` | Lecturas y operaciones de cada dominio |
| `src/features/chatbot/` | Flujos puros, ventana y adaptador de consultas |
| `src/shared/` | Layouts, controles, hooks y utilidades reutilizables |
| `src/index.css` | Tema Tailwind; el layout institucional también define tokens propios |
| `tests/` | Pruebas generales y del chatbot |

## Rutas y roles

| Ruta | Perfil | Función |
|---|---|---|
| `/`, `/quienes-somos`, `/niveles`, `/bienestar` | Público | Información institucional |
| `/noticias`, `/opiniones`, `/empleo` | Público | Contenido y participación |
| `/inscripcion`, `/registro`, `/login` | Público | Solicitud, orientación de alta y acceso; no equivalen a aprobar una inscripción |
| `/privado/*` | `superadmin` | Cuentas, estructura académica, inscripciones, servicios, cobros, reportes y moderación |
| `/docentes`, `/docentes/agenda` | `teacher` | Materias, alumnos, historial/calificaciones y agenda |
| `/alumnos`, `/alumnos/foro/*` | `student` | Ficha, horarios, servicios, foro y ayuda |
| `/familias` | `parent` | Fichas vinculadas e interacción familiar |

`guardian` se normaliza como `parent` en el cliente. Los docentes tienen portal propio, no acceso al panel administrativo. Las rutas heredadas `/privado/foro/*` redirigen al foro estudiantil cuando el rol lo permite.

## Datos y operaciones

- **Administración:** estructura educativa, personas y cuentas, asignaciones, registros académicos, inscripción alumno-materia con búsqueda, solicitudes, servicios, facturación y reportes. Las capacidades efectivas dependen de las RPC y políticas instaladas.
- **Docentes:** asignaciones y alumnos, búsqueda, CSV, carga de notas y edición de registros propios según el backend. La migración de gestión docente incorpora autorización y auditoría en servidor.
- **Estudiantes y familias:** resolución de perfiles/personas y alumnos propios o vinculados; ficha con cursos, notas, horarios y servicios. Solicitudes de servicios y recomendación deportiva son componentes distintos del chatbot de ayuda.
- **Servidor:** migraciones de identidad, vínculos familiares, cursos, materias, matrículas, servicios, foro y facturación; funciones `admin-provision-user` y `billing-reminders`. La existencia de operaciones usadas por otros clientes no implica una pantalla web para cada una.

### Límites de persistencia

Noticias, opiniones y comentarios públicos utilizan `localStorage`: los cambios son locales a ese navegador, no una publicación centralizada entre usuarios. El foro estudiantil es otro módulo y consulta Supabase. Contacto utiliza `mailto:`; empleo valida el PDF y prepara un correo, pero **no transmite el CV ni confirma recepción**. La solicitud de inscripción sí utiliza el repositorio institucional.

## Chatbot de estudiantes

El botón **Ayuda** solo aparece para estudiantes autenticados. No admite texto libre: los botones cambian de pantalla o abren un destino permitido.

| Flujo | Resultado |
|---|---|
| Transporte | Asignaciones activas: recorrido y número, parada y ciclo; orientación para solicitar cambios |
| Deportes | Inscripciones registradas: deporte, grupo y ciclo; orientación para inscribirse |
| Encontrar una sección | Notas, horarios, servicios, foro o noticias; cierra el chat y, cuando corresponde, enfoca y desplaza a la sección |

No inscribe, no modifica datos, no confirma cupos, no ofrece catálogo disponible ni seguimiento/horarios de vehículos. Consulta por tema sin cargar todo el portal. Distingue vacío, fallo y falta de legajo; los campos ausentes muestran “No informado”.

`chatbotFlow.ts` define textos y transiciones; `StudentChatbot.tsx`, la ventana; `chatbotRepository.ts`, las consultas. El adaptador no acepta IDs de alumnos proporcionados por la interfaz y vuelve a comprobar identidad/vínculo antes de devolver resultados. Cerrar, cambiar de pantalla o cuenta invalida respuestas pendientes.

## Identidad y privacidad

El acceso comprueba usuario Auth, sesión y perfil activo. Los eventos de autenticación invalidan el contenido personal; una generación de consulta impide restaurar respuestas de otra cuenta. El nombre estudiantil se resuelve opcionalmente desde la persona activa vinculada, sin conceder permisos. Si falta, se utiliza un saludo genérico, no el correo.

El SDK conserva y renueva la sesión, pero recargas o eventos de Auth pueden exigir revalidación. El esqueleto institucional mejora la presentación sin mostrar datos previos ni omitir autorización. Los errores y tiempos de espera deben mantener el acceso cerrado.

Para extender el proyecto, ubicar reglas en su dominio, reutilizar repositorios/componentes, probar límites de autorización y revisar políticas SQL. Comentar decisiones no evidentes, no repetir el código.
