import type { ReactNode } from 'react';
import { Edit3, Plus, UserMinus } from 'lucide-react';
import type { DiningService, Sport, Student } from '../../../features/admin/types';
import { field } from './ServicePageUtils';

export function StudentSelect({ value, students, onChange }: { value: string; students: Student[]; onChange: (value: string) => void }) {
  return <label className="text-[11px] font-semibold">Alumno<select aria-label="Alumno" className={field} value={value} onChange={(event) => onChange(event.target.value)}><option value="">Seleccioná</option>{students.map((student) => <option key={student.id} value={student.id}>{student.person.first_name} {student.person.last_name}</option>)}</select></label>;
}

export function Submit({ disabled, children }: { disabled: boolean; children: string }) {
  return <button type="submit" disabled={disabled} className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-edu-secondary px-4 text-xs font-bold text-white disabled:opacity-50"><Plus size={14} />{children}</button>;
}

export function Empty({ text }: { text: string }) { return <p className="py-5 text-center text-xs text-edu-muted">{text}</p>; }

export function CatalogList<T extends Sport | DiningService>({ items, onToggle, onEdit, showCapacity = false }: { items: T[]; onToggle: (item: T) => void; onEdit?: (item: T) => void; showCapacity?: boolean }) {
  return <div className="mt-4 space-y-2">{items.length === 0 ? <Empty text="No hay registros en el catálogo." /> : items.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-edu-border/60 px-3 py-2 text-xs"><span><strong>{item.name}</strong> <span className="text-edu-muted">· {item.code}{showCapacity && 'capacity' in item ? ` · ${item.capacity} cupos` : ''}</span></span><span className="flex items-center gap-2">{onEdit && <button type="button" onClick={() => onEdit(item)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-edu-secondary"><Edit3 size={13} />Editar</button>}<button type="button" onClick={() => onToggle(item)} className={`text-[11px] font-semibold ${item.is_active ? 'text-red-600' : 'text-edu-secondary'}`}>{item.is_active ? 'Desactivar' : 'Activar'}</button></span></div>)}</div>;
}

export function EnrollmentList<T extends { id: string; is_active: boolean }>({ items, empty, onToggle, render }: { items: T[]; empty: string; onToggle: (id: string, isActive: boolean) => void; render: (item: T) => ReactNode }) {
  return <div className="mt-4 space-y-2">{items.length === 0 ? <Empty text={empty} /> : items.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-edu-border/60 px-3 py-2 text-xs"><span>{render(item)}</span><button type="button" onClick={() => onToggle(item.id, !item.is_active)} className={`inline-flex items-center gap-1 text-[11px] font-semibold ${item.is_active ? 'text-red-600' : 'text-edu-secondary'}`}><UserMinus size={13} />{item.is_active ? 'Desactivar' : 'Activar'}</button></div>)}</div>;
}
