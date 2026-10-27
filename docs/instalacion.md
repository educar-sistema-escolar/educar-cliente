# Instalación y configuración

## Requisitos

- Git y npm. Utilizar `npm ci` para respetar `package-lock.json`.
- **Node 22.17.1** es la referencia comprobada. No hay un campo `engines` propio en `package.json`: Vite 8 declara `^20.19.0 || >=22.12.0`, pero las pruebas también utilizan `--experimental-strip-types`. No asumir que cualquier Node 20 sirve para toda la suite.
- Navegador moderno y Chromium para las pruebas Playwright.
- Proyecto Supabase de desarrollo con esquema, políticas y cuentas aprovisionados.

## Preparar el frontend

Desde la carpeta que contiene `package.json`:

```powershell
npm ci
Copy-Item .env.example .env.local
```

En una terminal POSIX, la copia equivalente es `cp .env.example .env.local`. Los comandos `npm` son iguales en ambos entornos.

Editar `.env.local` con valores del entorno de desarrollo, sin publicarlos:

```dotenv
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Ejecutar `npm run dev` y abrir la URL indicada por Vite. Reiniciar el servidor al modificar variables. `npm run build` genera `dist/`; `npm run preview` revisa esa compilación, pero no es un servidor de producción.

## Configuración pública y privada

| Variable o grupo | Uso y exposición |
|---|---|
| `VITE_SUPABASE_URL` | URL pública del proyecto |
| `VITE_SUPABASE_ANON_KEY` | Clave pública de cliente; los datos deben quedar limitados por JWT y RLS |
| `VITE_DEMO_SUPERADMIN_EMAIL`, `VITE_DEMO_SUPERADMIN_PASSWORD` | Credenciales de demostración publicadas en la interfaz si están configuradas |
| `VITE_DEMO_TEACHER_EMAIL`, `VITE_DEMO_TEACHER_PASSWORD` | Cuenta docente de demostración pública |
| `VITE_DEMO_FAMILY_EMAIL`, `VITE_DEMO_FAMILY_PASSWORD` | Cuenta familiar de demostración pública |
| `VITE_DEMO_STUDENT_EMAIL`, `VITE_DEMO_STUDENT_PASSWORD` | Cuenta estudiantil de demostración pública |

Las ocho variables DEMO son opcionales para el arranque y figuran en [demo.env.example](../demo.env.example). Las tarjetas están disponibles también en compilaciones normales de producción: **esas credenciales no son secretas**. Utilizar exclusivamente cuentas y datos ficticios deliberadamente públicos, nunca cuentas de personas reales.

Toda variable `VITE_*` puede terminar en el código descargado por el navegador. `.env.local` está ignorado por Git, pero eso no convierte sus valores en secretos al compilar. No introducir `service_role`, claves privadas, contraseñas administrativas reales ni claves de proveedores en el frontend.

## Backend y cuentas institucionales

El [servidor](https://github.com/educar-sistema-escolar/educar-servidor) es Supabase-first: no incluye una API Node propia ni un `package.json` raíz que instalar para iniciar esta web. El proxy `/auth` y `/students` a `localhost:8080` que permanece en `vite.config.ts` no sustituye Supabase para los portales actuales.

Un responsable del backend debe verificar:

1. Migraciones compatibles con el cliente y políticas RLS habilitadas.
2. Usuario Auth y perfil activo: `is_active = true`, `account_status = 'active'`, rol reconocido.
3. Persona vinculada al perfil y registro de alumno/docente o vínculos familiares según corresponda.
4. Cursos, materias, ciclos y asignaciones necesarios para cada portal.
5. URL del sitio y redirecciones de Auth para invitaciones y recuperación; el cliente utiliza `/login?mode=reset`.

El alta institucional se realiza desde administración mediante `admin-provision-user`, no modificando almacenamiento local. La función requiere configuración Supabase y `SUPABASE_SERVICE_ROLE_KEY` solo en servidor; revisar sus instrucciones antes de desplegarla.

No reiniciar la base ni aplicar todas las migraciones a ciegas para resolver un error de acceso. Conciliar primero el historial del entorno con el repositorio; ver [operación](despliegue.md).

## Diagnóstico rápido

| Síntoma | Comprobar |
|---|---|
| Falta configuración Supabase | Ambas variables, archivo en la raíz y reinicio de Vite |
| Credenciales correctas sin acceso | Perfil activo, estado y rol; una sesión Auth no basta |
| Sin legajo o materias | Vinculaciones y asignaciones del dominio |
| Saludo genérico | Persona activa vinculada y nombre real; el correo no se utiliza como nombre |
| Carga al recuperar la ventana | Revalidación de sesión; la carga neutra no elimina los controles |
| Ruta interna falla al recargar | Regla SPA del alojamiento |

Siguiente paso: [arquitectura](arquitectura.md).
