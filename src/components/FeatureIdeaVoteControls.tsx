'use client';

import { useFeedback } from '@/context/FeedbackContext';
import { getFeedbackIdeaUpvoted } from '@/lib/featureVoteStorage';

type Props = {
  feedbackId: string;
  votes: number;
  compact?: boolean;
  onUpvoted?: () => void;
};

export default function FeatureIdeaVoteControls({
  feedbackId,
  votes,
  compact = false,
  onUpvoted,
}: Props) {
  const { voteFeedback } = useFeedback();
  const upvoted =
    typeof window !== 'undefined' && getFeedbackIdeaUpvoted(feedbackId);

  const handleUp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (getFeedbackIdeaUpvoted(feedbackId)) return;
    voteFeedback(feedbackId, 'up');
    onUpvoted?.();
  };

  const handleDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!getFeedbackIdeaUpvoted(feedbackId)) return;
    voteFeedback(feedbackId, 'down');
  };

  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 bg-gray-50 border-r border-gray-100 shrink-0 w-[3.25rem]">
        <button
          type="button"
          onClick={handleUp}
          disabled={upvoted}
          className="text-xs leading-none px-1.5 py-0.5 rounded text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-40 disabled:pointer-events-none disabled:hover:bg-transparent"
          aria-label="Upvote"
          title={upvoted ? 'You already upvoted' : 'Upvote'}
        >
          ▲
        </button>
        <span className="text-xs font-semibold text-gray-900 tabular-nums min-w-[1rem] text-center">
          {votes}
        </span>
        <button
          type="button"
          onClick={handleDown}
          disabled={!upvoted}
          className="text-xs leading-none px-1.5 py-0.5 rounded text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:pointer-events-none disabled:hover:bg-transparent"
          aria-label="Remove your upvote"
          title={upvoted ? 'Remove your upvote' : 'Upvote first'}
        >
          ▼
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-gray-800 font-medium">Votes</span>
      <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1">
        <button
          type="button"
          onClick={handleUp}
          disabled={upvoted}
          className="px-2 py-0.5 rounded text-gray-600 hover:text-green-600 hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Upvote this request"
          title={upvoted ? 'You already upvoted' : 'Upvote (+1)'}
        >
          ▲
        </button>
        <span className="min-w-[1.5rem] text-center font-semibold tabular-nums text-gray-950">
          {votes}
        </span>
        <button
          type="button"
          onClick={handleDown}
          disabled={!upvoted}
          className="px-2 py-0.5 rounded text-gray-600 hover:text-red-600 hover:bg-white transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
          aria-label="Remove your upvote"
          title={upvoted ? 'Remove your upvote (−1)' : 'Upvote first'}
        >
          ▼
        </button>
      </div>
    </div>
  );
}
