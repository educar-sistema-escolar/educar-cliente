import React, { useState } from 'react';
import { MessageSquare, Search, Calendar, User, Clock, ArrowLeft, ChevronRight, Send, ShieldCheck } from 'lucide-react';
import imagenHero from '../../assets/service/hero-noticias.jpg';

import { newsStore } from '../../features/noticias/services/newsStore';
import type { Article } from '../../features/noticias/services/newsStore';
import { addComment, getCommentsByNewsId } from '../../features/comentarios/services/commentsStore';

/**
 * Portal de Noticias y Novedades.
 * Proporciona una interfaz editorial premium que emula la estética de un portal de noticias universitario clásico,
 * permitiendo búsqueda en tiempo real, filtrado por categorías institucionales, paginación,
 * y visualización interactiva del detalle de cada noticia de forma dinámica.
 */
export const NewsPage: React.FC = () => {
  // Catálogo completo de artículos institucionales y académicos reales cargado dinámicamente
  const newsArticles: Article[] = newsStore.getArticles();

  // Estados reactivos locales de filtrado, búsqueda, paginación y navegación interna
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [activePage, setActivePage] = useState(1);

  // Estado para comentarios (declarado fuera del condicional para respetar las Reglas de los Hooks)
  const [commentForm, setCommentForm] = useState({ authorName: '', authorEmail: '', content: '' });
  const [commentFeedback, setCommentFeedback] = useState<string | null>(null);

  // Categorías de visualización en la cabecera
  const categories = ['Todas', 'Institucional', 'Académico', 'Comunidad', 'Deportes', 'Eventos'];

  // Filtrado reactivo bimodal en base a barra de búsqueda y categorías seleccionadas
  const filteredArticles = newsArticles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.lead.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Segregación de artículos entre destacado y la grilla general
  const featuredNews = filteredArticles.find((article) => article.isFeatured);
  const regularNews = filteredArticles.filter((article) => !article.isFeatured);

  // Manejo fluido de las transiciones de navegación
  const handleArticleClick = (id: number) => {
    setSelectedArticleId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSelectedArticleId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Renderizado del detalle de una noticia específica
  if (selectedArticleId !== null) {
    const article = newsArticles.find((a) => a.id === selectedArticleId);
    if (!article) return null;
    const comments = getCommentsByNewsId(article.id);

    const handleCommentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentForm.authorName.trim() || !commentForm.authorEmail.trim() || !commentForm.content.trim()) {
        setCommentFeedback('Completá todos los campos para enviar tu comentario.');
        return;
      }
      if (commentForm.content.trim().length < 5) {
        setCommentFeedback('El comentario debe tener al menos 5 caracteres.');
        return;
      }
      const result = addComment(article.id, {
        authorName: commentForm.authorName.trim(),
        authorEmail: commentForm.authorEmail.trim(),
        content: commentForm.content.trim(),
      });
      if ('error' in result) {
        setCommentFeedback(result.error);
        return;
      }
      setCommentForm({ authorName: '', authorEmail: '', content: '' });
      setCommentFeedback('¡Gracias! Tu comentario quedó pendiente de moderación.');
    };

    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn font-sans">
        {/* Botón de retroceso al listado */}
        <button
          onClick={handleBackToList}
          className="inline-flex items-center gap-2 text-edu-primary text-xs font-bold uppercase mb-8 hover:text-edu-secondary transition-colors group cursor-pointer"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Volver al listado</span>
        </button>

        {/* Encabezado del Artículo */}
        <header className="mb-10 max-w-4xl mx-auto text-center">
          <div className="inline-block bg-edu-secondary/15 text-edu-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            {article.category}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-edu-dark leading-tight mb-6">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-slate-500 text-xs">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              {article.date}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="flex items-center gap-1.5">
              <User size={14} className="text-slate-400" />
              Por {article.author}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-slate-400" />
              {article.readTime} de lectura
            </span>
          </div>
        </header>

        {/* Imagen Destacada del Artículo */}
        <figure className="mb-12 max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-lg border border-slate-100">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-auto aspect-[16/9] md:aspect-[21/9] object-cover"
          />
        </figure>

        {/* Cuerpo / Contenido del Artículo */}
        <article className="max-w-3xl mx-auto text-slate-700 text-base md:text-lg leading-relaxed space-y-6">
          <p className="text-xl md:text-2xl text-edu-primary font-medium leading-relaxed">
            {article.lead}
          </p>

          {article.content.map((paragraph, index) => (
            <React.Fragment key={index}>
              <p>{paragraph}</p>
              
              {/* Inserción estética de la cita en el primer párrafo */}
              {index === 0 && article.blockquote && (
                <blockquote className="border-l-4 border-edu-secondary bg-slate-50 p-6 md:p-8 my-8 italic text-lg md:text-xl text-edu-primary rounded-r-xl">
                  "{article.blockquote}"
                </blockquote>
              )}

              {/* Inserción estética de imágenes de galería en el segundo párrafo */}
              {index === 1 && article.inlineImages && article.inlineImages.length > 0 && (
                <div className="grid grid-cols-2 gap-4 my-8">
                  {article.inlineImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Detalle de galería institucional"
                      className="w-full h-40 md:h-56 object-cover rounded-xl shadow-sm hover:opacity-95 transition-opacity"
                    />
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
        </article>

        {/* Divisor Separador */}
        <hr className="border-t border-slate-200 my-16 max-w-5xl mx-auto" />

        {/* Sección de Comentarios */}
        <section className="max-w-3xl mx-auto mb-16">
          <div className="flex items-center gap-2 mb-8">
            <MessageSquare className="h-5 w-5 text-edu-primary" />
            <h3 className="text-2xl font-bold text-edu-dark">Comentarios</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
              {comments.length}
            </span>
          </div>

          {commentFeedback && (
            <div className="mb-5 flex items-start gap-2 rounded-2xl border border-edu-secondary/30 bg-edu-secondary/10 px-4 py-3 text-sm text-edu-primary">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{commentFeedback}</span>
            </div>
          )}

          {/* Formulario de comentario */}
          <form onSubmit={handleCommentSubmit} className="mb-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-700">Dejá tu comentario</h4>
            <p className="text-[11px] text-slate-400 -mt-2">Los comentarios son moderados antes de publicarse.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Tu nombre"
                value={commentForm.authorName}
                onChange={e => setCommentForm(f => ({ ...f, authorName: e.target.value }))}
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs outline-none focus:border-edu-primary"
              />
              <input
                type="email"
                placeholder="Tu correo electrónico"
                value={commentForm.authorEmail}
                onChange={e => setCommentForm(f => ({ ...f, authorEmail: e.target.value }))}
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs outline-none focus:border-edu-primary"
              />
            </div>
            <textarea
              placeholder="Escribí tu comentario..."
              value={commentForm.content}
              onChange={e => setCommentForm(f => ({ ...f, content: e.target.value }))}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs outline-none focus:border-edu-primary resize-none"
            />
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-edu-primary px-5 text-xs font-bold text-white hover:bg-edu-secondary transition-all cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              Publicar comentario
            </button>
          </form>

          {/* Lista de comentarios */}
          {comments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <MessageSquare className="mx-auto h-6 w-6 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">No hay comentarios aún. ¡Sé el primero!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="rounded-2xl border border-slate-100 bg-white p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{comment.authorName}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleDateString('es-AR', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Sección de Artículos Relacionados */}
        <section className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-edu-dark">Noticias Relacionadas</h3>
            <button
              onClick={handleBackToList}
              className="text-edu-secondary text-xs font-bold uppercase hover:text-edu-primary transition-all hover:underline"
            >
              Ver todas
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newsArticles
              .filter((a) => a.id !== article.id)
              .slice(0, 3)
              .map((related) => (
                <div
                  key={related.id}
                  onClick={() => handleArticleClick(related.id)}
                  className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-slate-100 transition-all duration-300 cursor-pointer"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={related.image}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 bg-white/90 text-edu-primary text-[9px] font-bold uppercase rounded-full shadow-sm">
                        {related.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="text-sm font-bold text-edu-dark mb-2 line-clamp-2 leading-snug group-hover:text-edu-secondary transition-colors duration-300">
                      {related.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {related.lead}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>
    );
  }

  // Renderizado del listado principal (Portal de Noticias)
  return (
    <div className="animate-fadeIn font-sans">
      {/* Sección Hero con buscador integrado y diseño institucional */}
      <section 
        className="relative w-full py-16 md:py-24 flex flex-col items-center justify-center bg-edu-primary" 
        style={{ backgroundImage: `url(${imagenHero})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-edu-dark/75 mix-blend-multiply"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto w-full flex flex-col items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Noticias y Novedades</h1>
            <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed">
              La actualidad y el pensamiento pedagógico de Educar Para Transformar, analizados desde una perspectiva humana e intelectual.
            </p>
          </div>
          <div className="w-full max-w-2xl relative mt-4">
            <input
              type="text"
              aria-label="Buscar noticias"
              placeholder="Buscar artículos, eventos, novedades..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActivePage(1);
              }}
              className="w-full bg-white py-4 pl-6 pr-12 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-edu-secondary focus:border-edu-secondary text-sm text-slate-800 shadow-lg transition-all"
            />
            <Search size={20} aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </section>

      {/* Selector de Categorías Estilo Pestañas */}
      <section className="py-6 border-b border-slate-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setActivePage(1);
              }}
              className={`px-5 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                selectedCategory === category
                  ? 'bg-edu-primary text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Grid de Noticias Catalogadas */}
      <section className="py-10">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            No se encontraron noticias que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="space-y-12">
            {/* Noticia Destacada Horizontal */}
            {featuredNews && (
              <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="mb-6 border-b border-slate-200 pb-3">
                  <h2 className="text-2xl font-semibold text-edu-dark">Destacado</h2>
                </div>
                <div
                  onClick={() => handleArticleClick(featuredNews.id)}
                  className="group relative rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col md:flex-row h-auto md:h-[420px] border border-slate-100"
                >
                  <div className="w-full md:w-2/3 h-[280px] md:h-full relative overflow-hidden">
                    <img
                      src={featuredNews.image}
                      alt={featuredNews.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950/80 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 md:hidden">
                      <span className="inline-block px-3 py-1 bg-edu-secondary/20 text-white text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-md border border-white/20 mb-3">
                        {featuredNews.category}
                      </span>
                      <h3 className="text-xl font-bold text-white leading-tight">
                        {featuredNews.title}
                      </h3>
                    </div>
                  </div>

                  <div className="w-full md:w-1/3 bg-white p-8 flex flex-col justify-center relative z-10 md:-ml-16 md:my-8 md:rounded-2xl md:shadow-2xl md:border border-slate-100 transition-transform duration-500 group-hover:-translate-y-1">
                    <div className="hidden md:block mb-3">
                      <span className="inline-block px-3 py-1 bg-edu-primary/10 text-edu-primary text-xs font-bold uppercase tracking-wider rounded-full">
                        {featuredNews.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs">
                      <Calendar size={14} />
                      <span>{featuredNews.date}</span>
                    </div>
                    <h3 className="hidden md:block text-2xl font-bold text-edu-dark mb-4 leading-tight group-hover:text-edu-secondary transition-colors duration-300">
                      {featuredNews.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 line-clamp-3 leading-relaxed">
                      {featuredNews.lead}
                    </p>
                    <button className="inline-flex items-center gap-2 text-xs font-bold uppercase text-white bg-edu-primary px-6 py-3.5 rounded-xl hover:bg-edu-secondary transition-colors self-start shadow-md">
                      <span>Leer noticia</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Grilla de Noticias Regulares */}
            {regularNews.length > 0 && (
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-3">
                  <h2 className="text-2xl font-semibold text-edu-dark">Últimas Noticias</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularNews.map((article) => (
                    <article
                      key={article.id}
                      onClick={() => handleArticleClick(article.id)}
                      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col border border-slate-100 cursor-pointer"
                    >
                      <div className="relative h-[220px] overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-white/90 text-edu-primary text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm backdrop-blur-sm">
                            {article.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs">
                          <Calendar size={12} />
                          <span>{article.date}</span>
                        </div>
                        <h3 className="text-lg font-bold text-edu-dark mb-2 line-clamp-2 leading-tight group-hover:text-edu-secondary transition-colors duration-300">
                          {article.title}
                        </h3>
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2 flex-grow leading-relaxed">
                          {article.lead}
                        </p>
                        <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase text-edu-primary group-hover:text-edu-secondary transition-colors mt-2">
                          <span>Leer más</span>
                          <ChevronRight size={12} />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Paginación */}
            <div className="flex gap-2 justify-center pt-8">
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  onClick={() => setActivePage(page)}
                  className={`w-9 h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    activePage === page
                      ? 'bg-edu-primary text-white shadow-md'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setActivePage(activePage < 3 ? activePage + 1 : 3)}
                className="w-9 h-9 rounded-lg text-xs font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

