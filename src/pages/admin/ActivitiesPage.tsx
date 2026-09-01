import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
  Users,
  X,
  Sparkles,
} from 'lucide-react';
import {
  categoryLabels,
  categoryColors,
} from '../../features/actividades/types';
import type { Activity as ActivityType, ActivityCategory, ActivityInput } from '../../features/actividades/types';
import {
  createActivity,
  deleteActivity,
  listActivities,
  updateActivity,
} from '../../features/actividades/services/activitiesStore';

const emptyForm: ActivityInput = {
  name: '',
  description: '',
  category: 'deporte',
  schedule: '',
  maxStudents: 20,
  location: '',
  instructor: '',
  isActive: true,
};

export const ActivitiesPage: React.FC = () => {
  const [version, setVersion] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ActivityCategory | 'all'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ActivityInput>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showEnrolleesFor, setShowEnrolleesFor] = useState<string | null>(null);

  const activities = useMemo(() => listActivities(), [version]);

  const filtered = activities.filter(activity => {
    const matchSearch = activity.name.toLowerCase().includes(search.toLowerCase()) ||
      activity.instructor.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || activity.category === filter;
    return matchSearch && matchFilter;
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = () => {
    if (!form.name || !form.description || !form.schedule || !form.instructor) {
      setFeedback('Completá todos los campos obligatorios.');
      return;
    }
    if (editingId) {
      updateActivity(editingId, form);
      setFeedback('Actividad actualizada correctamente.');
    } else {
      createActivity(form);
      setFeedback('Actividad creada correctamente.');
    }
    setVersion(previousVersion => previousVersion + 1);
    resetForm();
  };

  const handleEdit = (activity: ActivityType) => {
    setForm({
      name: activity.name,
      description: activity.description,
      category: activity.category,
      schedule: activity.schedule,
      maxStudents: activity.maxStudents,
      location: activity.location,
      instructor: activity.instructor,
      isActive: activity.isActive,
    });
    setEditingId(activity.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteActivity(id);
    setVersion(previousVersion => previousVersion + 1);
    setDeleteConfirm(null);
    setFeedback('Actividad eliminada permanentemente.');
  };

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-edu-border/60 bg-gradient-to-br from-white via-white to-edu-secondary/[0.02] p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-edu-secondary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-edu-secondary">
              <Sparkles className="h-3.5 w-3.5" />
              Actividades extracurriculares
            </span>
            <h1 className="mt-2 text-lg font-bold text-edu-primary">
              Gestión de actividades
            </h1>
            <p className="mt-0.5 text-xs text-edu-muted">
              Administrá deportes, idiomas, apoyo estudiantil y más.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-edu-secondary px-4 text-xs font-bold text-white shadow-sm shadow-edu-secondary/20 hover:bg-edu-secondary-dark transition-all cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Nueva actividad
          </button>
        </div>
      </section>

      {feedback && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white px-4 py-3 text-xs font-medium text-emerald-700 shadow-sm">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-200/50">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <span>{feedback}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="ml-auto cursor-pointer rounded-lg p-1 text-emerald-500 hover:bg-emerald-100 hover:text-emerald-700"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className={`flex-1 space-y-4 ${showForm ? 'lg:max-w-[65%]' : ''}`}>
          <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-edu-muted" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o instructor..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-9 w-full rounded-lg border border-edu-border bg-slate-50 pl-9 pr-3.5 text-xs outline-none transition-all focus:border-edu-secondary focus:bg-white focus:ring-2 focus:ring-edu-secondary/10"
                />
              </div>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value as ActivityCategory | 'all')}
                className="h-9 rounded-lg border border-edu-border bg-slate-50 px-3 text-xs outline-none transition-all focus:border-edu-secondary focus:bg-white"
              >
                <option value="all">Todas las categorías</option>
                {Object.entries(categoryLabels).map(([category, categoryLabel]) => (
                  <option key={category} value={category}>{categoryLabel}</option>
                ))}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-edu-border bg-slate-50/50 px-6 py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-edu-secondary/10 to-edu-primary/5">
                  <Sparkles className="h-6 w-6 text-edu-secondary/60" />
                </div>
                <p className="mt-3 text-sm font-bold text-slate-700">No hay actividades aún</p>
                <p className="mt-1 text-xs text-edu-muted">Creá la primera actividad para comenzar.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(activity => (
                  <div
                    key={activity.id}
                    className="group rounded-xl border border-edu-border/60 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-800">{activity.name}</h3>
                          <span className={`rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${categoryColors[activity.category]}`}>
                            {categoryLabels[activity.category]}
                          </span>
                          {!activity.isActive && (
                            <span className="rounded-lg bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-700">Inactiva</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{activity.description}</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-edu-muted sm:grid-cols-4">
                          <span className="flex items-center gap-1.5"><Clock3 className="h-3 w-3 text-edu-secondary/60" /> {activity.schedule}</span>
                          <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-edu-secondary/60" /> {activity.location}</span>
                          <span className="flex items-center gap-1.5"><User className="h-3 w-3 text-edu-secondary/60" /> {activity.instructor}</span>
                          <button
                            type="button"
                            onClick={() => setShowEnrolleesFor(showEnrolleesFor === activity.id ? null : activity.id)}
                            className="flex items-center gap-1.5 text-xs text-edu-muted hover:text-edu-secondary transition-colors cursor-pointer"
                          >
                            <Users className="h-3 w-3 text-edu-secondary/60" /> {activity.enrolledStudents.length}/{activity.maxStudents}
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0 opacity-70 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => handleEdit(activity)}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-edu-border bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(activity.id)}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[11px] font-bold text-red-600 shadow-sm transition-all hover:bg-red-50 hover:shadow"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {showEnrolleesFor && (() => {
            const activity = activities.find(activity => activity.id === showEnrolleesFor);
            if (!activity || activity.enrolledStudents.length === 0) return null;
            return (
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-edu-secondary" />
                    <span className="text-xs font-bold text-slate-700">
                      Inscritos en <span className="text-edu-secondary">{activity.name}</span>
                    </span>
                    <span className="rounded-md bg-edu-secondary/10 px-1.5 py-0.5 text-[10px] font-bold text-edu-secondary">{activity.enrolledStudents.length}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEnrolleesFor(null)}
                    className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {activity.enrolledStudents.map(dni => (
                    <span key={dni} className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-mono font-semibold text-slate-700">{dni}</span>
                  ))}
                </div>
              </section>
            );
          })()}
        </div>

        {showForm && (
          <div className="w-full lg:w-[35%]">
            <div className="sticky top-24 rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-edu-secondary/10 to-edu-secondary/5 text-edu-secondary">
                    {editingId ? <Pencil size={14} /> : <Plus size={14} />}
                  </div>
                  <h2 className="text-sm font-bold text-slate-800">
                    {editingId ? 'Editar actividad' : 'Nueva actividad'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="cursor-pointer rounded-lg p-1.5 text-edu-muted transition-all hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-edu-muted">Nombre *</span>
                  <input type="text" value={form.name} onChange={e => setForm(previousForm => ({ ...previousForm, name: e.target.value }))} className="h-9 w-full rounded-lg border border-edu-border bg-white px-3 text-xs outline-none transition-all focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary/10" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-edu-muted">Descripción *</span>
                  <textarea value={form.description} onChange={e => setForm(previousForm => ({ ...previousForm, description: e.target.value }))} rows={3} className="w-full rounded-lg border border-edu-border bg-white px-3 py-2 text-xs outline-none transition-all focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary/10" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-edu-muted">Categoría</span>
                  <select value={form.category} onChange={e => setForm(previousForm => ({ ...previousForm, category: e.target.value as ActivityCategory }))} className="h-9 w-full rounded-lg border border-edu-border bg-white px-3 text-xs outline-none transition-all focus:border-edu-secondary">
                    {Object.entries(categoryLabels).map(([category, categoryLabel]) => (<option key={category} value={category}>{categoryLabel}</option>))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-edu-muted">Horario *</span>
                  <input type="text" value={form.schedule} onChange={e => setForm(previousForm => ({ ...previousForm, schedule: e.target.value }))} placeholder="Ej: Lunes y Miércoles 16:00-18:00" className="h-9 w-full rounded-lg border border-edu-border bg-white px-3 text-xs outline-none transition-all focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary/10" />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-edu-muted">Instructor *</span>
                    <input type="text" value={form.instructor} onChange={e => setForm(previousForm => ({ ...previousForm, instructor: e.target.value }))} className="h-9 w-full rounded-lg border border-edu-border bg-white px-3 text-xs outline-none transition-all focus:border-edu-secondary" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-edu-muted">Cupo máx.</span>
                    <input type="number" value={form.maxStudents} onChange={e => setForm(previousForm => ({ ...previousForm, maxStudents: Number(e.target.value) }))} min={1} className="h-9 w-full rounded-lg border border-edu-border bg-white px-3 text-xs outline-none transition-all focus:border-edu-secondary" />
                  </label>
                </div>
                <label className="block">
                  <span className="mb-1 block text-[9px] font-bold uppercase tracking-wider text-edu-muted">Ubicación</span>
                  <input type="text" value={form.location} onChange={e => setForm(previousForm => ({ ...previousForm, location: e.target.value }))} className="h-9 w-full rounded-lg border border-edu-border bg-white px-3 text-xs outline-none transition-all focus:border-edu-secondary" />
                </label>
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(previousForm => ({ ...previousForm, isActive: e.target.checked }))} className="h-4 w-4 rounded border-edu-border text-edu-secondary focus:ring-edu-secondary/20" />
                  <span className="text-xs font-semibold text-slate-700">Actividad activa</span>
                </label>
                <button type="button" onClick={handleSave} className="w-full h-9 cursor-pointer rounded-lg bg-edu-secondary text-xs font-semibold text-white shadow-sm shadow-edu-secondary/20 transition-all hover:bg-edu-secondary-dark">
                  {editingId ? 'Guardar cambios' : 'Crear actividad'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-edu-border bg-white p-5 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-red-100 text-red-600 shadow-sm">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">¿Eliminar actividad?</h3>
            <p className="text-xs text-edu-muted">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setDeleteConfirm(null)} className="flex-1 h-10 cursor-pointer rounded-xl border border-edu-border bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50">Cancelar</button>
              <button type="button" onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-10 cursor-pointer rounded-xl bg-edu-danger text-xs font-semibold text-white shadow-sm transition-all hover:bg-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
