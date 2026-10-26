import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../../src/features/chatbot/chatbotFlow.ts', import.meta.url), 'utf8');
const module = new vm.SourceTextModule(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText, { context: vm.createContext({}) });
await module.link(specifier => { throw new Error(`Pure conversation flow must not import dependencies: ${specifier}`); });
await module.evaluate();
const plain = value => JSON.parse(JSON.stringify(value));
const screen = (view, name = 'Ana Prueba') => plain(Reflect.get(module.namespace, 'getChatScreen')(view, name));
const transition = (view, action) => plain(Reflect.get(module.namespace, 'transitionChat')(view, action));
const none = { type: 'none' };
const views = ['home', 'transport', 'myTransport', 'transportHelp', 'sports', 'mySports', 'sportsHelp', 'sections'];
const definitions = {
  home: ['Hola, Ana Prueba. Puedo ayudarte a consultar tu transporte, tus deportes o encontrar una sección del portal. ¿Qué necesitas?', ['Transporte', 'Deportes', 'Encontrar una sección']],
  transport: ['¿Qué quieres consultar sobre transporte?', ['Ver mi transporte', 'Solicitar o cambiar transporte']],
  myTransport: ['Estos son los datos de tu transporte registrado:', ['Ver mis servicios']],
  transportHelp: ['Para consultar disponibilidad, solicitar transporte o cambiar tu parada, comunícate con administración. Este asistente no realiza solicitudes ni cambios.', ['Ver mi transporte']],
  sports: ['¿Qué quieres consultar sobre deportes?', ['Ver mis deportes', 'Quiero inscribirme']],
  mySports: ['Estos son tus deportes registrados:', ['Ver mis servicios']],
  sportsHelp: ['Consulta con administración qué deportes tienen inscripción abierta, sus requisitos y horarios. Este asistente no confirma cupos ni realiza inscripciones.', []],
  sections: ['¿Qué sección quieres abrir?', ['Mis notas', 'Mis horarios', 'Mis servicios', 'Foro estudiantil', 'Novedades']],
};

for (const view of views) {
  test(`Flow: ${view} has exact approved copy/buttons and no extra actions`, () => {
    const actual = screen(view);
    assert.equal(actual.message, definitions[view][0]);
    assert.deepEqual(actual.buttons.map(button => button.label), [...definitions[view][1], 'Inicio', ...(view === 'home' ? [] : ['Volver']), 'Cerrar']);
    assert.equal(new Set(actual.buttons.map(button => button.action)).size, actual.buttons.length);
  });

  test(`Flow: ${view} Inicio and Cerrar reset without executing effects`, () => {
    assert.deepEqual(transition(view, 'home'), { view: 'home', effect: none });
    assert.deepEqual(transition(view, 'close'), { view: 'home', effect: { type: 'close' } });
  });

  test(`Flow: ${view} rejects unknown, misplaced and arbitrary navigation actions`, () => {
    for (const action of [null, undefined, 42, {}, { type: 'navigate', target: 'https://evil.example' }, ['services'], '__proto__', 'constructor', '/privado', 'https://evil.example']) {
      assert.deepEqual(transition(view, action), { view, effect: none });
    }
    const allowed = screen(view).buttons.map(button => button.action);
    for (const action of ['home', 'close', 'back', ...views, 'notes', 'schedule', 'services', 'forum', 'news']) {
      if (!allowed.includes(action)) assert.deepEqual(transition(view, action), { view, effect: none });
    }
  });
}

for (const [from, action, to] of [
  ['home', 'transport', 'transport'], ['home', 'sports', 'sports'], ['home', 'sections', 'sections'],
  ['transport', 'transportHelp', 'transportHelp'], ['sports', 'sportsHelp', 'sportsHelp'],
]) {
  test(`Flow: ${from} -> ${action} changes only the view`, () => {
    assert.deepEqual(transition(from, action), { view: to, effect: none });
  });
}

for (const [from, action, topic] of [['transport', 'myTransport', 'transport'], ['transportHelp', 'myTransport', 'transport'], ['sports', 'mySports', 'sports']]) {
  test(`Flow: ${from} -> ${action} declares only its lookup`, () => {
    assert.deepEqual(transition(from, action), { view: action, effect: { type: 'lookup', topic } });
  });
}

for (const [from, parent] of Object.entries({ transport: 'home', myTransport: 'transport', transportHelp: 'transport', sports: 'home', mySports: 'sports', sportsHelp: 'sports', sections: 'home' })) {
  test(`Flow: ${from} Volver resolves its fixed parent`, () => {
    assert.deepEqual(transition(from, 'back'), { view: parent, effect: none });
  });
}

const destinations = {
  notes: { pathname: '/alumnos', section: 'notes', heading: 'Materias y calificaciones' },
  schedule: { pathname: '/alumnos', section: 'schedule', heading: 'Horario de clases' },
  services: { pathname: '/alumnos', section: 'services', heading: 'Servicios activos' },
  forum: { pathname: '/alumnos/foro' },
  news: { pathname: '/noticias' },
};
for (const [action, target] of Object.entries(destinations)) {
  test(`Flow: sections ${action} declares only an allowlisted navigation and close`, () => {
    assert.deepEqual(transition('sections', action), { view: 'home', effect: { type: 'navigate', target, close: true } });
  });
}
for (const view of ['myTransport', 'mySports']) {
  test(`Flow: ${view} Ver mis servicios closes and resets with exact section target`, () => {
    assert.deepEqual(transition(view, 'services'), { view: 'home', effect: { type: 'navigate', target: destinations.services, close: true } });
  });
}

test('Flow: greeting trims supplied names, handles missing names and leaves escaping to the renderer', () => {
  assert.equal(screen('home', '  Ana Prueba  ').message, screen('home').message);
  assert.match(screen('home', '').message, /^Hola, estudiante\./);
  assert.match(screen('home', '  ').message, /^Hola, estudiante\./);
  assert.match(screen('home', '<b>Ana</b>').message, /^Hola, <b>Ana<\/b>\./);
  assert.equal(Reflect.get(module.namespace, 'getChatScreen')('home').message, screen('home', '').message);
});

test('Flow: every declared action is deterministic and screen reads do not mutate definitions', () => {
  for (const view of views) {
    const before = screen(view);
    for (const button of before.buttons) {
      const input = Object.freeze({ view, action: button.action });
      assert.deepEqual(transition(input.view, input.action), transition(input.view, input.action));
      assert.deepEqual(input, { view, action: button.action });
    }
    assert.deepEqual(screen(view), before);
  }
});

test('Flow: returned screens and targets cannot poison later reads', () => {
  const result = Reflect.get(module.namespace, 'getChatScreen')('home', 'Ana Prueba');
  result.buttons[0].label = 'Changed by consumer';
  assert.equal(screen('home').buttons[0].label, 'Transporte');
  const navigation = Reflect.get(module.namespace, 'transitionChat')('sections', 'services');
  navigation.effect.target.pathname = 'https://evil.example';
  assert.deepEqual(transition('sections', 'services').effect.target, destinations.services);
});
