import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Calendar, 
  Edit3, 
  Trash2, 
  Eye, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { newsStore } from '../../features/noticias/services/newsStore';
import type { Article } from '../../features/noticias/services/newsStore';

export const NewsManagementPage: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

  useEffect(() => {
    setArticles(newsStore.getArticles());
  }, []);

  const handleDelete = (id: number) => {
    newsStore.deleteArticle(id);
    setArticles(newsStore.getArticles());
    setShowDeleteModal(null);
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.lead.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'Todas' || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Todas', 'Institucional', 'Académico', 'Comunidad', 'Deportes', 'Eventos'];

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-edu-border/60 bg-gradient-to-br from-white via-white to-edu-secondary/[0.02] p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-edu-secondary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-edu-secondary">
              <Sparkles className="h-3.5 w-3.5" />
              Contenido institucional
            </span>
            <h1 className="mt-2 text-lg font-bold text-edu-primary">
              Gestión de Noticias
            </h1>
          </div>
          <Link
            to="/privado/crear-noticia"
            className="w-full md:w-auto h-9 px-4 bg-edu-secondary hover:bg-edu-secondary-dark text-white rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-edu-secondary/20"
          >
            <Plus size={14} />
            <span>Nueva Noticia</span>
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-edu-border/60 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" />
            <input
              type="text"
              placeholder="Buscar por título o introducción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3.5 bg-slate-50 border border-edu-border rounded-lg text-xs outline-none focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary/10 text-slate-800 transition-all"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 px-3 bg-slate-50 border border-edu-border rounded-lg text-xs outline-none focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary/10 text-slate-700 transition-all"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'Todas' ? 'Todas las categorías' : cat}
              </option>
            ))}
          </select>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="py-14 text-center max-w-lg mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-edu-secondary/10 to-edu-primary/5">
              <FileText size={24} className="text-edu-secondary/60" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-800">No se encontraron noticias</h3>
            <p className="mt-1 text-xs text-edu-muted leading-relaxed">
              {searchQuery || categoryFilter !== 'Todas' 
                ? 'Intentá modificando los filtros o la búsqueda.' 
                : 'Todavía no hay noticias creadas. ¡Comenzá redactando la primera!'}
            </p>
            {(searchQuery || categoryFilter !== 'Todas') && (
              <button
                onClick={() => { setSearchQuery(''); setCategoryFilter('Todas'); }}
                className="mt-4 text-xs font-bold text-edu-secondary hover:text-edu-primary underline cursor-pointer"
              >
                Restablecer filtros
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="group rounded-xl border border-edu-border/60 bg-white p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all flex flex-col sm:flex-row gap-4"
              >
                <div className="w-full sm:w-32 h-22 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-edu-border">
                  <img
                    src={article.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200'}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=200';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 bg-edu-secondary/10 text-edu-primary text-[9px] font-bold uppercase rounded-md tracking-wider">
                      {article.category}
                    </span>
                    <span className="text-[10px] text-edu-muted flex items-center gap-1">
                      <Calendar size={10} />
                      {article.date}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-edu-secondary transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{article.lead}</p>
                  <p className="text-[10px] text-edu-muted mt-1.5">
                    Por <span className="font-semibold text-slate-500">{article.author}</span>
                    <span className="mx-1">·</span>
                    {article.readTime}
                  </p>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-edu-border pt-3 sm:pt-0">
                  <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-lg border border-green-100/60">
                    <CheckCircle size={10} className="text-green-600" />
                    <span className="text-[8px] font-bold uppercase tracking-wider">Publicada</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/privado/editar-noticia/${article.id}`}
                      title="Editar"
                      className="p-1.5 text-edu-muted hover:text-edu-secondary hover:bg-slate-50 rounded-lg border border-edu-border/40 hover:border-edu-secondary/30 transition-all cursor-pointer"
                    >
                      <Edit3 size={14} />
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(article.id)}
                      title="Eliminar"
                      className="p-1.5 text-edu-muted hover:text-red-600 hover:bg-red-50 rounded-lg border border-edu-border/40 hover:border-red-200/30 transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                    <a
                      href="/noticias"
                      target="_blank"
                      rel="noreferrer"
                      title="Ver en portal"
                      className="p-1.5 text-edu-muted hover:text-slate-800 hover:bg-slate-50 rounded-lg border border-edu-border/40 hover:border-slate-300 transition-all cursor-pointer"
                    >
                      <Eye size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {showDeleteModal !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-edu-border text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-red-100 text-red-600 shadow-sm">
              <AlertTriangle size={22} />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-sm text-slate-800">¿Confirmás la eliminación?</h3>
              <p className="text-xs text-edu-muted leading-relaxed">
                Se borrará permanentemente{' '}
                <strong>"{articles.find(a => a.id === showDeleteModal)?.title}"</strong> del portal.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="flex-1 h-10 rounded-xl bg-edu-danger hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
