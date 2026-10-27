# Pruebas y estado de CI/CD

## Comprobaciones disponibles

Existen pruebas ejecutables, pero **no se encontraron workflows de CI versionados** en los repositorios revisados. El código no acredita que cada push ejecute la suite o bloquee merges. La configuración externa del alojamiento debe verificarse por separado.

Desde la raíz del frontend:

| Comando | Alcance |
|---|---|
| `npm test` | Node: acceso DEMO, reglas académicas/deportivas, informes y docentes |
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

## CI/CD pendiente

Un pipeline futuro debería instalar, comprobar tipos/lint, ejecutar pruebas, compilar y desplegar únicamente un candidato aprobado; después, verificar rutas y roles. Es una recomendación, **no infraestructura implementada** por esta documentación.

Los informes históricos conservan ejecuciones anteriores: no sumar sus conteos como cobertura independiente ni presentarlos como una ejecución actual. Esta actualización documental verifica comandos y referencias, sin volver a ejecutar las suites funcionales.
