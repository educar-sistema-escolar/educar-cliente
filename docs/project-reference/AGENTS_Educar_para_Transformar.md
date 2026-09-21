# AGENTS.md — Educar para Transformar

Este archivo define reglas obligatorias para cualquier desarrollador o agente de IA que modifique el proyecto.

## 1. Principios generales

- Mantener código simple, legible, modular y fácil de mantener.
- Aplicar separación de responsabilidades.
- Favorecer bajo acoplamiento y alta cohesión.
- Aplicar principios SOLID de forma práctica, sin sobrearquitectura.
- No realizar refactors masivos si no son necesarios para la Issue actual.
- No modificar código fuera del alcance solicitado.
- Respetar la estructura y tecnologías existentes del proyecto.

## 2. Organización de carpetas

Estructura principal del frontend:

```text
src/
├── pages/
├── features/
├── shared/
└── App.tsx
```

### `pages/`

Contiene páginas o vistas completas.

Las páginas deben encargarse principalmente de:

- composición visual;
- navegación;
- conectar componentes;
- mostrar estados de carga, error, vacío y éxito.

No deben concentrar toda la lógica de negocio.

### `features/`

Contiene funcionalidades del dominio.

Ejemplo:

```text
features/
└── deportes/
    ├── components/
    ├── services/
    ├── repositories/
    ├── types.ts
    └── validations.ts
```

No mezclar lógica de deportes con transporte, alumnos, profesores u otros dominios.

### `shared/`

Solo debe contener elementos realmente reutilizables por varias features.

Ejemplo:

```text
shared/
├── components/
├── hooks/
├── lib/
├── types/
└── utils/
```

No mover componentes a `shared` si solo se utilizan en una pantalla o feature.

## 3. Componentes React

- Evitar componentes demasiado grandes.
- Dividir componentes cuando tengan varias responsabilidades.
- Antes de crear un componente nuevo, revisar si ya existe uno reutilizable.
- Reutilizar mediante props cuando tenga sentido.
- Evitar copiar y pegar componentes similares.

No duplicar innecesariamente:

- botones;
- inputs;
- modales;
- tablas;
- alerts;
- loaders;
- cards;
- formularios similares.

## 4. Estilos

- No utilizar un único archivo CSS gigante para toda la aplicación.
- Usar Tailwind CSS como solución principal de estilos.
- Mantener estilos globales solo para reset, tipografía, variables, tema y comportamiento general.
- No crear reglas CSS globales específicas para una sola pantalla.
- Si un patrón visual se repite, convertirlo en componente reutilizable.

## 5. TypeScript

- Utilizar TypeScript correctamente.
- Evitar `any` salvo justificación explícita.
- Preferir tipos e interfaces descriptivos.
- No duplicar interfaces equivalentes en distintos archivos.
- Los tipos propios de una feature deben vivir cerca de esa feature.

Ejemplo:

```ts
interface Alumno {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
}
```

## 6. Separación de responsabilidades

Evitar mezclar en un mismo componente presentación, validación, persistencia, consultas a Supabase, reglas de negocio y transformación de datos.

Preferir:

```text
Componente / Página
        ↓
Servicio
        ↓
Repositorio
        ↓
Supabase
```

## 7. Acceso a Supabase

- No dispersar consultas Supabase directamente en componentes de página.
- Encapsular acceso a datos en `services` y/o `repositories`.
- Nunca exponer `service_role` ni secretos en el frontend.
- No subir `.env` al repositorio.
- Mantener `.env.example` con las variables requeridas.

## 8. Reglas de negocio críticas

Las reglas importantes no deben existir únicamente en frontend.

Ejemplos:

- máximo 2 deportes por alumno;
- evitar inscripciones duplicadas;
- evitar conflictos de horario;
- padre/tutor solo accede a sus hijos;
- permisos según rol.

Aplicar protección en:

```text
Frontend → validación UX
Supabase / backend → validación real
PostgreSQL / RLS → integridad y seguridad
```

## 9. Mocks y datos demo

Los mocks son permitidos únicamente como solución temporal.

Todo mock debe estar claramente documentado.

Ejemplo:

```ts
// MOCK TEMPORAL:
// Se utiliza hasta integrar RF-01 con Supabase.
```

Si una Issue usa mocks, documentar:

```text
MOCK: Sí

Motivo:
...

Se elimina cuando:
...
```

No presentar un mock como implementación definitiva.

## 10. localStorage

`localStorage` puede mantenerse únicamente en flujos demo existentes mientras se migran.

No usar `localStorage` como persistencia definitiva para alumnos, profesores, usuarios, roles, inscripciones, contraseñas, datos de menores o información institucional sensible.

La persistencia final debe usar Supabase/PostgreSQL.

## 11. Seguridad

Nunca guardar en frontend:

- `service_role`;
- secretos;
- contraseñas;
- claves privadas;
- tokens administrativos.

Usar Supabase Auth y RLS cuando corresponda.

Aplicar mínimo privilegio.

## 12. Comentarios

Comentar cuando aporte contexto real:

- regla de negocio;
- decisión no evidente;
- limitación;
- workaround;
- mock;
- compatibilidad;
- deuda técnica temporal.

Evitar comentarios obvios.

## 13. Nombres

Usar nombres descriptivos.

Evitar:

```ts
data
temp
item2
x
handleThing
```

Preferir:

```ts
student
selectedSport
transportRoute
enrollmentRequest
handleSportEnrollment
```

Mantener consistencia de idioma dentro del código.

La documentación y GitHub Projects se mantienen en español.

## 14. Funciones

- Una función debe tener una responsabilidad principal.
- Evitar funciones excesivamente largas.
- Separar validación, persistencia y transformación cuando corresponda.

## 15. SOLID

Aplicar SOLID de forma práctica:

### S — Single Responsibility
Cada módulo, función, servicio y componente debe tener una responsabilidad clara.

### O — Open/Closed
Preferir extensión antes que modificar múltiples lugares sin necesidad.

### L — Liskov
Implementaciones de una misma interfaz deben respetar el mismo contrato.

### I — Interface Segregation
No crear interfaces gigantes con métodos innecesarios.

### D — Dependency Inversion
La UI debe depender de contratos/servicios y no directamente de detalles de persistencia.

## 16. DRY

- Evitar repetir lógica.
- Extraer validaciones o utilidades realmente reutilizadas.
- No crear abstracciones innecesarias para código que aparece una sola vez.

## 17. KISS

Preferir soluciones simples.

No agregar patrones, librerías, capas o arquitectura innecesaria.

## 18. Manejo de errores

No ignorar errores.

El usuario debe recibir mensajes comprensibles y no errores técnicos internos.

## 19. Estados de interfaz

Toda operación asíncrona importante debe contemplar:

```text
loading
success
error
empty
```

## 20. Formularios

Los formularios deben:

- validar campos obligatorios;
- impedir doble envío;
- mostrar errores claros;
- manejar loading;
- permitir cancelar cuando corresponda;
- validar nuevamente en backend cuando la regla sea crítica.

## 21. Git

No trabajar directamente sobre `main` ni sobre la rama de integración.

Regla:

```text
1 Issue
=
1 responsable
=
1 rama
=
1 Pull Request
```

Ejemplos:

```text
feat/HU-01-inscripcion-alumno
feat/HU-02-inscripcion-deporte
feat/HU-04-registro-profesor
fix/login-session
```

No mezclar en un mismo PR feature + refactor general + estilos + otra feature.

## 22. Archivos compartidos

Estas zonas se consideran protegidas o compartidas:

```text
src/App.tsx
src/shared/**
package.json
configuración Supabase
tipos globales
```

Modificar solo cuando la Issue realmente lo requiera.

## 23. Migraciones de base de datos

- Cada cambio de esquema debe crear una migración nueva.
- No modificar una migración ya mergeada o aplicada.
- No cambiar silenciosamente nombres de tablas, columnas, enums, estados o relaciones.
- Si cambia un contrato, documentarlo en la Issue y el PR.

## 24. Testing

Cada funcionalidad debe probar como mínimo:

1. caso exitoso;
2. datos inválidos;
3. duplicados si aplica;
4. límites;
5. permisos;
6. error de persistencia;
7. reglas de negocio relevantes.

Herramientas previstas:

```text
Vitest
React Testing Library
Playwright
Postman
Supabase SQL Editor
```

## 25. Reglas específicas para Codex / agentes IA

Antes de modificar código:

1. leer la Issue completa;
2. identificar RF/HU involucrado;
3. identificar archivos permitidos;
4. revisar si la zona pertenece a Martín, Claudio o es compartida;
5. revisar si existe un componente reutilizable;
6. revisar si existen tipos, servicios o repositorios reutilizables.

El agente NO debe:

- modificar funcionalidades ajenas;
- hacer refactors globales;
- cambiar arquitectura sin autorización;
- cambiar tecnologías;
- renombrar carpetas masivamente;
- introducir `any` innecesario;
- agregar dependencias sin justificación;
- eliminar validaciones sin explicación;
- reemplazar Supabase por otra tecnología;
- introducir persistencia sensible en `localStorage`;
- exponer secretos;
- modificar código solo por razones estéticas fuera del alcance de la Issue.

## 26. Antes de finalizar una tarea

Verificar:

```text
[ ] La funcionalidad cumple el RF/HU.
[ ] No se modificaron archivos innecesarios.
[ ] No se duplicaron componentes existentes.
[ ] La lógica está separada de la presentación.
[ ] Los tipos TypeScript son correctos.
[ ] Las reglas críticas están protegidas donde corresponde.
[ ] No se agregaron secretos.
[ ] Los mocks están claramente documentados.
[ ] Se ejecutaron las pruebas necesarias.
[ ] No se rompieron rutas o funcionalidades existentes.
```

Al finalizar, informar:

```text
Archivos modificados:
- ...

Qué se implementó:
- ...

Mocks utilizados:
- ...

Impacto:
- ...

Pruebas realizadas:
- ...

Pendientes:
- ...
```

## Regla de oro

> Antes de crear código nuevo, revisar si ya existe algo reutilizable.
>
> Antes de modificar código compartido, verificar si realmente es necesario.
>
> Antes de agregar lógica a una página, preguntarse si pertenece a un servicio, repository, hook o componente.
>
> Antes de considerar una funcionalidad terminada, verificar que cumple el requerimiento y que no depende silenciosamente de mocks o almacenamiento demo.
