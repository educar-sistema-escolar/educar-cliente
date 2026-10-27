# Pruebas y estado de CI/CD

## Comprobaciones disponibles

El frontend incluye [un workflow de GitHub Actions](../.github/workflows/ci.yml) para ejecutar automáticamente los controles. La publicación del archivo no acredita una ejecución remota aprobada: comprobar el resultado en la pestaña **Actions** para cada commit.

Desde la raíz del frontend:

| Comando | Alcance |
|---|---|
| `npm test` | Node: contrato CI/CD, acceso DEMO, reglas académicas/deportivas, informes y docentes |
| `npm run test:existing` | Subconjunto docente; se superpone con `npm test` |
| `npm run test:chatbot:unit` | Auth, nombre visible, repositorio, flujos, consultas y navegación |
| `npm run test:chatbot:check` | Tipos de pruebas JS/TS y ESLint del arnés |
| `npm run test:chatbot:component` | Ventana del chatbot aislada en navegador |
| `npm run test:chatbot:browser` | Aplicación compilada en Chromium con red sintética |
| `npm run lint` | Análisis estático del proyecto |
| `npm run build` | TypeScript y compilación Vite |

Las pruebas utilizan los flags Node de `package.json`; consultar [requisitos](instalacion.md). Una importación fallida o un navegador ausente es un problema de preparación, no prueba de comportamiento del producto.

## Verificación local

```sh
npm ci
npx playwright install chromium
npm test
npm run test:chatbot:unit
npm run test:chatbot:check
npm run lint
npm run build
npm run test:chatbot:component
node node_modules/@playwright/test/cli.js test --workers=1
```

La última línea utiliza la configuración integrada de `test:chatbot:browser`, con un worker. La invocación directa evita problemas de reenvío de argumentos observados en PowerShell. Ejecutar las suites de navegador **secuencialmente**, sin otro build o preview concurrente.

El arnés integrado compila y sirve automáticamente en `127.0.0.1:4178`; componentes utiliza `127.0.0.1:4180`. Requieren puertos libres. La configuración integrada inyecta URL y clave sintéticas; no necesita credenciales reales.

## Cobertura y límites

Se cubren botones/flujos, consultas personales, campos ausentes, vacío/error/reintento, cancelación, cambio de cuenta, exclusión por rol, navegación con foco, teclado y tamaños móviles. Hay regresiones de nombre, correo duplicado, colores y búsqueda administrativa.

- Las pruebas unitarias ejecutan módulos reales con la frontera Supabase sustituida.
- Las integradas abren la aplicación real e interceptan HTTP: no prueban RLS alojada ni disponibilidad de Supabase.
- Un viewport móvil de Chromium no sustituye dispositivos físicos ni otros navegadores.
- No hay garantía de cobertura total; seleccionar escenarios y registrar resultados por cambio.

`test-results/`, ignorado por Git, contiene JSON, capturas y trazas. Las salidas `browser` y `component` están separadas. No publicar artefactos que contengan datos personales.

## Verificación del backend

Se ejecuta desde el servidor, con requisitos propios; no hay un `npm test` raíz equivalente. En su `main`:

- `tests/pg-finance.test.mjs` crea PostgreSQL temporal y verifica reglas financieras/RLS. Requiere binarios y admite `TEST_PG_BIN`.
- `tests/billing-reminders.test.mjs` sustituye fronteras de la función y actualmente importa TypeScript desde el repositorio móvil hermano: no es autosuficiente al clonar solo servidor.
- Las aceptaciones SQL necesitan una base preparada y revisión previa; no asumir que son inocuas sobre producción.

Las pruebas `tests/chatbot-*.test.mjs` de `feat/chatbot-tests` no están en el `main` del servidor revisado. No confundir resultados de esa rama con una suite publicada. Para permisos reales, utilizar un entorno aislado y sus roles, nunca credenciales privilegiadas en el navegador.

## GitHub Actions

Se ejecuta en cualquier push, pull requests hacia `main` y manualmente con **Run workflow**. Utiliza Ubuntu, Node 22.17.1, `npm ci` y caché de npm; cancela ejecuciones anteriores de la misma referencia.

| Trabajo | Controles |
|---|---|
| `Quality and build` | Lint, `npm test`, unitarias del chatbot, comprobación de tipos/arnés y build |
| `Chromium integration` | Instala Chromium y dependencias Linux; ejecuta componentes y aplicación completa, secuencialmente y con un worker |
| `Deploy production` | Solo push a `main`, ambos trabajos aprobados y activación expresa; ver [requisitos de CD](despliegue.md#activar-cd-en-github-actions) |

Las comprobaciones no usan secretos de producción. La compilación de control y el arnés integrado utilizan configuración sintética; **no se publica ese build**. Los resultados JSON, capturas y trazas sintéticas se conservan como artefactos durante siete días. No se suben archivos `.env`, dependencias ni salidas de Vercel.

El workflow tiene permisos de lectura y las acciones oficiales están fijadas por SHA; revisar esas referencias y las versiones de Node/CLI al actualizar dependencias. El contrato `tests/ci-workflow.test.mjs` protege disparadores, comandos y separación del despliegue; no sustituye el validador de GitHub ni una ejecución real en Linux.

Para impedir merges fallidos, un administrador debe configurar protección de `main` o un ruleset y exigir `Quality and build` y `Chromium integration` tras su primera ejecución. **El archivo no modifica esa protección.** Los pushes directos autorizados también pueden haber actualizado `main` antes de terminar CI.

El backend es otro repositorio: estas acciones no aplican migraciones, prueban RLS real ni despliegan Edge Functions. Sus pruebas necesitan un pipeline propio y preparación aislada.

Los informes históricos conservan ejecuciones anteriores: no sumar sus conteos como cobertura independiente ni presentarlos como una ejecución actual.
