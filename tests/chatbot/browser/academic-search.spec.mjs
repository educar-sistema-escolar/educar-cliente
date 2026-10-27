import { test, expect } from './app-fixture.mjs';

test('enrollment search keeps native keyboard selection and clears filtered-out identifiers', async ({ app, page }) => {
  app.state.role = 'superadmin';
  await page.route('**/rest/v1/**', route => {
    const request = route.request();
    const table = new URL(request.url()).pathname.split('/').pop();
    if (request.method() !== 'GET') return route.fallback();
    const person = { first_name: 'José', last_name: 'Pérez', dni: '30111222', is_active: true };
    const rows = {
      students: [{ id: 's1', student_number: 'LEG-01', is_active: true, person }, { id: 's2', student_number: 'LEG-02', is_active: true, person: { ...person, dni: '30333444' } }],
      courses: [{ id: 'c1', name: 'Séptimo A', is_active: true }],
      course_subjects: [{ id: 'cs1', course_id: 'c1', is_active: true, subject: { name: 'Matemática' } }],
      student_subject_enrollments: [], academic_schedules: [],
    };
    return table in rows ? route.fulfill({ json: rows[table] }) : route.fallback();
  });
  await page.goto('/privado/registros-academicos');
  const section = page.getByRole('heading', { name: 'Inscripción alumno-materia', exact: true }).locator('..');
  const studentSearch = section.getByRole('searchbox', { name: 'Buscar alumno' });
  const student = section.getByRole('combobox', { name: 'Alumno', exact: true });
  await expect(studentSearch).toBeVisible({ timeout: 10000 });
  await studentSearch.fill('jose perez');
  await expect(student.getByRole('option')).toHaveCount(3);
  await studentSearch.fill('leg-02');
  await expect(student.getByRole('option')).toHaveCount(2);
  await student.selectOption('s2');
  await studentSearch.fill('30111222');
  await expect(student).toHaveValue('');
  await expect(student.getByRole('option', { name: /LEG-01/ })).toHaveCount(1);
  await student.focus(); await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
  await expect(student).toHaveValue('s1');
  await studentSearch.fill('inexistente');
  await expect(section.getByRole('status', { name: 'Resultados de alumnos' })).toHaveText('No se encontraron alumnos.');
  await expect(student).toHaveValue('');
  const subjectSearch = section.getByRole('searchbox', { name: 'Buscar materia' });
  await subjectSearch.fill('matematica');
  const subject = section.getByRole('combobox', { name: 'Materia', exact: true });
  await expect(subject.getByRole('option')).toHaveCount(2);
  await subjectSearch.fill('septimo'); await subject.selectOption('cs1');
  await subjectSearch.fill('inexistente'); await expect(subject).toHaveValue('');
  await expect(section.getByRole('status', { name: 'Resultados de materias' })).toHaveText('No se encontraron materias.');
  await section.getByRole('button', { name: 'Inscribir', exact: true }).click();
  await expect(page.locator('main')).toContainText('Seleccioná alumno y materia.');
});
