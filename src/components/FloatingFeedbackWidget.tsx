'use client';

import { useEffect, useState } from 'react';
import { useFeedback } from '@/context/FeedbackContext';
import { normalizeFeatureKey } from '@/lib/featureVoteKey';

export default function FloatingFeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionSource, setSuggestionSource] = useState<string>('');
  const [voteSessionId] = useState(() => {
    if (typeof window === 'undefined') return '';
    let id = localStorage.getItem('fv_session');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('fv_session', id);
    }
    return id;
  });
  const [serverTotals, setServerTotals] = useState<Record<string, number>>({});
  const [myVotes, setMyVotes] = useState<Record<string, boolean>>({});
  const { addFeedback } = useFeedback();

  useEffect(() => {
    if (!suggestions.length || !voteSessionId) return;
    const ac = new AbortController();
    fetch(
      `/api/feature-votes?sessionId=${encodeURIComponent(voteSessionId)}`,
      { signal: ac.signal }
    )
      .then((r) => r.json())
      .then(
        (data: {
          totals?: Record<string, number>;
          myVotes?: Record<string, boolean>;
        }) => {
          setServerTotals(data.totals ?? {});
          setMyVotes(data.myVotes ?? {});
        }
      )
      .catch(() => {});
    return () => ac.abort();
  }, [suggestions, voteSessionId]);

  const toggleSuggestionVote = async (suggestion: string) => {
    try {
      const res = await fetch('/api/feature-votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': voteSessionId,
        },
        body: JSON.stringify({ key: suggestion }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        key: string;
        total: number;
        userVoted: boolean;
      };
      setServerTotals((prev) => ({ ...prev, [data.key]: data.total }));
      setMyVotes((prev) => ({ ...prev, [data.key]: data.userVoted }));
    } catch {
      /* network */
    }
  };

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
          source?: string;
        };
        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
        setSuggestionSource(data.source ?? '');
      } catch {
        if (!ac.signal.aborted) {
          setSuggestions([]);
          setSuggestionSource('');
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

  const showSuggestionPanel =
    isOpen && title.trim().length >= 2 && (suggestionLoading || suggestions.length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    addFeedback({
      title,
      description,
      priority: 'medium',
      status: 'pending',
    });

    setTitle('');
    setDescription('');
    setSuggestions([]);
    setIsOpen(false);
  };

  const pickSuggestion = (s: string) => {
    setTitle(s);
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
                {/* <span className="text-[10px] font-medium uppercase tracking-wide text-indigo-600">
                  AI suggestions
                </span> */}
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
                      const k = normalizeFeatureKey(s);
                      const v = {
                        count: serverTotals[k] ?? 0,
                        userVoted: myVotes[k] ?? false,
                      };
                      return (
                        <li
                          key={`${i}-${s.slice(0, 24)}`}
                          className="flex items-stretch border-b border-gray-100 last:border-0"
                        >
                          <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 shrink-0 border-r border-gray-100 bg-gray-50/80">
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSuggestionVote(s);
                              }}
                              aria-pressed={v.userVoted}
                              aria-label={
                                v.userVoted ? 'Remove your vote' : 'Vote for this suggestion'
                              }
                              className={`rounded p-0.5 transition-colors ${
                                v.userVoted
                                  ? 'text-indigo-600 bg-indigo-100'
                                  : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                              }`}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 15l7-7 7 7"
                                />
                              </svg>
                            </button>
                            <span className="text-[11px] font-semibold tabular-nums text-gray-700 min-w-[1rem] text-center">
                              {v.count}
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
                  {!suggestionLoading && suggestions.length > 0 && (
                    <div className="px-3 py-1.5 border-t border-gray-100 text-[10px] text-gray-400">
                      {/* {suggestionSource === 'gemini'
                        ? 'Powered by Google Gemini'
                        : 'Keyword suggestions (add GEMINI_API_KEY for AI)'} */}
                    </div>
                  )}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                required
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
