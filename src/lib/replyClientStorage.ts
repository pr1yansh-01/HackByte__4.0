const VOTES_KEY = 'hbyte-reply-votes';
const MY_REPLIES_KEY = 'hbyte-my-reply-ids';

export type StoredReplyVote = 'up' | 'down';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function getReplyVote(replyId: string): StoredReplyVote | null {
  const map = readJson<Record<string, StoredReplyVote>>(VOTES_KEY, {});
  return map[replyId] ?? null;
}

export function setReplyVote(replyId: string, vote: StoredReplyVote | null) {
  const map = readJson<Record<string, StoredReplyVote>>(VOTES_KEY, {});
  if (vote === null) delete map[replyId];
  else map[replyId] = vote;
  writeJson(VOTES_KEY, map);
}

export function clearReplyVote(replyId: string) {
  setReplyVote(replyId, null);
}

export function getMyReplyIds(): string[] {
  return readJson<string[]>(MY_REPLIES_KEY, []);
}

export function addMyReplyId(replyId: string) {
  const ids = new Set(getMyReplyIds());
  ids.add(replyId);
  writeJson(MY_REPLIES_KEY, [...ids]);
}

export function removeMyReplyId(replyId: string) {
  writeJson(
    MY_REPLIES_KEY,
    getMyReplyIds().filter((id) => id !== replyId)
  );
}
