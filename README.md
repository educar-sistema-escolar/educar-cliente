# Educar para Transformar — plataforma web

Aplicación institucional para consultar y gestionar el recorrido escolar: sitio público, administración, portal docente, portal de estudiantes y portal de familias. Este repositorio contiene el **frontend**; la base de datos, las políticas de acceso y las funciones de servidor se mantienen por separado.

## Comenzar

1. Instalar Git, npm y una versión compatible de Node.js. La referencia utilizada es **Node 22.17.1**; consultar [instalación](docs/instalacion.md).
2. Clonar e instalar:

```sh
git clone https://github.com/educar-sistema-escolar/educar-cliente.git
cd educar-cliente
npm ci
```

3. Copiar `.env.example` a `.env.local`, configurar el proyecto Supabase de desarrollo y ejecutar `npm run dev`. En PowerShell:

```powershell
Copy-Item .env.example .env.local
npm run dev
```

La terminal muestra la dirección local. Las páginas públicas no requieren iniciar sesión; los portales necesitan una cuenta institucional activa y sus vinculaciones. Configurar variables **no crea** usuarios ni aplica migraciones.

## Elegir una guía

| Necesidad | Documento |
|---|---|
| Preparar el entorno y las cuentas | [Instalación y configuración](docs/instalacion.md) |
| Comprender módulos, rutas y límites | [Arquitectura y funcionalidades](docs/arquitectura.md) |
| Ejecutar y comprender las pruebas | [Pruebas y estado de CI/CD](docs/pruebas.md) |
| Publicar y mantener el sistema | [Despliegue y operación](docs/despliegue.md) |

## Módulos principales

| Área | Acceso | Capacidades |
|---|---|---|
| Sitio institucional | Público | Información, noticias, opiniones, contacto, empleo y solicitud de inscripción |
| Administración | `superadmin` | Cuentas, estructura académica, inscripciones, servicios, facturación y reportes |
| Docentes | `teacher` | Materias, estudiantes, calificaciones, exportación CSV y agenda |
| Estudiantes | `student` | Notas, horarios, servicios, foro y asistente de ayuda de solo consulta |
| Familias | `parent` / `guardian` | Fichas vinculadas, información académica y solicitudes de servicios |

**No todo utiliza el mismo almacenamiento.** Noticias, opiniones y comentarios públicos tienen implementaciones locales en el navegador; contacto y empleo preparan correos. No deben confundirse con operaciones persistidas en Supabase. Ver [límites funcionales](docs/arquitectura.md).

## Tecnología y repositorios

- React 19, TypeScript 6, Vite 8 y React Router 7.
- Tailwind CSS 4, componentes propios, Lucide y Framer Motion.
- Supabase Auth, PostgreSQL, RPC y Edge Functions.
- Node Test Runner y Playwright para verificación automatizable.

| Repositorio | Responsabilidad |
|---|---|
| [educar-cliente](https://github.com/educar-sistema-escolar/educar-cliente) | Aplicación web, pruebas y estas guías |
| [educar-servidor](https://github.com/educar-sistema-escolar/educar-servidor) | Migraciones SQL, RLS, funciones y operación del backend |

## Alcance documental

Referencia: frontend `baa0ae8` y backend `main` en `01c2be8`, revisados el 27 de octubre de 2026. Las guías describen lo versionado; no certifican configuración ni disponibilidad remotas.

Los informes `RESUMEN_ETAPA_*`, auditorías anteriores y [contratos históricos del chatbot](tests/chatbot/README.md) conservan evidencia de etapas concretas. Para el estado actual, comenzar por estas guías; un resultado histórico no sustituye una ejecución nueva.
