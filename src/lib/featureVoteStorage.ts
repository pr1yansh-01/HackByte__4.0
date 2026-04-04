const KEY = 'hbyte-feedback-idea-upvotes';

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

/** Whether this browser session has already upvoted this feature request (one upvote per user). */
export function getFeedbackIdeaUpvoted(feedbackId: string): boolean {
  const map = readJson<Record<string, boolean>>(KEY, {});
  return map[feedbackId] === true;
}

export function setFeedbackIdeaUpvoted(feedbackId: string) {
  const map = readJson<Record<string, boolean>>(KEY, {});
  map[feedbackId] = true;
  writeJson(KEY, map);
}

export function clearFeedbackIdeaUpvote(feedbackId: string) {
  const map = readJson<Record<string, boolean>>(KEY, {});
  delete map[feedbackId];
  writeJson(KEY, map);
}
