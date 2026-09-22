import { useState, type FormEvent } from 'react';
import { createDiningService, createDiningSlot, enrollStudentInDining, recordDiningUsage, setServiceEnrollmentActive, updateDiningService, updateDiningSlot } from '../../../features/admin/services/servicesRepository';
import type { DiningService, DiningSlot, DiningUsage, Student, StudentDiningEnrollment } from '../../../features/admin/types';
import { CatalogList, Empty, EnrollmentList, StudentSelect, Submit } from './ServicePageParts';
import { field, studentName } from './ServicePageUtils';

type Save = (action: () => Promise<unknown>, text: string) => void;

export function DiningServicesPage({ students, diningServices, diningSlots, diningEnrollments, usage, saving, save, setError }: { students: Student[]; diningServices: DiningService[]; diningSlots: DiningSlot[]; diningEnrollments: StudentDiningEnrollment[]; usage: DiningUsage[]; saving: boolean; save: Save; setError: (message: string) => void }) {
  const [diningForm, setDiningForm] = useState({ code: '', name: '', capacity: '100' });
  const [editingService, setEditingService] = useState<string | null>(null);
  const [enrollmentForm, setEnrollmentForm] = useState({ student: '', service: '', year: String(new Date().getFullYear()) });
  const [usageForm, setUsageForm] = useState({ enrollment: '', date: new Date().toISOString().slice(0, 10), used: 'true' });
  const [slotForm, setSlotForm] = useState({ service: '', date: new Date().toISOString().slice(0, 10), capacity: '100' });
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const activeStudents = students.filter((student) => student.is_active);
  const activeDiningEnrollments = diningEnrollments.filter((enrollment) => enrollment.is_active);
  const submitDining = (event: FormEvent) => {
    event.preventDefault();
    const capacity = Number(diningForm.capacity);
    if (!diningForm.code.trim() || !diningForm.name.trim() || !Number.isInteger(capacity) || capacity < 1) return setError('Completá código, nombre y capacidad válida.');
    void save(() => editingService
      ? updateDiningService(editingService, { code: diningForm.code.trim(), name: diningForm.name.trim(), capacity })
      : createDiningService({ code: diningForm.code.trim(), name: diningForm.name.trim(), capacity }), editingService ? 'Servicio de comedor actualizado.' : 'Servicio de comedor creado correctamente.');
    setDiningForm({ code: '', name: '', capacity: '100' });
    setEditingService(null);
  };
  const submitEnrollment = (event: FormEvent) => {
    event.preventDefault();
    const year = Number(enrollmentForm.year);
    if (!enrollmentForm.student || !enrollmentForm.service || !Number.isInteger(year) || year < 1) return setError('Seleccioná alumno, servicio y un año válido.');
    void save(() => enrollStudentInDining(enrollmentForm.student, enrollmentForm.service, year), 'Inscripción al comedor creada.');
  };
  const submitUsage = (event: FormEvent) => {
    event.preventDefault();
    if (!usageForm.enrollment || !usageForm.date) return setError('Seleccioná una inscripción y fecha de uso.');
    void save(() => recordDiningUsage({ dining_enrollment_id: usageForm.enrollment, service_date: usageForm.date, used: usageForm.used === 'true' }), 'Uso de comedor registrado.');
  };
  const submitSlot = (event: FormEvent) => {
    event.preventDefault();
    const capacity = Number(slotForm.capacity);
    if (!slotForm.service || !slotForm.date || !Number.isInteger(capacity) || capacity < 1) return setError('Completá servicio, fecha y capacidad válida.');
    void save(() => editingSlot
      ? updateDiningSlot(editingSlot, { capacity })
      : createDiningSlot({ dining_service_id: slotForm.service, service_date: slotForm.date, capacity }), editingSlot ? 'Turno de comedor actualizado.' : 'Turno de comedor creado.');
    setEditingSlot(null);
  };
  return <>
    <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-edu-primary">Servicios de comedor</h2><form onSubmit={submitDining} className="mt-3 grid gap-3 sm:grid-cols-3"><label className="text-[11px] font-semibold">Código<input className={field} value={diningForm.code} onChange={(event) => setDiningForm({ ...diningForm, code: event.target.value })} /></label><label className="text-[11px] font-semibold">Nombre<input className={field} value={diningForm.name} onChange={(event) => setDiningForm({ ...diningForm, name: event.target.value })} /></label><label className="text-[11px] font-semibold">Capacidad<input className={field} type="number" min="1" value={diningForm.capacity} onChange={(event) => setDiningForm({ ...diningForm, capacity: event.target.value })} /></label><Submit disabled={saving}>{editingService ? 'Actualizar servicio' : 'Agregar servicio'}</Submit></form><CatalogList items={diningServices} onEdit={(service) => { setEditingService(service.id); setDiningForm({ code: service.code, name: service.name, capacity: String(service.capacity) }); }} onToggle={(service) => void save(() => updateDiningService(service.id, { is_active: !service.is_active }), `Servicio ${service.is_active ? 'desactivado' : 'activado'}.`)} showCapacity /></section>
    <section className="grid gap-5 lg:grid-cols-2"><div className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-edu-primary">Inscribir alumno en comedor</h2><form onSubmit={submitEnrollment} className="mt-3 grid gap-3"><StudentSelect value={enrollmentForm.student} students={activeStudents} onChange={(student) => setEnrollmentForm({ ...enrollmentForm, student })} /><label className="text-[11px] font-semibold">Servicio<select className={field} value={enrollmentForm.service} onChange={(event) => setEnrollmentForm({ ...enrollmentForm, service: event.target.value })}><option value="">Seleccioná</option>{diningServices.filter((service) => service.is_active).map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label><label className="text-[11px] font-semibold">Año académico<input className={field} type="number" min="1" value={enrollmentForm.year} onChange={(event) => setEnrollmentForm({ ...enrollmentForm, year: event.target.value })} /></label><Submit disabled={saving}>Inscribir</Submit></form><EnrollmentList empty="No hay inscripciones de comedor." items={diningEnrollments} onToggle={(id, isActive) => void save(() => setServiceEnrollmentActive('dining', id, isActive), `Inscripción ${isActive ? 'activada' : 'desactivada'}.`)} render={(item) => <>{studentName(item.student)} · {item.dining_service?.name ?? 'Servicio'} · {item.academic_year}</>} /></div><div className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm"><h2 className="text-sm font-bold text-edu-primary">Turnos y uso de comedor</h2><form onSubmit={submitSlot} className="mt-3 grid gap-2"><select aria-label="Servicio del turno" className={field} value={slotForm.service} onChange={(event) => setSlotForm({ ...slotForm, service: event.target.value })} disabled={Boolean(editingSlot)}><option value="">Servicio</option>{diningServices.filter((service) => service.is_active).map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select><input aria-label="Fecha del turno" className={field} type="date" value={slotForm.date} onChange={(event) => setSlotForm({ ...slotForm, date: event.target.value })} disabled={Boolean(editingSlot)} /><input aria-label="Capacidad del turno" className={field} type="number" min="1" value={slotForm.capacity} onChange={(event) => setSlotForm({ ...slotForm, capacity: event.target.value })} /><Submit disabled={saving}>{editingSlot ? 'Actualizar turno' : 'Crear turno'}</Submit></form><div className="mt-4 space-y-2">{diningSlots.length === 0 ? <Empty text="No hay turnos configurados." /> : diningSlots.slice(0, 20).map((slot) => <div key={slot.id} className="flex flex-wrap justify-between gap-2 rounded-lg border border-edu-border/60 px-3 py-2 text-xs"><span>{slot.dining_service?.name ?? 'Servicio'} · {slot.service_date} · {slot.capacity} cupos</span><span className="flex items-center gap-2"><button type="button" className="font-semibold text-edu-secondary" onClick={() => { setEditingSlot(slot.id); setSlotForm({ service: slot.dining_service_id, date: slot.service_date, capacity: String(slot.capacity) }); }}>Editar</button><button type="button" className="font-semibold text-edu-secondary" onClick={() => void save(() => updateDiningSlot(slot.id, { is_available: !slot.is_available }), `${slot.is_available ? 'Turno cerrado' : 'Turno habilitado'}.`)}>{slot.is_available ? 'Cerrar' : 'Habilitar'}</button></span></div>)}</div><h3 className="mt-5 text-xs font-bold text-edu-primary">Registrar uso</h3><form onSubmit={submitUsage} className="mt-2 grid gap-3"><label className="text-[11px] font-semibold">Inscripción<select className={field} value={usageForm.enrollment} onChange={(event) => setUsageForm({ ...usageForm, enrollment: event.target.value })}><option value="">Seleccioná</option>{activeDiningEnrollments.map((enrollment) => <option key={enrollment.id} value={enrollment.id}>{studentName(enrollment.student)} · {enrollment.dining_service?.name}</option>)}</select></label><label className="text-[11px] font-semibold">Fecha<input className={field} type="date" value={usageForm.date} onChange={(event) => setUsageForm({ ...usageForm, date: event.target.value })} /></label><label className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={usageForm.used === 'true'} onChange={(event) => setUsageForm({ ...usageForm, used: String(event.target.checked) })} />Usó el servicio</label><Submit disabled={saving}>Guardar uso</Submit></form><div className="mt-4 space-y-2">{usage.length === 0 ? <Empty text="No hay usos registrados." /> : usage.slice(0, 20).map((item) => <div key={item.id} className="flex flex-wrap justify-between gap-2 rounded-lg border border-edu-border/60 px-3 py-2 text-xs"><span>{studentName(item.enrollment?.student)} · {item.service_date}</span><strong className={item.used ? 'text-emerald-700' : 'text-slate-500'}>{item.used ? 'Usó' : 'No usó'}</strong></div>)}</div></div></section>
  </>;
}
