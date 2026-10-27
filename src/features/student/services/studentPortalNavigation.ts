import type { ChatNavigationTarget } from '../../chatbot/chatbotFlow';

export const studentSectionIds = {
  notes: 'student-notes', schedule: 'student-schedule', services: 'student-services',
} as const;

export function studentPortalDestination(target: ChatNavigationTarget) {
  if (target.pathname === '/alumnos' && 'section' in target && Object.hasOwn(studentSectionIds, target.section)) {
    return { pathname: '/alumnos', hash: `#${studentSectionIds[target.section]}` };
  }
  if (target.pathname === '/alumnos/foro' || target.pathname === '/noticias') return { pathname: target.pathname };
  return null;
}

export function studentSectionFromHash(hash: string): string | null {
  return Object.values(studentSectionIds).find(id => hash === `#${id}`) ?? null;
}
