export type DemoCredential = { email: string; password: string };

export type DemoAccessCard = {
  id: 'superadmin' | 'teacher' | 'family' | 'student';
  role: string;
  available: true;
  email: string;
  password: string;
} | {
  id: 'superadmin' | 'teacher' | 'family' | 'student';
  role: string;
  available: false;
  email: null;
  password: null;
  message: string;
};

type DemoAccessConfig = {
  superadmin?: DemoCredential;
  teacher?: DemoCredential;
  student?: DemoCredential;
  family?: DemoCredential;
};

export function getDemoAccessCards(config: DemoAccessConfig): DemoAccessCard[] {
  const definitions = [
    {
      id: 'superadmin' as const,
      role: 'Superadministrador',
      credentials: config.superadmin,
      message: 'Cuenta de demostración sin configurar en este entorno.',
    },
    {
      id: 'teacher' as const,
      role: 'Docente',
      credentials: config.teacher,
      message: 'Cuenta de demostración sin configurar en este entorno.',
    },
    {
      id: 'family' as const,
      role: 'Familia',
      credentials: config.family,
      message: 'Cuenta de demostración sin configurar en este entorno.',
    },
    {
      id: 'student' as const,
      role: 'Estudiante',
      credentials: config.student,
      message: 'Cuenta de demostración sin configurar en este entorno.',
    },
  ];

  return definitions.map(({ credentials, message, ...card }) => {
    if (credentials?.email.trim() && credentials.password) {
      return {
        ...card,
        available: true,
        email: credentials.email.trim(),
        password: credentials.password,
      };
    }

    return { ...card, available: false, email: null, password: null, message };
  });
}

export function getConfiguredDemoAccessCards(): DemoAccessCard[] {
  return getDemoAccessCards({
    family: {
      email: import.meta.env.VITE_DEMO_FAMILY_EMAIL || '',
      password: import.meta.env.VITE_DEMO_FAMILY_PASSWORD || '',
    },
    superadmin: {
      email: import.meta.env.VITE_DEMO_SUPERADMIN_EMAIL || '',
      password: import.meta.env.VITE_DEMO_SUPERADMIN_PASSWORD || '',
    },
    teacher: {
      email: import.meta.env.VITE_DEMO_TEACHER_EMAIL || '',
      password: import.meta.env.VITE_DEMO_TEACHER_PASSWORD || '',
    },
    student: {
      email: import.meta.env.VITE_DEMO_STUDENT_EMAIL || '',
      password: import.meta.env.VITE_DEMO_STUDENT_PASSWORD || '',
    },
  });
}
