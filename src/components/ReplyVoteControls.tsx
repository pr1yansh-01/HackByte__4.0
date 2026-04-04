'use client';

import { useEffect, useState } from 'react';
import { useFeedback } from '@/context/FeedbackContext';
import { FeedbackReply } from '@/types/feedback';
import { getReplyVote, setReplyVote } from '@/lib/replyClientStorage';

type Props = {
  feedbackId: string;
  reply: FeedbackReply;
};

export default function ReplyVoteControls({ feedbackId, reply }: Props) {
  const { voteOnReply } = useFeedback();
  const [myVote, setMyVote] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    setMyVote(getReplyVote(reply.id));
  }, [reply.id]);

  const score = reply.upvoteCount - reply.downvoteCount;

  const handle = (clicked: 'up' | 'down') => {
    const next = voteOnReply(feedbackId, reply.id, clicked, myVote);
    setMyVote(next);
    setReplyVote(reply.id, next);
  };

  return (
    <div
      className="flex items-center gap-0.5 mt-2"
      title={`${reply.upvoteCount} up · ${reply.downvoteCount} down`}
    >
      <button
        type="button"
        onClick={() => handle('up')}
        aria-label={myVote === 'up' ? 'Remove upvote' : 'Upvote'}
        aria-pressed={myVote === 'up'}
        className={`p-1 rounded transition-colors ${
          myVote === 'up'
            ? 'text-orange-600 bg-orange-50'
            : 'text-gray-400 hover:text-orange-600 hover:bg-gray-100'
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
      <span
        className={`min-w-[1.75rem] text-center text-xs font-semibold tabular-nums ${
          score > 0 ? 'text-orange-700' : score < 0 ? 'text-blue-700' : 'text-gray-500'
        }`}
      >
        {score > 0 ? `+${score}` : score}
      </span>
      <button
        type="button"
        onClick={() => handle('down')}
        aria-label={myVote === 'down' ? 'Remove downvote' : 'Downvote'}
        aria-pressed={myVote === 'down'}
        className={`p-1 rounded transition-colors ${
          myVote === 'down'
            ? 'text-blue-600 bg-blue-50'
            : 'text-gray-400 hover:text-blue-600 hover:bg-gray-100'
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
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <span className="text-[10px] text-gray-400 ml-1 tabular-nums">
        ↑{reply.upvoteCount} ↓{reply.downvoteCount}
      </span>
    </div>
  );
}
