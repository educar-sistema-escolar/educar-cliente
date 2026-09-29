import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageSquare, 
  Send,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import {
  addReply,
  getDiscussionById,
  voteDiscussion,
  voteReply,
  type Discussion,
} from '../../features/comunidad/services/forumStore';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const ForoThreadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loadedDiscussion, setLoadedDiscussion] = useState<Discussion | null>(null);
  const [loadedDiscussionId, setLoadedDiscussionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadedError, setLoadedError] = useState<string | null>(null);
  const [newReplyContent, setNewReplyContent] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [nestedReplyContent, setNestedReplyContent] = useState('');
  const discussion = loadedDiscussionId === id ? loadedDiscussion : null;
  const isLoading = Boolean(id && UUID_PATTERN.test(id) && loadedDiscussionId !== id);
  const error = loadedDiscussionId === id ? loadedError : null;

  useEffect(() => {
    let cancelled = false;
    if (!id || !UUID_PATTERN.test(id)) {
      navigate('/alumnos/foro', { replace: true });
      return;
    }
    void getDiscussionById(id).then((thread) => {
      if (cancelled) return;
      if (thread) {
        setLoadedDiscussion(thread);
        setLoadedError(null);
        setLoadedDiscussionId(id);
      } else navigate('/alumnos/foro', { replace: true });
    }).catch(() => {
      if (!cancelled) {
        setLoadedError('No se pudo cargar esta discusión. Volvé a intentar.');
        setLoadedDiscussionId(id);
        setLoadedDiscussion(null);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  async function refreshThread() {
    if (!id) return;
    const thread = await getDiscussionById(id);
    if (thread) {
      setLoadedDiscussion(thread);
      setLoadedDiscussionId(id);
      setLoadedError(null);
    }
    else navigate('/alumnos/foro', { replace: true });
  }

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReplyContent.trim() || !discussion) return;

    setIsSubmitting(true);
    setLoadedError(null);
    try {
      await addReply(discussion.id, newReplyContent);
      setNewReplyContent('');
      await refreshThread();
    } catch {
      setLoadedError('No se pudo publicar la respuesta. Volvé a intentar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePostNestedReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!nestedReplyContent.trim() || !discussion) return;

    setIsSubmitting(true);
    setLoadedError(null);
    try {
      await addReply(discussion.id, nestedReplyContent, parentId);
      setNestedReplyContent('');
      setActiveReplyId(null);
      await refreshThread();
    } catch {
      setLoadedError('No se pudo publicar la respuesta. Volvé a intentar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoteDiscussion = async (dir: 'up' | 'down') => {
    if (!discussion) return;
    setLoadedError(null);
    try {
      await voteDiscussion(discussion.id, dir);
      await refreshThread();
    } catch {
      setLoadedError('No se pudo registrar tu voto. Volvé a intentar.');
    }
  };

  const handleVoteReply = async (replyId: string, dir: 'up' | 'down') => {
    if (!discussion) return;
    setLoadedError(null);
    try {
      await voteReply(replyId, dir);
      await refreshThread();
    } catch {
      setLoadedError('No se pudo registrar tu voto. Volvé a intentar.');
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-slate-400" role="status">Cargando discusión...</div>;
  }

  if (!discussion) {
    return (
      <div className="py-20 text-center text-slate-500">
        <p role="alert">{error || 'No se encontró esta discusión.'}</p>
        <Link to="/alumnos/foro" className="mt-4 inline-flex rounded-lg bg-edu-primary px-4 py-2 text-xs font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary">
          Volver al foro
        </Link>
      </div>
    );
  }

  // Group replies by parent (separate root replies from nested replies)
  const rootReplies = discussion.replies.filter(r => r.parentId === null);
  const getNestedReplies = (parentId: string) => {
    return discussion.replies.filter(r => r.parentId === parentId);
  };

  return (
    <div className="space-y-6 text-left">
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</p>}
      
      {/* Back button */}
      <div>
        <Link
          to="/alumnos/foro"
          className="inline-flex min-h-11 items-center gap-2 rounded px-2 text-slate-500 hover:text-edu-secondary transition-colors text-xs font-bold uppercase tracking-wider group cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span>Volver al foro</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        
        {/* Left Column: Post and Thread replies */}
        <div className="lg:col-span-12 space-y-6">
          
          {/* Main Original Post Card */}
          <article className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-5">
            <header>
              <div className="flex items-center gap-3">
                <div aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-100 bg-edu-primary text-xs font-bold uppercase text-white">
                  {discussion.authorName.slice(0, 2)}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800 leading-none">{discussion.authorName}</p>
                  <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wide">
                    {discussion.authorRole} • {discussion.date}
                  </p>
                </div>
              </div>
            </header>

            <h1 className="text-base md:text-lg font-bold text-edu-primary leading-tight">
              {discussion.title}
            </h1>

            <div className="text-xs md:text-sm text-slate-600 leading-relaxed space-y-3 font-normal">
              {discussion.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            <footer className="pt-4 border-t border-slate-100 flex items-center justify-between">
              
              {/* Score / Voting for Post */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg p-0.5 select-none">
                <button
                  type="button"
                  onClick={() => handleVoteDiscussion('up')}
                  aria-label="Votar a favor de la discusión"
                  aria-pressed={discussion.userVoted === 'up'}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded hover:bg-slate-200/50 transition-colors cursor-pointer ${
                    discussion.userVoted === 'up' ? 'text-green-600' : 'text-slate-400'
                  } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary`}
                  title="Me gusta"
                >
                  <ChevronUp size={16} />
                </button>
                <span className={`text-[11px] font-bold px-1.5 min-w-[20px] text-center ${
                  discussion.userVoted === 'up' ? 'text-green-600' : discussion.userVoted === 'down' ? 'text-red-500' : 'text-slate-600'
                }`}>
                  {discussion.score}
                </span>
                <button
                  type="button"
                  onClick={() => handleVoteDiscussion('down')}
                  aria-label="Votar en contra de la discusión"
                  aria-pressed={discussion.userVoted === 'down'}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded hover:bg-slate-200/50 transition-colors cursor-pointer ${
                    discussion.userVoted === 'down' ? 'text-red-500' : 'text-slate-400'
                  } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary`}
                  title="No me gusta"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              <div className="flex items-center gap-4 text-slate-400 text-[10px] font-bold uppercase">
                <div className="flex items-center gap-1">
                  <MessageSquare size={13} />
                  <span>{discussion.repliesCount} Comentarios</span>
                </div>
              </div>

            </footer>
          </article>

          {/* Comment/Reply Input Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex gap-4 items-start border-l-4 border-edu-secondary">
            <div aria-hidden="true" className="w-9 h-9 rounded-full bg-edu-secondary text-white font-bold text-xs flex items-center justify-center shrink-0">
              Tú
            </div>
            <form onSubmit={handlePostReply} className="flex-grow space-y-3">
              <textarea
                aria-label="Escribí una respuesta"
                value={newReplyContent}
                onChange={(e) => setNewReplyContent(e.target.value)}
                placeholder="Escribe tu aporte, consejo o pregunta sobre este tema..."
                maxLength={2000}
                className="w-full bg-slate-50 border border-slate-200 focus:border-edu-secondary focus:ring-2 focus:ring-edu-secondary/20 rounded-lg p-3 text-xs text-slate-700 focus:outline-none min-h-[80px] resize-none placeholder:text-slate-400"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-11 px-5 bg-edu-primary hover:bg-edu-secondary text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary"
                >
                  <Send size={12} aria-hidden="true" />
                  <span>{isSubmitting ? 'Publicando...' : 'Publicar Comentario'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Thread Replies List */}
          <section className="space-y-4">
            
            {rootReplies.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Aún no hay comentarios. Sé el primero en responder.
              </div>
            ) : (
              rootReplies.map((reply) => {
                const nested = getNestedReplies(reply.id);
                return (
                  <div key={reply.id} className="space-y-3">
                    
                    {/* Root Reply Card */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm space-y-3">
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div aria-hidden="true" className="w-8 h-8 rounded-full bg-edu-primary text-white font-bold text-[10px] flex items-center justify-center overflow-hidden border border-slate-100">
                            {reply.authorName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-slate-800 leading-none">
                              {reply.authorName} <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide ml-2 bg-slate-50 px-1.5 py-0.5 rounded">{reply.authorRole}</span>
                            </p>
                            <p className="text-[9px] text-slate-400 mt-1">{reply.date}</p>
                          </div>
                        </div>

                        {/* Comment Votes panel */}
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-md py-0.5 px-1 select-none">
                          <button
                            type="button"
                            onClick={() => handleVoteReply(reply.id, 'up')}
                            aria-label={`Votar a favor de la respuesta de ${reply.authorName}`}
                            aria-pressed={reply.userVoted === 'up'}
                            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded hover:bg-slate-200/50 transition-colors cursor-pointer ${
                              reply.userVoted === 'up' ? 'text-green-600' : 'text-slate-400'
                            } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary`}
                          >
                            <ChevronUp size={14} />
                          </button>
                          <span className={`text-[10px] font-bold px-1 min-w-[12px] text-center ${
                            reply.userVoted === 'up' ? 'text-green-600' : reply.userVoted === 'down' ? 'text-red-500' : 'text-slate-600'
                          }`}>
                            {reply.score}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleVoteReply(reply.id, 'down')}
                            aria-label={`Votar en contra de la respuesta de ${reply.authorName}`}
                            aria-pressed={reply.userVoted === 'down'}
                            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded hover:bg-slate-200/50 transition-colors cursor-pointer ${
                              reply.userVoted === 'down' ? 'text-red-500' : 'text-slate-400'
                            } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary`}
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed pl-10">
                        {reply.content}
                      </p>

                      <div className="pl-10 flex gap-4 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveReplyId(activeReplyId === reply.id ? null : reply.id);
                            setNestedReplyContent('');
                          }}
                          className="inline-flex min-h-11 items-center rounded px-2 hover:text-edu-secondary transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary"
                        >
                          Responder
                        </button>
                      </div>

                      {/* Inline Reply input for nested replying */}
                      {activeReplyId === reply.id && (
                        <form
                          onSubmit={(e) => handlePostNestedReply(e, reply.id)}
                          className="pl-10 mt-3 pt-3 border-t border-slate-100 flex gap-3 items-end"
                        >
                          <textarea
                            aria-label={`Responder a ${reply.authorName}`}
                            value={nestedReplyContent}
                            onChange={(e) => setNestedReplyContent(e.target.value)}
                            placeholder={`Responder a ${reply.authorName}...`}
                            maxLength={2000}
                            className="flex-grow bg-slate-50 border border-slate-200 focus:border-edu-secondary focus:ring-1 focus:ring-edu-secondary rounded-lg p-2 text-xs text-slate-700 min-h-[50px] resize-none outline-none focus:outline-none"
                            required
                          />
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="min-h-11 px-4 bg-edu-secondary hover:bg-edu-primary text-white rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer disabled:cursor-wait disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-primary"
                          >
                            Enviar
                          </button>
                        </form>
                      )}

                    </div>

                    {/* Indented Nested Replies */}
                    {nested.map((nestReply) => (
                      <div 
                        key={nestReply.id} 
                        className="ml-8 md:ml-12 bg-slate-50/80 p-4 rounded-xl border border-slate-200/40 shadow-[inset_2px_0_0_0_rgba(46,134,193,0.3)] space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div aria-hidden="true" className="w-6.5 h-6.5 rounded-full bg-edu-secondary text-white font-bold text-[8px] flex items-center justify-center overflow-hidden border border-slate-100">
                              {nestReply.authorName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-bold text-slate-800 leading-none">
                                {nestReply.authorName} <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide ml-1 bg-white px-1 py-0.5 rounded border border-slate-100">{nestReply.authorRole}</span>
                              </p>
                              <p className="text-[9px] text-slate-400 mt-1">{nestReply.date}</p>
                            </div>
                          </div>

                          {/* Nested Comment Votes panel */}
                          <div className="flex items-center gap-0.5 bg-white border border-slate-100 rounded-md py-0.5 px-0.5 select-none">
                            <button
                              type="button"
                              onClick={() => handleVoteReply(nestReply.id, 'up')}
                              aria-label={`Votar a favor de la respuesta de ${nestReply.authorName}`}
                              aria-pressed={nestReply.userVoted === 'up'}
                              className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded hover:bg-slate-200/50 transition-colors cursor-pointer ${
                                nestReply.userVoted === 'up' ? 'text-green-600' : 'text-slate-400'
                              } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary`}
                            >
                              <ChevronUp size={12} />
                            </button>
                            <span className={`text-[9px] font-bold px-1 min-w-[10px] text-center ${
                              nestReply.userVoted === 'up' ? 'text-green-600' : nestReply.userVoted === 'down' ? 'text-red-500' : 'text-slate-500'
                            }`}>
                              {nestReply.score}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleVoteReply(nestReply.id, 'down')}
                              aria-label={`Votar en contra de la respuesta de ${nestReply.authorName}`}
                              aria-pressed={nestReply.userVoted === 'down'}
                              className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded hover:bg-slate-200/50 transition-colors cursor-pointer ${
                                nestReply.userVoted === 'down' ? 'text-red-500' : 'text-slate-400'
                              } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-edu-secondary`}
                            >
                              <ChevronDown size={12} />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed pl-8">
                          {nestReply.content}
                        </p>
                      </div>
                    ))}

                  </div>
                );
              })
            )}

          </section>

        </div>

      </div>

    </div>
  );
};
