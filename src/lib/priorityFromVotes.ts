import type { Feedback, Priority } from '@/types/feedback';

/**
 * Assign priority from relative vote counts: highest vote count → high,
 * lowest → low, everything in between → medium. If all counts are equal, use medium.
 */
export function assignPrioritiesByVoteRank(items: Feedback[]): Feedback[] {
  if (items.length === 0) return items;
  const maxV = Math.max(...items.map((f) => f.votes));
  const minV = Math.min(...items.map((f) => f.votes));
  if (maxV === minV) {
    return items.map((f) => ({ ...f, priority: 'medium' as Priority }));
  }
  return items.map((f) => {
    let priority: Priority;
    if (f.votes === maxV) priority = 'high';
    else if (f.votes === minV) priority = 'low';
    else priority = 'medium';
    return { ...f, priority };
  });
}
