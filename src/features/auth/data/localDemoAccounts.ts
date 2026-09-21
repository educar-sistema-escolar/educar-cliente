import type { LocalDemoAccount } from '../types';

export const localDemoAccounts: LocalDemoAccount[] = [
  {
    email: 'director@educar.com',
    password: 'programacion2026',
    name: 'Director Demo',
    role: 'superadmin',
    summary: 'Superadministrador institucional con acceso al panel de administración.',
    avatar:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200',
    highlights: [
      'Gestión de solicitudes de inscripción',
      'Moderación de contenidos públicos',
      'Administración de cuentas del sistema',
    ],
    department: 'Dirección',
  },
  {
    email: 'docente@educar.com',
    password: 'programacion2026',
    name: 'Prof. Laura Benitez',
    role: 'teacher',
    summary: 'Docente de Ciencias Sociales y referente del ciclo superior.',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
    highlights: [
      'Avisos institucionales del trimestre',
      'Recursos sugeridos para acompanamiento escolar',
      'Acceso rapido a noticias y bienestar',
    ],
    department: 'Ciencias Sociales',
  },
  {
    email: 'familia@educar.com',
    password: 'programacion2026',
    name: 'Ana Gomez',
    role: 'parent',
    summary: 'Madre responsable de Juan Demo dentro del flujo institucional.',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
    highlights: [
      'Seguimiento general del estudiante',
      'Canales institucionales para consultas',
      'Recordatorios y novedades del colegio',
    ],
    childName: 'Juan Demo',
    childLevel: 'Secundaria',
    childCourse: '1ro A',
    relation: 'Madre',
  },
];
