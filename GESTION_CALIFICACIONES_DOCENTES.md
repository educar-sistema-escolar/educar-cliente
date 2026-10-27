# Gestión de calificaciones docentes

La interfaz docente permite cargar y editar notas por alumno y período, con observación opcional. Se conserva la escala existente de 0 a 10 y los períodos 1 a 4. Cada matrícula por materia admite una nota por período.

La migración `20261026190000_teacher_grade_management.sql` se aplicó al proyecto Supabase `nhwsgmijdsxzuxgpllhy` mediante el editor SQL. Agrega autor y último editor e incorpora una RPC que comprueba la asignación docente y la matrícula activa. El docente puede editar únicamente notas que creó. Administración puede consultar y corregir notas y consultar los eventos previos; Alumno y Familia conservan acceso de lectura según sus vínculos. Las notas antiguas sin autor conocido no se atribuyeron retroactivamente; los eventos de auditoría anteriores siguen disponibles.

## Verificaciones

- Navegador integrado y Supabase real: un docente cargó y editó la nota DEMO de Emilia (8 → 9); Administración consultó su historial y la corrigió a 9,25. Familia visualizó 9,25 con su observación. El estudiante DEMO Alma visualizó su propia nota 8. Ambas notas DEMO quedaron disponibles para la presentación.
- SQL real con transacción revertida: Familia y Alumno pueden leer únicamente la nota autorizada y no escribir; otro docente ficticio no puede modificar una nota ajena; se rechazaron la matrícula inexistente, el duplicado y la nota fuera de escala. El segundo docente no tenía asignación; la prueba local también cubre el rechazo tras asignar la materia al otro docente.
- Frontend: `npm run lint`, `npm run build` y `npm test` (19/19). Backend: `node --test tests/*.test.mjs` (20/20), incluida la prueba específica de PostgreSQL para permisos y autoría.
- Navegador integrado: formulario docente probado a 390, 768 y 1440 px sin desbordamiento horizontal; Tab y retorno del foco al cancelar. No se ejecutó axe-core ni una auditoría completa WCAG.
- Se corrigió la normalización de relaciones académicas que impedía a Administración ver los nombres de alumno, curso y materia. Si el nombre del perfil está vacío, se muestra su correo como identificación.
- El control de secretos del build no detectó claves privadas o de servidor; conserva las cuatro tarjetas DEMO.

## Límites

- La migración se aplicó manualmente desde el editor SQL y está versionada en el repositorio backend; no se verificó su registro en la tabla de historial del CLI de Supabase.
- La revisión visual se centró en el formulario docente; no constituye una auditoría completa de todos los paneles.
- Los resultados finales de commits, push y despliegue se informan en la entrega final y en el informe de cierre del espacio de trabajo.
