# Revisión final antes de push — accesos DEMO públicos

Fecha: 26/10/2026. Estado: preparado y verificado localmente; sin commit, push ni deploy.

## Decisión vigente

Por instrucción expresa del propietario, las cuatro cuentas académicas DEMO deben ser públicas también en el despliegue normal de Vercel. Esta decisión reemplaza la exclusión de credenciales del build público documentada en informes anteriores. No se requiere protección previa ni un modo de compilación especial.

## Cambios realizados

- `src/shared/utils/demoAccess.ts`: eliminadas las restricciones por desarrollo, modo de build y flags de acceso/verificación. Siempre se generan las cuatro tarjetas; las credenciales proceden de las ocho variables públicas VITE_DEMO. Si falta configuración se informa sin inventar datos.
- `src/shared/components/layout/Footer.tsx`: sección “Credenciales de Acceso Demo” siempre presente, con Superadministrador, Docente, Familia y Estudiante. Conserva tarjetas azul oscuro, correo, contraseña y botón “Usar credenciales”. Se actualizó el texto de presentación y se permitió partir el correo institucional para corregir un desborde a 768 px.
- Cada enlace usa `/login?demo=superadmin`, `teacher`, `family` o `student`. El login existente precarga correo y contraseña; la persona pulsa “Iniciar sesión”. No se cambió el flujo de autenticación.
- `.env.example`, `demo.env.example` y `docs/demo-restringida.md`: configuración documentada para el build público normal.
- `tests/demo-access.test.mjs`: expectativas actualizadas para las cuatro tarjetas públicas y ausencia de restricciones de producción.
- `scripts/check-production-secrets.mjs`: ahora comprueba la inclusión deliberada de los ocho valores DEMO y sigue rechazando claves privadas, claves de servidor Supabase y JWT service_role.

No se modificaron cuentas, contraseñas ni permisos en Supabase. Se comprobaron las credenciales existentes contra Auth y los perfiles activos del proyecto CentroEducativo `nhwsgmijdsxzuxgpllhy`.

## Cómo quedará en Vercel

El build normal `npm run build`, con salida `dist`, mostrará las mismas cuatro tarjetas y los cuatro botones comprobados localmente. Para incorporar sus valores, cargar en el proyecto Vercel existente las variables de build siguientes, usando las credenciales DEMO existentes y verificadas de `.env.local`:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Superadministrador | `VITE_DEMO_SUPERADMIN_EMAIL` | `VITE_DEMO_SUPERADMIN_PASSWORD` |
| Docente | `VITE_DEMO_TEACHER_EMAIL` | `VITE_DEMO_TEACHER_PASSWORD` |
| Familia | `VITE_DEMO_FAMILY_EMAIL` | `VITE_DEMO_FAMILY_PASSWORD` |
| Estudiante | `VITE_DEMO_STUDENT_EMAIL` | `VITE_DEMO_STUDENT_PASSWORD` |

Aplicar a Production y a Preview si se usa. Mantener la configuración pública existente `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Las variables VITE se incorporan al JavaScript público durante el build; no necesitan flags adicionales. Las claves privadas y credenciales de servidor siguen fuera del frontend y del repositorio. Los archivos `.env` y `.env.local` permanecen ignorados.

No se accedió a Vercel para cambiar variables ni se ejecutó una publicación. La configuración remota y el despliegue se realizarán cuando el propietario lo autorice. No se afirma que el sitio actualmente publicado ya tenga este cambio.

## Verificaciones ejecutadas

| Verificación | Resultado |
| --- | --- |
| `npm run lint` | PASS |
| `npm run build` | PASS, build normal de producción |
| `npm test` | PASS, 18/18 |
| `node scripts/check-production-secrets.mjs` | PASS, 69 archivos; ocho valores DEMO incluidos y sin patrones de claves privadas/servidor/service_role |
| Auth y perfiles activos de los cuatro roles en Supabase | PASS, sin modificar cuentas |
| Cuatro enlaces del footer en navegador integrado | PASS: precarga, ingreso manual al panel esperado y cierre de sesión |
| Responsive a 390 / 768 / 1440 px | PASS: cuatro tarjetas, distribución de 1 / 2 / 4 columnas y sin desborde horizontal |
| `git diff --check` | PASS |
| Revisión local de archivos candidatos de ambos repositorios | Sin archivos de entorno ni contraseñas DEMO reales o patrones de claves privadas/servidor en los archivos candidatos |

Rutas verificadas tras ingreso manual: Superadministrador `/privado/solicitudes`; Docente `/docentes`; Familia `/familias`; Estudiante `/alumnos`. Antes de pulsar “Iniciar sesión”, los enlaces permanecieron en el login con el aviso de credenciales precargadas.

Por la sincronización de OneDrive, las herramientas de frontend se ejecutaron en `C:/Users/juanm/AppData/Local/educar-stage4-frontend`, copia local con el mismo lockfile y contenido verificado de 169 archivos de fuentes, recursos, tests y configuración. SHA-256 del manifiesto: `a510a29d93e6c5b1652b309cbbf7402395cccdc2668f3cbb0698391aaacc873b`. Los cambios permanecen en el repositorio original.

El navegador integrado probó el build `dist` mediante preview en `http://127.0.0.1:4175/`. El frontend de desarrollo permanece en `http://127.0.0.1:5175/`. Evidencias locales ignoradas en `tmp/demo-public-evidence/`: logs de lint/build/tests, resultados de botones y responsive y captura del footer de producción.

## Estado de entrega

Se conservaron los cambios acumulados anteriores. Esta solicitud solamente modificó archivos del frontend y esta documentación. No se creó ningún commit, no se hizo push y no se ejecutó deploy. Queda pendiente la autorización para publicar y configurar los valores DEMO en el proyecto Vercel existente.
