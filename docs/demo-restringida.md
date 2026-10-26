# Accesos DEMO públicos en producción

Decisión vigente del propietario, 26/10/2026: las cuatro cuentas académicas DEMO se muestran públicamente también en el build normal de Vercel. Esta decisión reemplaza las instrucciones anteriores de este documento sobre una presentación restringida.

El footer conserva cuatro tarjetas azul oscuro, con rol, correo, contraseña y botón Usar credenciales. Cada botón abre `/login?demo=superadmin|teacher|family|student`; precarga los campos y la persona pulsa Iniciar sesión. No se inicia sesión automáticamente.

Configurar en el proyecto Vercel existente, entorno Production (y Preview si se utiliza):

- `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`: configuración pública existente de Supabase.
- `VITE_DEMO_SUPERADMIN_EMAIL` y `VITE_DEMO_SUPERADMIN_PASSWORD`.
- `VITE_DEMO_TEACHER_EMAIL` y `VITE_DEMO_TEACHER_PASSWORD`.
- `VITE_DEMO_FAMILY_EMAIL` y `VITE_DEMO_FAMILY_PASSWORD`.
- `VITE_DEMO_STUDENT_EMAIL` y `VITE_DEMO_STUDENT_PASSWORD`.

Usar los valores DEMO existentes de `.env.local`, comprobados en Supabase CentroEducativo. No se incluyen sus valores en archivos versionados. Las ocho variables DEMO son deliberadamente públicas: Vite las incorpora al JavaScript del navegador. No se requieren `VITE_DEMO_ACCESS_ENABLED`, `VITE_DEMO_FAMILY_VERIFIED`, un modo especial ni autenticación previa para ver las tarjetas.

Build normal: `npm run build`; salida `dist`. Comprobar con `node scripts/check-production-secrets.mjs`: exige las ocho variables DEMO en el build y rechaza claves privadas, claves Supabase de servidor y JWT service_role. Los archivos `.env` y `.local` permanecen ignorados. Nunca configurar secretos de servidor con prefijo VITE_.

No se aplica la plantilla histórica `demo.nginx.conf` a este despliegue. No hace falta `build:demo`; el build normal contiene las tarjetas.

La configuración remota y la publicación siguen pendientes de autorización del propietario. Este cambio de código no hace commit, push ni deploy, ni modifica cuentas o contraseñas.
