'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFeedback } from '@/context/FeedbackContext';
import { Feedback } from '@/types/feedback';
import { normalizeFeatureKey } from '@/lib/featureVoteKey';
import { getOrCreateFeatureVoteSessionId } from '@/lib/featureVoteSession';

function normalizeTitle(t: string) {
  return t.trim().toLowerCase().replace(/\s+/g, ' ');
}

function findSuggestionMatch(feedbacks: Feedback[], suggestion: string): Feedback | null {
  const n = normalizeTitle(suggestion);
  if (!n) return null;
  const exact = feedbacks.find((f) => normalizeTitle(f.title) === n);
  if (exact) return exact;
  const candidates = feedbacks.filter((f) => {
    const t = normalizeTitle(f.title);
    return t.includes(n) || (n.length >= 4 && n.includes(t));
  });
  if (candidates.length === 0) return null;
  return candidates.sort(
    (a, b) => normalizeTitle(b.title).length - normalizeTitle(a.title).length
  )[0];
}

export default function FloatingFeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [voteTotals, setVoteTotals] = useState<Record<string, number>>({});
  const [myVotes, setMyVotes] = useState<Record<string, boolean>>({});
  const [voteSessionId, setVoteSessionId] = useState('');
  const votingInFlightRef = useRef<Set<string>>(new Set());
  const { feedbacks, addFeedback, refreshFeatureVotes } = useFeedback();

  useEffect(() => {
    setVoteSessionId(getOrCreateFeatureVoteSessionId());
  }, []);

  const refreshVoteTotals = useCallback(async () => {
    if (!voteSessionId) return;
    try {
      const res = await fetch(
        `/api/feature-votes?sessionId=${encodeURIComponent(voteSessionId)}`
      );
      const data = (await res.json()) as {
        totals?: Record<string, number>;
        myVotes?: Record<string, boolean>;
      };
      setVoteTotals(data.totals ?? {});
      setMyVotes((prev) => ({ ...prev, ...(data.myVotes ?? {}) }));
    } catch {
      /* ignore */
    }
  }, [voteSessionId]);

  useEffect(() => {
    if (!isOpen) {
      setSuggestions([]);
      setSuggestionLoading(false);
      return;
    }

    const q = title.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSuggestionLoading(false);
      return;
    }

    const ac = new AbortController();
    const t = window.setTimeout(async () => {
      setSuggestionLoading(true);
      try {
        const res = await fetch('/api/feature-suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: title }),
          signal: ac.signal,
        });
        const data = (await res.json()) as {
          suggestions?: string[];
        };
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      } catch {
        if (!ac.signal.aborted) {
          setSuggestions([]);
        }
      } finally {
        if (!ac.signal.aborted) setSuggestionLoading(false);
      }
    }, 450);

    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [title, isOpen]);

  useEffect(() => {
    if (!isOpen || !voteSessionId) return;
    const q = title.trim();
    if (q.length < 2) return;
    if (!suggestionLoading && suggestions.length === 0) return;
    void refreshVoteTotals();
  }, [
    isOpen,
    voteSessionId,
    title,
    suggestions,
    suggestionLoading,
    refreshVoteTotals,
  ]);

  const showSuggestionPanel =
    isOpen && title.trim().length >= 2 && (suggestionLoading || suggestions.length > 0);

  /** Counts come only from the vote store so new suggestions show 0 until someone votes. */
  const countForSuggestion = (s: string) => {
    const k = normalizeFeatureKey(s);
    return voteTotals[k] ?? 0;
  };

  const upvoteSuggestion = async (s: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const k = normalizeFeatureKey(s);
    if (myVotes[k] || !voteSessionId || votingInFlightRef.current.has(k)) return;

    votingInFlightRef.current.add(k);
    setVoteTotals((prev) => ({ ...prev, [k]: (prev[k] ?? 0) + 1 }));
    setMyVotes((prev) => ({ ...prev, [k]: true }));

    const revertOptimistic = () => {
      setVoteTotals((prev) => ({
        ...prev,
        [k]: Math.max(0, (prev[k] ?? 0) - 1),
      }));
      setMyVotes((prev) => {
        const next = { ...prev };
        delete next[k];
        return next;
      });
    };

    try {
      const res = await fetch('/api/feature-votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': voteSessionId,
        },
        body: JSON.stringify({ key: s, increment: true }),
      });
      const data = (await res.json()) as {
        key?: string;
        total?: number;
        alreadyVoted?: boolean;
      };
      if (!res.ok) {
        revertOptimistic();
        await refreshVoteTotals();
        refreshFeatureVotes();
        return;
      }
      const resKey = data.key ?? k;
      if (data.total !== undefined) {
        setVoteTotals((prev) => ({ ...prev, [resKey]: data.total! }));
      }
      setMyVotes((prev) => ({ ...prev, [resKey]: true }));
      refreshFeatureVotes();
    } catch {
      revertOptimistic();
      await refreshVoteTotals();
      refreshFeatureVotes();
    } finally {
      votingInFlightRef.current.delete(k);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    if (!email.trim()) return;

    addFeedback({
      title: title.trim(),
      description: description.trim(),
      priority: 'medium',
      status: 'pending',
    });

    setTitle('');
    setDescription('');
    setEmail('');
    setSuggestions([]);
    setIsOpen(false);
  };

  const pickSuggestion = (s: string) => {
    setTitle(s);
    const fb = findSuggestionMatch(feedbacks, s);
    if (fb) setDescription(fb.description);
    setSuggestions([]);
  };

  return (
    <>
      {isOpen && (
        <div className="floating-widget-modal bg-white rounded-lg shadow-2xl w-96 p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Submit Feature Request
            </h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Feature Title
                </label>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Start typing - e.g. dark, bug, export…"
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                required
              />

              {showSuggestionPanel && (
                <div className="absolute left-0 right-0 top-full mt-1 z-[60] rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
                  {suggestionLoading && suggestions.length === 0 && (
                    <div className="px-3 py-2.5 text-xs text-gray-500 flex items-center gap-2">
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                      Searching for suggestions…
                    </div>
                  )}
                  <ul className="max-h-52 overflow-y-auto py-1">
                    {suggestions.map((s, i) => {
                      const count = countForSuggestion(s);
                      const voted = !!myVotes[normalizeFeatureKey(s)];
                      return (
                        <li
                          key={`${i}-${s.slice(0, 24)}`}
                          className="flex items-stretch border-b border-gray-50 last:border-0"
                        >
                          <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 bg-gray-50 border-r border-gray-100 shrink-0 w-[3.25rem]">
                            <button
                              type="button"
                              disabled={voted}
                              onClick={(e) => upvoteSuggestion(s, e)}
                              className={`text-xs leading-none px-1.5 py-0.5 rounded transition-colors ${
                                voted
                                  ? 'text-green-600 bg-green-50 cursor-default'
                                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                              }`}
                              aria-label={
                                voted
                                  ? 'You already upvoted this suggestion'
                                  : 'Upvote this suggestion'
                              }
                              title={voted ? 'Already upvoted' : 'Upvote once'}
                            >
                              ▲
                            </button>
                            <span className="text-xs font-semibold text-gray-800 tabular-nums min-w-[1rem] text-center">
                              {count}
                            </span>
                          </div>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => pickSuggestion(s)}
                            className="flex-1 min-w-0 text-left px-3 py-2 text-sm text-gray-800 hover:bg-indigo-50 hover:text-indigo-900 transition-colors"
                          >
                            {s}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the feature you'd like to see..."
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter your Email ID
              </label>
              <textarea
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Please enter your email ID"
                rows={1}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Submit Request
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="floating-widget bg-primary hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all hover:scale-105 flex items-center gap-2"
      >
        {isOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="font-medium">Request Feature</span>
          </>
        )}
      </button>
    </>
  );
}
