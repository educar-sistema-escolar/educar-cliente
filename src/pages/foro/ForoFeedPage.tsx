import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ChevronUp, 
  ChevronDown, 
  MessageSquare, 
  Filter, 
  GraduationCap, 
  Compass, 
  Users, 
  ShoppingBag, 
  Trophy, 
  Send,
  X,
  FileText,
  Search,
} from 'lucide-react';
import {
  addDiscussion,
  listDiscussions,
  voteDiscussion,
  type Discussion,
  type DiscussionCategory,
  type DiscussionSort,
} from '../../features/comunidad/services/forumStore';

const PAGE_SIZE = 20;
const CATEGORIES: DiscussionCategory[] = [
  'Académico',
  'Vida Escolar',
  'Grupos de Estudio',
  'Intercambio',
  'Deportes',
];

export const ForoFeedPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [activeTab, setActiveTab] = useState<DiscussionSort>('recent');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DiscussionCategory>('Académico');
  const [newLead, setNewLead] = useState('');
  const [newBody, setNewBody] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedFeedKey, setLoadedFeedKey] = useState<string | null>(null);
  const composerDialogRef = useRef<HTMLDialogElement>(null);
  const composerTitleRef = useRef<HTMLInputElement>(null);
  const composerTriggerRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const categoryParam = searchParams.get('category');
  const categoryFilter = CATEGORIES.includes(categoryParam as DiscussionCategory)
    ? (categoryParam as DiscussionCategory)
    : undefined;
  const searchFilter = searchParams.get('search')?.trim() || undefined;
  const createRequested = searchParams.get('create') === 'true';
  const composerOpen = isModalOpen || createRequested;
  const feedKey = `${categoryFilter ?? ''}\u0000${searchFilter ?? ''}\u0000${activeTab}`;
  const feedLoading = isLoading || loadedFeedKey !== feedKey;
  const visibleDiscussions = loadedFeedKey === feedKey ? discussions : [];
  const visibleHasMore = loadedFeedKey === feedKey && hasMore;
  const visibleError = loadedFeedKey === feedKey ? error : null;

  useEffect(() => {
    const dialog = composerDialogRef.current;
    if (!dialog) return;

    if (composerOpen && !dialog.open) {
      const activeElement = document.activeElement;
      returnFocusRef.current = activeElement instanceof HTMLElement && activeElement !== document.body
        ? activeElement
        : composerTriggerRef.current;
      dialog.showModal();
      composerTitleRef.current?.focus();
    } else if (!composerOpen && dialog.open) {
      dialog.close();
      const returnTarget = returnFocusRef.current;
      if (returnTarget?.isConnected) requestAnimationFrame(() => returnTarget.focus());
    }
  }, [composerOpen]);

  const loadPage = useCallback((offset: number) => listDiscussions({
    category: categoryFilter,
    search: searchFilter,
    sort: activeTab,
    offset,
    limit: PAGE_SIZE,
  }), [activeTab, categoryFilter, searchFilter]);

  useEffect(() => {
    let cancelled = false;
    void loadPage(0).then((page) => {
      if (!cancelled) {
        setDiscussions(page.discussions);
        setHasMore(page.hasMore);
        setError(null);
        setLoadedFeedKey(feedKey);
      }
    }).catch(() => {
      if (!cancelled) {
        setError('No se pudieron cargar las discusiones. Volvé a intentar.');
        setLoadedFeedKey(feedKey);
      }
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [feedKey, loadPage]);

  async function refreshDiscussions() {
    const page = await loadPage(0);
    setDiscussions(page.discussions);
    setHasMore(page.hasMore);
  }

  async function handleVote(id: string, direction: 'up' | 'down') {
    setError(null);
    try {
      await voteDiscussion(id, direction);
      await refreshDiscussions();
    } catch {
      setError('No se pudo registrar tu voto. Volvé a intentar.');
    }
  }

  async function handleLoadMore() {
    setIsLoadingMore(true);
    setError(null);
    try {
      const page = await loadPage(discussions.length);
      setDiscussions((current) => [...current, ...page.discussions]);
      setHasMore(page.hasMore);
    } catch {
      setError('No se pudieron cargar más discusiones. Volvé a intentar.');
    } finally {
      setIsLoadingMore(false);
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setError(null);
    // Remove "create" query param from URL
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('create');
    setSearchParams(newParams);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLead.trim() || !newBody.trim()) {
      setError('Completá el título, la introducción y el contenido.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await addDiscussion({ category: newCategory, title: newTitle, lead: newLead, content: newBody });
      setNewTitle('');
      setNewLead('');
      setNewBody('');
      handleCloseModal();
      await refreshDiscussions();
    } catch {
      setError('No se pudo publicar el tema. Revisá los campos e intentá de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const search = String(formData.get('search') ?? '').trim();
    const newParams = new URLSearchParams(searchParams);
    if (search) newParams.set('search', search);
    else newParams.delete('search');
    setSearchParams(newParams);
  };

  const handleOpenComposer = () => {
    setError(null);
    setIsModalOpen(true);
  };

  const handleCategorySelect = (categoryName: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (categoryName) {
      newParams.set('category', categoryName);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const currentCategory = categoryFilter || 'Todas';

  const categoryIcons: Record<string, React.ReactNode> = {
    'Todas': <Compass size={16} />,
    'Académico': <GraduationCap size={16} />,
    'Vida Escolar': <Users size={16} />,
    'Grupos de Estudio': <MessageSquare size={16} />,
    'Intercambio': <ShoppingBag size={16} />,
    'Deportes': <Trophy size={16} />
  };

  return (
    <div className="space-y-6">
      
      {/* Bento Banner */}
      <div className="relative min-h-40 overflow-hidden rounded-2xl border border-slate-200/40 px-6 py-5 shadow-sm md:min-h-44 md:px-10">
        <img 
          src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200" 
          alt="Student Campus"
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-edu-primary/95 to-edu-secondary/40 mix-blend-multiply" />
        <div className="relative z-10 max-w-xl space-y-1 text-left text-white">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">Foro estudiantil</h1>
          <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
            La comunidad oficial de alumnos de Educar para Transformar. Compartí ideas, resolvé dudas y colaborá con tus compañeros.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <form onSubmit={handleSearchSubmit} role="search" className="flex min-w-0 flex-1 gap-2 sm:max-w-xl">
          <div className="min-w-0 flex-1">
            <label htmlFor="forum-search" className="mb-1 block text-xs font-semibold text-slate-600">Buscar discusiones</label>
            <input
              key={searchFilter ?? ''}
              id="forum-search"
              name="search"
              type="search"
              maxLength={120}
              defaultValue={searchFilter ?? ''}
              placeholder="Buscar por título o introducción..."
              className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary/20"
            />
          </div>
          <button type="submit" aria-label="Buscar" className="mb-0 inline-flex min-h-11 min-w-11 items-center justify-center self-end rounded-xl bg-edu-primary text-white hover:bg-edu-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary">
            <Search size={18} aria-hidden="true" />
          </button>
        </form>
        <button
          ref={composerTriggerRef}
          type="button"
          onClick={handleOpenComposer}
          aria-haspopup="dialog"
          aria-controls="new-forum-post-dialog"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-edu-secondary px-5 text-sm font-bold text-white transition-colors hover:bg-edu-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-primary"
        >
          <MessageSquare size={16} aria-hidden="true" />
          Nueva publicación
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Sidebar: Categories (Desktop only) */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categorías</h3>
            <nav className="flex flex-col gap-1">
              {['Todas', 'Académico', 'Vida Escolar', 'Grupos de Estudio', 'Intercambio', 'Deportes'].map((cat) => {
                const active = (cat === 'Todas' && !searchParams.get('category')) || searchParams.get('category') === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySelect(cat === 'Todas' ? null : cat)}
                    aria-pressed={active}
                    className={`flex min-h-11 items-center gap-3 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer text-left ${
                      active
                        ? 'bg-edu-secondary/10 text-edu-primary font-bold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-edu-secondary'
                    } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary`}
                  >
                    <div className={active ? 'text-edu-secondary' : 'text-slate-400'}>
                      {categoryIcons[cat]}
                    </div>
                    <span>{cat}</span>
                  </button>
                );
              })}
            </nav>
          </div>

        </aside>

        {/* Mobile Category Horizontal Slider */}
        <div className="lg:hidden flex overflow-x-auto pb-2 gap-2 -mx-4 px-4 scrollbar-none shrink-0">
          {['Todas', 'Académico', 'Vida Escolar', 'Grupos de Estudio', 'Intercambio', 'Deportes'].map((cat) => {
            const active = (cat === 'Todas' && !searchParams.get('category')) || searchParams.get('category') === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat === 'Todas' ? null : cat)}
                aria-pressed={active}
                className={`flex min-h-11 items-center gap-2 px-4 rounded-full text-xs font-semibold whitespace-nowrap border shrink-0 transition-all cursor-pointer ${
                  active
                    ? 'bg-edu-primary border-edu-primary text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-500'
                } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary`}
              >
                {categoryIcons[cat]}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Middle/Right Column: discussions feed */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Feed Filter controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/60 bg-white p-3 shadow-sm sm:px-5">
            <div className="flex flex-wrap gap-1 sm:gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('recent')}
                aria-pressed={activeTab === 'recent'}
                className={`inline-flex min-h-11 items-center rounded-lg px-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all sm:px-3 ${
                  activeTab === 'recent' 
                    ? 'border-b-2 border-edu-secondary text-edu-primary' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Recientes
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('trending')}
                aria-pressed={activeTab === 'trending'}
                className={`inline-flex min-h-11 items-center rounded-lg px-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all sm:px-3 ${
                  activeTab === 'trending' 
                    ? 'border-b-2 border-edu-secondary text-edu-primary' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Populares (Respuestas)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('popular')}
                aria-pressed={activeTab === 'popular'}
                className={`inline-flex min-h-11 items-center rounded-lg px-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all sm:px-3 ${
                  activeTab === 'popular' 
                    ? 'border-b-2 border-edu-secondary text-edu-primary' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Más Valoradas
              </button>
            </div>
            <div className="text-slate-400 flex items-center gap-1.5 text-xs font-semibold">
              <Filter size={14} />
              <span className="hidden sm:inline">Filtrado: {currentCategory}</span>
            </div>
          </div>

          {/* Discussions List */}
          {visibleError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{visibleError}</p>}

          {feedLoading ? (
            <div className="rounded-2xl border border-slate-200/60 bg-white py-16 text-center text-sm text-slate-500" role="status">
              Cargando discusiones...
            </div>
          ) : visibleDiscussions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm py-16 text-center max-w-lg mx-auto px-6">
              <div className="w-14 h-14 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={28} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No hay discusiones</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                No se encontraron publicaciones que coincidan con la búsqueda actual.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleDiscussions.map((disc) => (
                <article
                  key={disc.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex gap-4 items-start text-left relative group"
                >
                  {/* Upvote/Downvote panel */}
                  <div className="flex flex-col items-center bg-slate-50 rounded-lg py-1 px-1.5 gap-1 select-none border border-slate-100/50">
                      <button
                      type="button"
                      onClick={() => handleVote(disc.id, 'up')}
                      aria-label={`Votar a favor: ${disc.title}`}
                      aria-pressed={disc.userVoted === 'up'}
                      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded hover:bg-slate-200/50 transition-colors cursor-pointer ${
                        disc.userVoted === 'up' ? 'text-green-600' : 'text-slate-400'
                      } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary`}
                    >
                      <ChevronUp size={18} />
                    </button>
                    <span className={`text-xs font-bold leading-none ${
                      disc.userVoted === 'up' ? 'text-green-600' : disc.userVoted === 'down' ? 'text-red-500' : 'text-slate-700'
                    }`}>
                      {disc.score}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleVote(disc.id, 'down')}
                      aria-label={`Votar en contra: ${disc.title}`}
                      aria-pressed={disc.userVoted === 'down'}
                      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded hover:bg-slate-200/50 transition-colors cursor-pointer ${
                        disc.userVoted === 'down' ? 'text-red-500' : 'text-slate-400'
                      } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary`}
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>

                  {/* Post details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-edu-secondary/10 text-edu-primary text-[9px] font-bold uppercase rounded-full tracking-wider">
                        {disc.category}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Publicado por <strong className="text-slate-500 font-semibold">{disc.authorName}</strong> • {disc.date}
                      </span>
                    </div>

                    <Link to={`/alumnos/foro/discusion/${disc.id}`} className="block rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary">
                      <h3 className="text-sm md:text-base font-bold text-slate-800 hover:text-edu-secondary transition-colors leading-snug line-clamp-2">
                        {disc.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {disc.lead}
                    </p>

                    {/* Stats footer */}
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100/60">
                      <div className="flex gap-4">
                        <Link 
                          to={`/alumnos/foro/discusion/${disc.id}`}
                          className="inline-flex min-h-11 items-center gap-1.5 rounded px-2 text-[10px] font-bold text-slate-400 hover:text-edu-secondary transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary"
                        >
                          <MessageSquare size={13} />
                          <span>{disc.repliesCount} respuestas</span>
                        </Link>
                      </div>

                    </div>
                  </div>

                </article>
              ))}
            </div>
          )}

          {!feedLoading && visibleHasMore && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => void handleLoadMore()}
                disabled={isLoadingMore}
                className="min-h-11 rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary"
              >
                {isLoadingMore ? 'Cargando...' : 'Cargar más discusiones'}
              </button>
            </div>
          )}

        </div>

      </div>

      <dialog
        ref={composerDialogRef}
        id="new-forum-post-dialog"
        aria-labelledby="new-forum-post-title"
        onCancel={(event) => {
          event.preventDefault();
          handleCloseModal();
        }}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-sm"
      >
          <div className="animate-scaleUp">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h3 id="new-forum-post-title" className="font-bold text-sm text-edu-primary flex items-center gap-2 uppercase tracking-wide">
                <MessageSquare size={18} className="text-edu-secondary" />
                <span>Nueva Publicación en el Foro</span>
              </h3>
              <button
                type="button"
                aria-label="Cerrar formulario"
                onClick={handleCloseModal}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary"
              >
                <X size={18} />
              </button>
            </div>

            {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

            <form onSubmit={handleCreatePost} className="space-y-4 text-left">
              
              {/* Category */}
              <div className="space-y-1">
                <label htmlFor="forum-post-category" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Categoría del Tema
                </label>
                <select
                  id="forum-post-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as DiscussionCategory)}
                  className="min-h-11 w-full px-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-edu-secondary focus:border-edu-secondary text-slate-700 outline-none"
                >
                  <option value="Académico">Académico</option>
                  <option value="Vida Escolar">Vida Escolar</option>
                  <option value="Grupos de Estudio">Grupos de Estudio</option>
                  <option value="Intercambio">Intercambio</option>
                  <option value="Deportes">Deportes</option>
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label htmlFor="forum-post-title" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Título de la Discusión <span className="text-red-500">*</span>
                </label>
                <input
                  id="forum-post-title"
                  ref={composerTitleRef}
                  type="text"
                  maxLength={180}
                  placeholder="Ej: ¿Bibliografía recomendada para Análisis Matemático I?"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="min-h-11 w-full px-3 bg-slate-50 border border-slate-200 focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary/20 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  required
                />
              </div>

              {/* Lead / Short Summary */}
              <div className="space-y-1">
                <label htmlFor="forum-post-lead" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Introducción / Resumen Breve <span className="text-red-500">*</span>
                </label>
                <input
                  id="forum-post-lead"
                  type="text"
                  maxLength={200}
                  placeholder="Añade un subtítulo breve para el feed (máx 120 car.)..."
                  value={newLead}
                  onChange={(e) => setNewLead(e.target.value)}
                  className="min-h-11 w-full px-3 bg-slate-50 border border-slate-200 focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary/20 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  required
                />
              </div>

              {/* Content Body */}
              <div className="space-y-1">
                <label htmlFor="forum-post-content" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Explicación / Contenido de la Consulta <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="forum-post-content"
                  placeholder="Escribe en detalle tu consulta, propuesta o sugerencia..."
                  maxLength={10000}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  className="w-full h-32 bg-slate-50 border border-slate-200 focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary/20 rounded-lg p-3 text-xs text-slate-700 focus:outline-none placeholder:text-slate-400"
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="min-h-11 flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-11 flex-1 bg-edu-secondary hover:bg-edu-primary text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-1.5 disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-primary"
                >
                  <Send size={13} />
                  <span>{isSubmitting ? 'Publicando...' : 'Publicar Tema'}</span>
                </button>
              </div>

            </form>
          </div>
      </dialog>

    </div>
  );
};
