import { requireSupabase } from '../../auth/services/supabaseClient';

export type DiscussionCategory =
  | 'Académico'
  | 'Vida Escolar'
  | 'Grupos de Estudio'
  | 'Intercambio'
  | 'Deportes';

export type VoteDirection = 'up' | 'down';
export type DiscussionSort = 'recent' | 'trending' | 'popular';

export interface ForumReply {
  id: string;
  authorName: string;
  authorRole: string;
  date: string;
  content: string;
  score: number;
  parentId: string | null;
  userVoted?: VoteDirection;
}

export interface Discussion {
  id: string;
  category: DiscussionCategory;
  authorName: string;
  authorRole: string;
  title: string;
  date: string;
  score: number;
  lead: string;
  content: string[];
  repliesCount: number;
  replies: ForumReply[];
  userVoted?: VoteDirection;
}

interface DiscussionRow {
  id: string;
  category: DiscussionCategory;
  author_name: string;
  title: string;
  lead: string;
  content: string;
  created_at: string;
  score: number;
  replies_count: number;
}

interface ReplyRow {
  id: string;
  parent_reply_id: string | null;
  author_name: string;
  content: string;
  created_at: string;
  score: number;
}

const DISCUSSION_COLUMNS = 'id,category,author_name,title,lead,content,created_at,score,replies_count';
const REPLY_COLUMNS = 'id,parent_reply_id,author_name,content,created_at,score';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function mapDiscussion(row: DiscussionRow, userVoted?: VoteDirection): Discussion {
  return {
    id: row.id,
    category: row.category,
    authorName: row.author_name,
    authorRole: 'Estudiante',
    title: row.title,
    date: formatDate(row.created_at),
    score: row.score,
    lead: row.lead,
    content: row.content.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean),
    repliesCount: row.replies_count,
    replies: [],
    userVoted,
  };
}

function mapReply(row: ReplyRow, userVoted?: VoteDirection): ForumReply {
  return {
    id: row.id,
    parentId: row.parent_reply_id,
    authorName: row.author_name,
    authorRole: 'Estudiante',
    date: formatDate(row.created_at),
    content: row.content,
    score: row.score,
    userVoted,
  };
}

function escapeLikeSearch(value: string): string {
  return value.replace(/[\\%_"]/g, (character) => `\\${character}`);
}

export async function listDiscussions(options: {
  category?: DiscussionCategory;
  search?: string;
  sort: DiscussionSort;
  offset: number;
  limit: number;
  authorId?: string;
}): Promise<{ discussions: Discussion[]; hasMore: boolean }> {
  const client = requireSupabase();
  let query = client
    .from('forum_discussions')
    .select(DISCUSSION_COLUMNS)
    .eq('status', 'published');

  if (options.category) query = query.eq('category', options.category);
  if (options.authorId) query = query.eq('author_id', options.authorId);
  if (options.search?.trim()) {
    const pattern = `"%${escapeLikeSearch(options.search.trim())}%"`;
    query = query.or(`title.ilike.${pattern},lead.ilike.${pattern}`);
  }

  if (options.sort === 'popular') {
    query = query.order('score', { ascending: false }).order('created_at', { ascending: false }).order('id', { ascending: false });
  } else if (options.sort === 'trending') {
    query = query.order('replies_count', { ascending: false }).order('created_at', { ascending: false }).order('id', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false }).order('id', { ascending: false });
  }

  const { data, error } = await query.range(options.offset, options.offset + options.limit - 1);
  if (error) throw new Error('forum_load_failed');

  const rows = (data ?? []) as DiscussionRow[];
  const ids = rows.map((row) => row.id);
  let votesByDiscussion = new Map<string, VoteDirection>();
  if (ids.length > 0) {
    const { data: votes, error: voteError } = await client
      .from('forum_discussion_votes')
      .select('discussion_id,direction')
      .in('discussion_id', ids);
    if (voteError) throw new Error('forum_load_failed');
    votesByDiscussion = new Map((votes ?? []).map((vote) => [vote.discussion_id, vote.direction as VoteDirection]));
  }

  return {
    discussions: rows.map((row) => mapDiscussion(row, votesByDiscussion.get(row.id))),
    hasMore: rows.length === options.limit,
  };
}

export async function getDiscussionById(id: string): Promise<Discussion | null> {
  const client = requireSupabase();
  const { data, error } = await client
    .from('forum_discussions')
    .select(DISCUSSION_COLUMNS)
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle();
  if (error) throw new Error('forum_load_failed');
  if (!data) return null;

  const row = data as DiscussionRow;
  const [discussionVote, repliesResult] = await Promise.all([
    client.from('forum_discussion_votes').select('direction').eq('discussion_id', id).maybeSingle(),
    client
      .from('forum_replies')
      .select(REPLY_COLUMNS)
      .eq('discussion_id', id)
      .eq('status', 'published')
      .order('created_at', { ascending: true })
      .order('id', { ascending: true }),
  ]);
  if (discussionVote.error || repliesResult.error) throw new Error('forum_load_failed');

  const replies = (repliesResult.data ?? []) as ReplyRow[];
  const replyIds = replies.map((reply) => reply.id);
  let votesByReply = new Map<string, VoteDirection>();
  if (replyIds.length > 0) {
    const { data: votes, error: voteError } = await client
      .from('forum_reply_votes')
      .select('reply_id,direction')
      .in('reply_id', replyIds);
    if (voteError) throw new Error('forum_load_failed');
    votesByReply = new Map((votes ?? []).map((vote) => [vote.reply_id, vote.direction as VoteDirection]));
  }

  return {
    ...mapDiscussion(row, discussionVote.data?.direction as VoteDirection | undefined),
    replies: replies.map((reply) => mapReply(reply, votesByReply.get(reply.id))),
  };
}

export async function addDiscussion(input: {
  category: DiscussionCategory;
  title: string;
  lead: string;
  content: string;
}): Promise<void> {
  const { error } = await requireSupabase().from('forum_discussions').insert({
    category: input.category,
    title: input.title.trim(),
    lead: input.lead.trim(),
    content: input.content.trim(),
  });
  if (error) throw new Error('forum_publish_failed');
}

export async function addReply(discussionId: string, content: string, parentId: string | null = null): Promise<void> {
  const { error } = await requireSupabase().from('forum_replies').insert({
    discussion_id: discussionId,
    parent_reply_id: parentId,
    content: content.trim(),
  });
  if (error) throw new Error('forum_reply_failed');
}

export async function voteDiscussion(id: string, direction: VoteDirection): Promise<void> {
  const client = requireSupabase();
  const { data: current, error: readError } = await client
    .from('forum_discussion_votes')
    .select('direction')
    .eq('discussion_id', id)
    .maybeSingle();
  if (readError) throw new Error('forum_vote_failed');

  if (current?.direction === direction) {
    const { error } = await client.from('forum_discussion_votes').delete().eq('discussion_id', id);
    if (error) throw new Error('forum_vote_failed');
    return;
  }

  const { error } = await client.from('forum_discussion_votes').upsert(
    { discussion_id: id, direction },
    { onConflict: 'discussion_id,voter_id' },
  );
  if (error) throw new Error('forum_vote_failed');
}

export async function voteReply(id: string, direction: VoteDirection): Promise<void> {
  const client = requireSupabase();
  const { data: current, error: readError } = await client
    .from('forum_reply_votes')
    .select('direction')
    .eq('reply_id', id)
    .maybeSingle();
  if (readError) throw new Error('forum_vote_failed');

  if (current?.direction === direction) {
    const { error } = await client.from('forum_reply_votes').delete().eq('reply_id', id);
    if (error) throw new Error('forum_vote_failed');
    return;
  }

  const { error } = await client.from('forum_reply_votes').upsert(
    { reply_id: id, direction },
    { onConflict: 'reply_id,voter_id' },
  );
  if (error) throw new Error('forum_vote_failed');
}
