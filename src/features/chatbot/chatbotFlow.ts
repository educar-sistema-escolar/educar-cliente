export type ChatView = 'home' | 'transport' | 'myTransport' | 'transportHelp' | 'sports' | 'mySports' | 'sportsHelp' | 'sections';

export type ChatDestination = 'notes' | 'schedule' | 'services' | 'forum' | 'news';
export type ChatAction = ChatView | ChatDestination | 'back' | 'close';

export type ChatNavigationTarget = Readonly<
  | { pathname: '/alumnos'; section: 'notes'; heading: 'Materias y calificaciones' }
  | { pathname: '/alumnos'; section: 'schedule'; heading: 'Horario de clases' }
  | { pathname: '/alumnos'; section: 'services'; heading: 'Servicios activos' }
  | { pathname: '/alumnos/foro' | '/noticias' }
>;

export type ChatEffect = Readonly<
  | { type: 'none' }
  | { type: 'lookup'; topic: 'transport' | 'sports' }
  | { type: 'close' }
  | { type: 'navigate'; target: ChatNavigationTarget; close: true }
>;

export interface ChatButton {
  readonly action: ChatAction;
  readonly label: string;
}

export interface ChatScreen {
  readonly message: string;
  readonly buttons: readonly ChatButton[];
}

export interface ChatTransition {
  readonly view: ChatView;
  readonly effect: ChatEffect;
}

const screenDefinitions: Record<ChatView, ChatScreen> = {
  home: {
    message: 'Puedo ayudarte a consultar tu transporte, tus deportes o encontrar una sección del portal. ¿Qué necesitas?',
    buttons: [
      { action: 'transport', label: 'Transporte' },
      { action: 'sports', label: 'Deportes' },
      { action: 'sections', label: 'Encontrar una sección' },
    ],
  },
  transport: {
    message: '¿Qué quieres consultar sobre transporte?',
    buttons: [
      { action: 'myTransport', label: 'Ver mi transporte' },
      { action: 'transportHelp', label: 'Solicitar o cambiar transporte' },
    ],
  },
  myTransport: {
    message: 'Estos son los datos de tu transporte registrado:',
    buttons: [{ action: 'services', label: 'Ver mis servicios' }],
  },
  transportHelp: {
    message: 'Para consultar disponibilidad, solicitar transporte o cambiar tu parada, comunícate con administración. Este asistente no realiza solicitudes ni cambios.',
    buttons: [{ action: 'myTransport', label: 'Ver mi transporte' }],
  },
  sports: {
    message: '¿Qué quieres consultar sobre deportes?',
    buttons: [
      { action: 'mySports', label: 'Ver mis deportes' },
      { action: 'sportsHelp', label: 'Quiero inscribirme' },
    ],
  },
  mySports: {
    message: 'Estos son tus deportes registrados:',
    buttons: [{ action: 'services', label: 'Ver mis servicios' }],
  },
  sportsHelp: {
    message: 'Consulta con administración qué deportes tienen inscripción abierta, sus requisitos y horarios. Este asistente no confirma cupos ni realiza inscripciones.',
    buttons: [],
  },
  sections: {
    message: '¿Qué sección quieres abrir?',
    buttons: [
      { action: 'notes', label: 'Mis notas' },
      { action: 'schedule', label: 'Mis horarios' },
      { action: 'services', label: 'Mis servicios' },
      { action: 'forum', label: 'Foro estudiantil' },
      { action: 'news', label: 'Novedades' },
    ],
  },
};

const parentViews: Record<Exclude<ChatView, 'home'>, ChatView> = {
  transport: 'home', myTransport: 'transport', transportHelp: 'transport',
  sports: 'home', mySports: 'sports', sportsHelp: 'sports', sections: 'home',
};

// Sections currently have headings, not DOM anchors; a future navigation adapter resolves them.
const navigationTargets: Record<ChatDestination, ChatNavigationTarget> = {
  notes: { pathname: '/alumnos', section: 'notes', heading: 'Materias y calificaciones' },
  schedule: { pathname: '/alumnos', section: 'schedule', heading: 'Horario de clases' },
  services: { pathname: '/alumnos', section: 'services', heading: 'Servicios activos' },
  forum: { pathname: '/alumnos/foro' },
  news: { pathname: '/noticias' },
};

export function getChatScreen(view: ChatView, studentName = ''): ChatScreen {
  const definition = screenDefinitions[view];
  return {
    message: view === 'home' ? `Hola, ${(!studentName.includes('@') && studentName.trim()) || 'estudiante'}. ${definition.message}` : definition.message,
    buttons: [
      ...definition.buttons.map(button => ({ ...button })),
      { action: 'home', label: 'Inicio' },
      ...(view === 'home' ? [] : [{ action: 'back' as const, label: 'Volver' }]),
      { action: 'close', label: 'Cerrar' },
    ],
  };
}

export function transitionChat(view: ChatView, action: unknown): ChatTransition {
  const button = getChatScreen(view).buttons.find(candidate => candidate.action === action);
  if (!button) return { view, effect: { type: 'none' } };

  switch (button.action) {
    case 'home': return { view: 'home', effect: { type: 'none' } };
    case 'close': return { view: 'home', effect: { type: 'close' } };
    case 'back': return { view: view === 'home' ? 'home' : parentViews[view], effect: { type: 'none' } };
    case 'transport':
    case 'transportHelp':
    case 'sports':
    case 'sportsHelp':
    case 'sections': return { view: button.action, effect: { type: 'none' } };
    case 'myTransport': return { view: 'myTransport', effect: { type: 'lookup', topic: 'transport' } };
    case 'mySports': return { view: 'mySports', effect: { type: 'lookup', topic: 'sports' } };
    default: return { view: 'home', effect: { type: 'navigate', target: { ...navigationTargets[button.action] }, close: true } };
  }
}
