const STORAGE_KEY = 'feature-vote-session-id';

function randomId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Stable per-browser id for feature vote APIs (one upvote per session per key). */
export function getOrCreateFeatureVoteSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = window.localStorage.getItem(STORAGE_KEY)?.trim();
    if (!id) {
      id = randomId();
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id.slice(0, 128);
  } catch {
    return randomId().slice(0, 128);
  }
}
