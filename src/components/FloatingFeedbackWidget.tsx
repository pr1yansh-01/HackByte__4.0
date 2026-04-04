'use client';

import { useEffect, useState } from 'react';
import { useFeedback } from '@/context/FeedbackContext';
import { Feedback } from '@/types/feedback';
import FeatureIdeaVoteControls from '@/components/FeatureIdeaVoteControls';
import { getFeedbackIdeaUpvoted } from '@/lib/featureVoteStorage';

function normalizeTitle(t: string) {
  return t.trim().toLowerCase().replace(/\s+/g, ' ');
}

function findFeedbackByTitle(feedbacks: Feedback[], raw: string): Feedback | null {
  const n = normalizeTitle(raw);
  if (!n) return null;
  return feedbacks.find((f) => normalizeTitle(f.title) === n) ?? null;
}

/** Match API suggestion text to a board item so every suggestion row can offer voting when possible. */
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
  const [votedExistingId, setVotedExistingId] = useState<string | null>(null);
  const { feedbacks, addFeedback, voteFeedback } = useFeedback();

  useEffect(() => {
    if (!isOpen) {
      setSuggestions([]);
      setSuggestionLoading(false);
      setVotedExistingId(null);
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
    if (!votedExistingId) return;
    const fb = feedbacks.find((f) => f.id === votedExistingId);
    if (!fb || normalizeTitle(fb.title) !== normalizeTitle(title)) {
      setVotedExistingId(null);
    }
  }, [title, votedExistingId, feedbacks]);

  const showSuggestionPanel =
    isOpen && title.trim().length >= 2 && (suggestionLoading || suggestions.length > 0);

  const titleMatch = findFeedbackByTitle(feedbacks, title);
  const submitAsVote = Boolean(titleMatch || votedExistingId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (submitAsVote) {
      const target =
        titleMatch ??
        (votedExistingId
          ? feedbacks.find((f) => f.id === votedExistingId) ?? null
          : null);
      if (!target) return;

      if (!votedExistingId && titleMatch && !getFeedbackIdeaUpvoted(target.id)) {
        voteFeedback(target.id, 'up');
      }

      setTitle('');
      setDescription('');
      setEmail('');
      setSuggestions([]);
      setVotedExistingId(null);
      setIsOpen(false);
      return;
    }

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
    setVotedExistingId(null);
    setIsOpen(false);
  };

  const pickSuggestion = (s: string) => {
    setTitle(s);
    const fb = findSuggestionMatch(feedbacks, s);
    if (fb) setDescription(fb.description);
    setSuggestions([]);
  };

  const handleSuggestionUpvoted = (fb: Feedback) => {
    setVotedExistingId(fb.id);
    setTitle(fb.title);
    setDescription(fb.description);
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
                      const fb = findSuggestionMatch(feedbacks, s);
                      return (
                        <li
                          key={`${i}-${s.slice(0, 24)}`}
                          className="flex items-stretch border-b border-gray-50 last:border-0"
                        >
                          {fb ? (
                            <FeatureIdeaVoteControls
                              feedbackId={fb.id}
                              votes={fb.votes}
                              compact
                              onUpvoted={() => handleSuggestionUpvoted(fb)}
                            />
                          ) : (
                            <div
                              className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 bg-gray-50/80 border-r border-gray-100 shrink-0 w-[3.25rem]"
                              title="Not on the board yet — pick the title to submit a new idea"
                            >
                              <span className="text-[10px] text-gray-300 leading-none px-1.5 py-0.5">
                                ▲
                              </span>
                              <span className="text-xs font-semibold text-gray-400 tabular-nums">0</span>
                              <span className="text-[10px] text-gray-300 leading-none px-1.5 py-0.5">
                                ▼
                              </span>
                            </div>
                          )}
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => pickSuggestion(s)}
                            className="flex-1 text-left px-3 py-2 text-sm text-gray-800 hover:bg-indigo-50 hover:text-indigo-900 transition-colors min-w-0"
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
                placeholder={
                  submitAsVote
                    ? 'Optional — voting on an existing request'
                    : "Describe the feature you'd like to see..."
                }
                rows={3}
                required={!submitAsVote}
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
                required={!submitAsVote}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {submitAsVote ? 'Submit vote' : 'Submit Request'}
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
