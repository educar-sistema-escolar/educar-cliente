import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Image as ImageIcon,
  Save,
  Send,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { newsStore } from '../../features/noticias/services/newsStore';
import type { Article } from '../../features/noticias/services/newsStore';

type ArticleCategory = Article['category'];

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado.'));
    reader.readAsDataURL(file);
  });
}

export const CreateNewsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const [title, setTitle] = useState('');
  const [lead, setLead] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [blockquote, setBlockquote] = useState('');
  const [category, setCategory] = useState<ArticleCategory>('Institucional');
  const [image, setImage] = useState('');
  const [inlineImages, setInlineImages] = useState<string[]>([]);
  const [author, setAuthor] = useState('Redacción Central');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [readTime, setReadTime] = useState('3 min');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;

    const article = newsStore.getArticleById(Number(id));
    if (!article) {
      navigate('/privado/noticias');
      return;
    }

    setTitle(article.title);
    setLead(article.lead);
    setContentBody(article.content.join('\n\n'));
    setBlockquote(article.blockquote || '');
    setCategory(article.category as ArticleCategory);
    setImage(article.image);
    setInlineImages(article.inlineImages ?? []);
    setAuthor(article.author);
    setReadTime(article.readTime);
  }, [id, isEditMode, navigate]);

  useEffect(() => {
    const text = `${title} ${lead} ${contentBody} ${blockquote}`;
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 220));
    setReadTime(`${minutes} min`);
  }, [blockquote, contentBody, lead, title]);

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(await readFileAsDataUrl(file));
    event.target.value = '';
  };

  const handleInlineUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    const dataUrls = await Promise.all(files.map((file) => readFileAsDataUrl(file)));
    setInlineImages((current) => [...current, ...dataUrls]);
    event.target.value = '';
  };

  const removeInlineImage = (index: number) => {
    setInlineImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!title || !lead || !contentBody) {
      alert('Completa los campos obligatorios: titulo, copete y cuerpo.');
      return;
    }

    setIsSubmitting(true);

    let formattedDate = date;
    if (date) {
      const parts = date.split('-');
      if (parts.length === 3) {
        const currentDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const months = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
        ];
        formattedDate = `${parts[2]} de ${months[currentDate.getMonth()]}, ${parts[0]}`;
      }
    }

    const content = contentBody
      .split('\n\n')
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    const currentArticle = isEditMode ? newsStore.getArticleById(Number(id)) : undefined;

    const articleData = {
      category,
      title,
      date: formattedDate,
      author,
      readTime,
      image: image || currentArticle?.image || '',
      lead,
      content,
      blockquote,
      isFeatured: currentArticle?.isFeatured ?? false,
      inlineImages,
    };

    window.setTimeout(() => {
      if (isEditMode) {
        newsStore.updateArticle(Number(id), articleData);
      } else {
        newsStore.addArticle(articleData);
      }

      setIsSubmitting(false);
      setShowSuccessModal(true);
    }, 600);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <Link
          to="/privado/noticias"
          className="group inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-edu-muted transition-colors hover:text-edu-secondary"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          <span>Volver a gestión</span>
        </Link>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex h-9 flex-grow items-center justify-center gap-1.5 rounded-lg border border-edu-border bg-white px-4 text-[11px] font-bold uppercase tracking-wider text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:text-slate-900 sm:flex-grow-0 cursor-pointer"
          >
            <Save size={14} />
            <span>Guardar</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex h-9 flex-grow items-center justify-center gap-1.5 rounded-lg bg-edu-secondary px-5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm shadow-edu-secondary/20 transition-all hover:bg-edu-secondary-dark disabled:bg-edu-secondary/70 sm:flex-grow-0 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Publicar</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-grow space-y-5 lg:max-w-3xl">
          <div className="space-y-4 rounded-xl border border-edu-border/60 bg-white p-5 shadow-sm">
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-edu-muted">
                <FileText size={12} /> Título de la noticia
              </label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Escribe un título atractivo..."
                className="w-full border-none bg-transparent px-0 text-lg font-bold text-edu-primary placeholder:text-slate-300 focus:outline-none md:text-xl"
                required
              />
            </div>
            <hr className="border-edu-border/60" />
            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase tracking-wide text-edu-muted">Copete / introducción</label>
              <textarea
                value={lead}
                onChange={(event) => setLead(event.target.value)}
                placeholder="Amplía el contexto principal de la noticia..."
                className="w-full resize-none border-none bg-transparent px-0 text-sm font-medium text-slate-600 placeholder:text-slate-300 focus:outline-none"
                rows={3}
                required
              />
            </div>
          </div>

          <div className="space-y-5 rounded-xl border border-edu-border/60 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-edu-border/60 pb-3">
              <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-700">
                <BookOpen size={14} className="text-edu-secondary" />
                <span>Cuerpo y cita destacada</span>
              </h3>
              <span className="text-[9px] text-edu-muted">Párrafos separados con doble salto</span>
            </div>
            <div className="space-y-2">
              <label className="block text-[9px] font-bold uppercase tracking-wide text-edu-muted">Contenido principal</label>
              <textarea
                value={contentBody}
                onChange={(event) => setContentBody(event.target.value)}
                placeholder="Escribe el cuerpo completo de la noticia..."
                className="min-h-[260px] w-full rounded-lg border border-edu-border bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 placeholder:text-slate-400 transition-all focus:border-edu-secondary focus:outline-none focus:ring-2 focus:ring-edu-secondary/20 focus:bg-white"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[9px] font-bold uppercase tracking-wide text-edu-muted">Cita destacada</label>
              <textarea
                value={blockquote}
                onChange={(event) => setBlockquote(event.target.value)}
                placeholder="Agrega una frase o testimonio para resaltar..."
                className="w-full resize-none rounded-lg border border-edu-border bg-slate-50 p-3 text-xs italic text-slate-600 transition-all focus:border-edu-secondary focus:outline-none focus:ring-2 focus:ring-edu-secondary/20 focus:bg-white"
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="w-full shrink-0 space-y-5 lg:w-[300px]">
          <div className="space-y-4 rounded-xl border border-edu-border/60 bg-white p-5 shadow-sm">
            <label className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-edu-muted">
              <ImageIcon size={12} /> Imagen principal
            </label>
            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-edu-border bg-slate-50">
              {image ? (
                <img src={image} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="p-4 text-center">
                  <ImageIcon size={28} className="mx-auto mb-1.5 text-slate-300" />
                  <p className="text-[10px] text-edu-muted">Sin imagen de portada</p>
                </div>
              )}
            </div>
            <input
              type="text"
              value={image}
              onChange={(event) => setImage(event.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="h-9 w-full rounded-lg border border-edu-border bg-white px-3 text-xs text-slate-700 outline-none transition-all focus:border-edu-secondary focus:ring-1 focus:ring-edu-secondary"
            />
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-200">
              <Upload size={13} />
              <span>Subir portada</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </label>
          </div>

          <div className="space-y-4 rounded-xl border border-edu-border/60 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-edu-muted">
                <ImageIcon size={12} /> Imágenes internas
              </span>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-200">
                <Upload size={13} />
                <span>Agregar</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleInlineUpload} />
              </label>
            </div>
            {inlineImages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-edu-border bg-slate-50 px-4 py-5 text-center text-xs text-edu-muted">
                Sin imágenes internas aún.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {inlineImages.map((inlineImage, index) => (
                  <div key={`${inlineImage.slice(0, 20)}-${index}`} className="space-y-1.5">
                    <img src={inlineImage} alt="" className="aspect-video w-full rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => removeInlineImage(index)}
                      className="inline-flex cursor-pointer items-center gap-1 text-[9px] font-bold uppercase tracking-wide text-red-600 transition hover:text-red-700"
                    >
                      <Trash2 size={11} />
                      <span>Quitar</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-xl border border-edu-border/60 bg-white p-5 shadow-sm">
            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-edu-muted">Categoría</label>
              <select value={category} onChange={(event) => setCategory(event.target.value as ArticleCategory)} className="h-9 w-full rounded-lg border border-edu-border bg-white px-3 text-xs text-slate-700 outline-none transition-all focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary">
                <option value="Institucional">Institucional</option>
                <option value="Académico">Académico</option>
                <option value="Comunidad">Comunidad</option>
                <option value="Deportes">Deportes</option>
                <option value="Eventos">Eventos</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-edu-muted">Autor</label>
              <div className="relative">
                <input
                  type="text"
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  className="h-9 w-full rounded-lg border border-edu-border bg-white pl-8 pr-3 text-xs text-slate-700 outline-none transition-all focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary"
                />
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-edu-muted">Fecha</label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="h-9 w-full rounded-lg border border-edu-border bg-white pl-8 pr-3 text-xs text-slate-700 outline-none transition-all focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary"
                />
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-edu-muted" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-edu-border bg-gradient-to-br from-slate-50 to-white p-2.5">
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-edu-muted">
                <Clock size={12} className="text-edu-muted" />
                <span>Lectura</span>
              </div>
              <span className="text-xs font-bold text-edu-primary">{readTime}</span>
            </div>
          </div>
        </div>
      </form>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-edu-border bg-white p-5 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-green-50 text-green-600 shadow-sm">
              <CheckCircle size={24} />
            </div>
            <p className="text-base font-bold text-slate-800">
              {isEditMode ? 'Noticia actualizada' : 'Noticia publicada'}
            </p>
            <p className="text-xs leading-relaxed text-edu-muted">
              Los cambios quedaron guardados en la gestión local.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate('/privado/noticias')}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-edu-primary px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-edu-secondary cursor-pointer"
              >
                Volver a noticias
              </button>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-100 px-4 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 cursor-pointer"
              >
                Seguir editando
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
