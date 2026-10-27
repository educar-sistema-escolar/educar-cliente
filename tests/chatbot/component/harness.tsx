import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { StudentChatbot, type ChatLookupResult, type ChatLookupTopic } from '../../../src/features/chatbot/StudentChatbot';
import '../../../src/index.css';

const calls: Array<{ topic: string; account: string; aborted: boolean }> = [];
const navigations: unknown[] = [];
const pending: Array<{ resolve: (value: ChatLookupResult) => void }> = [];
let mode = 'success';
let customResult: ChatLookupResult | undefined;
const sample = (topic: ChatLookupTopic): ChatLookupResult => topic === 'transport'
  ? { topic, items: [{ id: 't1', routeName: 'Recorrido Norte', routeNumber: 7, stop: 'Plaza Norte', academicYear: 2026 }] }
  : { topic, items: [{ id: 's1', sport: 'Vóley', group: 'Grupo A', academicYear: 2026 }] };

export function Harness() {
  const [account, setAccount] = useState('A');
  const [mounted, setMounted] = useState(true);
  useEffect(() => { Object.assign(window, {
    componentTest: {
      calls, navigations, pendingCount: () => pending.length,
      mode(value: string) { mode = value; },
      result(value: ChatLookupResult) { customResult = value; },
      async release(topic: ChatLookupTopic = 'transport') {
        pending.splice(0).forEach(item => item.resolve(customResult ?? sample(topic)));
        await Promise.resolve();
        flushSync(() => {});
      },
      account(value: string) { flushSync(() => setAccount(value)); },
      mount(value: boolean) { flushSync(() => setMounted(value)); },
    },
  }); }, []);
  return <main className="min-h-screen bg-[#f6f4ec] p-8 text-[#173b54]">
    <p className="text-xs font-bold uppercase tracking-widest text-[#607678]">Educar · Comunidad</p>
    <h1 className="mt-4 text-3xl font-bold">Portal del alumno</h1>
    <p className="mt-3 max-w-sm text-sm text-[#5c6c6c]">Información académica y servicios vinculados a los registros institucionales.</p>
    {mounted && <StudentChatbot accountId={account} studentName={account === 'A' ? 'Ana Prueba' : 'Bruno Prueba'} onNavigate={target => navigations.push({ target, panelClosed: !document.querySelector('[role="dialog"]') })} onLookup={(topic, signal) => {
      const call = { topic, account, aborted: false }; calls.push(call);
      signal.addEventListener('abort', () => { call.aborted = true; });
      if (mode === 'error') return Promise.reject(new Error('Synthetic internal secret'));
      if (mode === 'pending') return new Promise<ChatLookupResult>(resolve => pending.push({ resolve }));
      return Promise.resolve(customResult ?? (mode === 'empty' ? { topic, items: [] } : sample(topic)));
    }} />}
  </main>;
}

createRoot(document.getElementById('root')!).render(<Harness />);
