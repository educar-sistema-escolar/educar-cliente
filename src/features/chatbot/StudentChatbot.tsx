import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ArrowLeft, ArrowRight, Bus, Compass, GraduationCap, Home, MessageCircle, Trophy, X } from 'lucide-react';
import { getChatScreen, transitionChat, type ChatAction, type ChatNavigationTarget, type ChatView } from './chatbotFlow';

import type { ChatLookupTopic, ChatLookupResult } from './chatbotTypes';
export type { ChatLookupTopic, ChatLookupResult, ChatTransportAssignment, ChatSportAssignment } from './chatbotTypes';
type Field = string | number | null;

export interface StudentChatbotProps {
  readonly studentName: string;
  readonly accountId: string;
  readonly onLookup: (topic: ChatLookupTopic, signal: AbortSignal) => Promise<ChatLookupResult>;
  readonly onNavigate: (target: ChatNavigationTarget) => void;
}

type QueryState =
  | { status: 'idle' }
  | { status: 'loading' | 'empty' | 'error'; topic: ChatLookupTopic }
  | { status: 'success'; result: ChatLookupResult };

const emptyMessages = {
  transport: 'No tienes un transporte asignado registrado. Para consultar cómo solicitarlo, comunícate con administración.',
  sports: 'No tienes inscripciones deportivas registradas. Puedes consultar con administración qué actividades están disponibles.',
};
const field = (value: Field | undefined) => value === null || value === undefined || String(value).trim() === '' ? 'No informado' : String(value);
const buttonClass = 'min-h-11 rounded-xl px-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176e68] disabled:cursor-wait disabled:opacity-60 motion-safe:transition-colors hover:bg-[#e4eee9] active:bg-[#d2e4dc]';

export function StudentChatbot(props: StudentChatbotProps) {
  // A validated account change creates an entirely fresh window, including in-flight request refs.
  return <ChatWindow key={props.accountId} {...props} />;
}

function ChatWindow({ studentName, onLookup, onNavigate }: StudentChatbotProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ChatView>('home');
  const [query, setQuery] = useState<QueryState>({ status: 'idle' });
  const panelId = useId();
  const launcher = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const revision = useRef(0);
  const pending = useRef<{ topic: ChatLookupTopic; controller: AbortController } | null>(null);

  useEffect(() => {
    if (open) panel.current?.focus();
  }, [open]);

  useEffect(() => () => {
    revision.current += 1;
    pending.current?.controller.abort();
  }, []);

  const invalidate = useCallback(() => {
    revision.current += 1;
    pending.current?.controller.abort();
    pending.current = null;
    setQuery({ status: 'idle' });
  }, []);

  const close = useCallback(() => {
    invalidate(); setOpen(false); setView('home'); launcher.current?.focus();
  }, [invalidate]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, close]);

  async function lookup(topic: ChatLookupTopic) {
    if (pending.current?.topic === topic) return;
    invalidate();
    const controller = new AbortController();
    const requestRevision = revision.current;
    pending.current = { topic, controller };
    setQuery({ status: 'loading', topic });
    try {
      const result = await onLookup(topic, controller.signal);
      if (controller.signal.aborted || revision.current !== requestRevision) return;
      if (result.topic !== topic) throw new Error('Unexpected lookup topic');
      setQuery(result.items.length ? { status: 'success', result } : { status: 'empty', topic });
    } catch {
      if (!controller.signal.aborted && revision.current === requestRevision) setQuery({ status: 'error', topic });
    } finally {
      if (revision.current === requestRevision) pending.current = null;
    }
  }

  function choose(action: ChatAction) {
    const next = transitionChat(view, action);
    if (next.effect.type === 'close') { close(); return; }
    if (next.effect.type === 'navigate') {
      // The host callback may navigate immediately; the panel must already be gone.
      flushSync(close);
      onNavigate(next.effect.target);
      return;
    }
    if (next.effect.type !== 'lookup') invalidate();
    setView(next.view);
    if (next.effect.type === 'lookup') void lookup(next.effect.topic);
  }

  const screen = getChatScreen(view, studentName);
  const controls = screen.buttons.filter(button => ['home', 'back', 'close'].includes(button.action));
  const actions = screen.buttons.filter(button => !controls.includes(button) && (button.action !== 'services' || (view !== 'myTransport' && view !== 'mySports') || query.status === 'success' || query.status === 'empty'));
  const showIntro = query.status !== 'loading' && query.status !== 'empty' && query.status !== 'error';

  return <div className="fixed right-4 z-50 w-[min(380px,calc(100vw-2rem))] text-[#173b54]" style={{ bottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
    {open && <div ref={panel} id={panelId} role="dialog" aria-labelledby={`${panelId}-title`} tabIndex={-1} onKeyDown={event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
    }} className="flex max-h-[calc(100dvh-6.5rem-env(safe-area-inset-bottom))] flex-col overflow-hidden rounded-[24px] border border-[#d9ded8] bg-[#fffefa] shadow-[0_18px_60px_rgba(23,59,84,0.22)] outline-none">
      <header className="flex shrink-0 items-center gap-3 bg-[#173b54] px-5 py-4 text-[#fffefa]">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#f4cd6c]"><GraduationCap className="h-5 w-5" aria-hidden="true" /></span>
        <div className="flex-1"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#bdd0cb]">Educar · Comunidad</p><h2 id={`${panelId}-title`} className="mt-0.5 text-base font-bold">Ayuda</h2></div>
        <button type="button" aria-label="Cerrar ayuda" onClick={close} className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4cd6c]"><X className="h-5 w-5" aria-hidden="true" /></button>
      </header>
      <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-5">
        {showIntro && <p className="rounded-2xl rounded-tl-sm bg-[#f2f1e9] px-4 py-3 text-sm leading-6">{screen.message}</p>}
        <p role="status" aria-live="polite" className="text-sm leading-6 text-[#5c6c6c]">{query.status === 'loading' ? 'Consultando tu información…' : ''}</p>
        {query.status === 'error' && <div role="alert" className="rounded-2xl border border-[#ead9c5] bg-[#fbf1e7] p-4 text-sm leading-6"><p>No pudimos consultar tu información. Inténtalo nuevamente.</p><button type="button" onClick={() => void lookup(query.topic)} className={`${buttonClass} mt-3 border border-[#d9ded8] bg-[#fffefa]`}>Reintentar</button></div>}
        {query.status === 'empty' && <p className="rounded-2xl bg-[#f2f1e9] p-4 text-sm leading-6">{emptyMessages[query.topic]}</p>}
        {query.status === 'success' && <ul className="mt-3 space-y-3">{query.result.topic === 'transport' ? query.result.items.map(item => <li key={item.id} className="rounded-2xl border border-[#e1e2d9] bg-[#f7f6f0] p-4"><dl className="space-y-2 text-sm"><div><dt className="text-xs text-[#556a63]">Recorrido</dt><dd className="break-words font-semibold">{field(item.routeName)} · {field(item.routeNumber)}</dd></div><div><dt className="text-xs text-[#556a63]">Parada</dt><dd className="break-words">{field(item.stop)}</dd></div><div><dt className="text-xs text-[#556a63]">Ciclo lectivo</dt><dd>{field(item.academicYear)}</dd></div></dl></li>) : query.result.items.map(item => <li key={item.id} className="rounded-2xl border border-[#e1e2d9] bg-[#f7f6f0] p-4"><dl className="space-y-2 text-sm"><div><dt className="text-xs text-[#556a63]">Deporte</dt><dd className="break-words font-semibold">{field(item.sport)}</dd></div><div><dt className="text-xs text-[#556a63]">Grupo</dt><dd className="break-words">{field(item.group)}</dd></div><div><dt className="text-xs text-[#556a63]">Ciclo lectivo</dt><dd>{field(item.academicYear)}</dd></div></dl></li>)}</ul>}
        <div className="mt-4 grid gap-2">{actions.map(button => {
          const Icon = button.action === 'transport' ? Bus : button.action === 'sports' ? Trophy : button.action === 'sections' ? Compass : ArrowRight;
          return <button key={button.action} type="button" onClick={() => choose(button.action)} className={`${buttonClass} flex items-center gap-3 border border-[#d9ded8] bg-white px-4 py-3 text-left text-[#145c58]`}><Icon className="h-4 w-4 shrink-0" aria-hidden="true" /><span>{button.label}</span></button>;
        })}</div>
      </div>
      <footer className="flex shrink-0 items-center justify-between gap-1 border-t border-[#e5e5da] bg-[#f7f6f0] px-3 py-2">{controls.map(button => {
        const Icon = button.action === 'home' ? Home : button.action === 'back' ? ArrowLeft : X;
        return <button key={button.action} type="button" onClick={() => choose(button.action)} className={`${buttonClass} inline-flex items-center gap-1.5 text-[#47616c]`}><Icon className="h-3.5 w-3.5" aria-hidden="true" />{button.label}</button>;
      })}</footer>
    </div>}
    <button ref={launcher} type="button" aria-expanded={open} aria-controls={panelId} onClick={() => { if (open) close(); else { invalidate(); setView('home'); setOpen(true); } }} className="ml-auto mt-3 flex min-h-12 items-center gap-2 rounded-full bg-[#173b54] px-5 py-3 text-sm font-semibold text-[#fffefa] shadow-lg hover:bg-[#20536a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#176e68]"><MessageCircle className="h-5 w-5 text-[#f4cd6c]" aria-hidden="true" />Ayuda</button>
  </div>;
}
