'use client';

import { useEffect, useState } from 'react';
import { useFeedback } from '@/context/FeedbackContext';
import { Feedback, FeedbackReply, FeedbackStatus } from '@/types/feedback';
import { addMyReplyId, getMyReplyIds } from '@/lib/replyClientStorage';
import ReplyVoteControls from '@/components/ReplyVoteControls';

const statusLabel: Record<FeedbackStatus, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
};

const statusStyle: Record<FeedbackStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

function UserReplyForm({ feedbackId }: { feedbackId: string }) {
  const { addReply } = useFeedback();
  const [name, setName] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    const newId = addReply(feedbackId, body, { authorName: name, role: 'user' });
    if (newId) addMyReplyId(newId);
    setBody('');
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
      <div className="text-sm font-medium text-gray-700">Add a comment</div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name (optional)"
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        maxLength={80}
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your reply…"
        rows={3}
        required
        maxLength={2000}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-y min-h-[80px]"
      />
      <button
        type="submit"
        className="text-sm font-medium bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Post comment
      </button>
    </form>
  );
}

function ReplyListItem({
  feedbackId,
  reply: r,
}: {
  feedbackId: string;
  reply: FeedbackReply;
}) {
  const { deleteReply } = useFeedback();
  const [mine, setMine] = useState(false);

  useEffect(() => {
    setMine(getMyReplyIds().includes(r.id));
  }, [r.id]);

  const handleDeleteMine = () => {
    if (!confirm('Delete your comment?')) return;
    deleteReply(feedbackId, r.id);
  };

  return (
    <li className="text-sm rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5">
      <div className="flex gap-3 justify-between items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{r.authorName}</span>
            {r.role === 'admin' && (
              <span className="text-[10px] uppercase tracking-wide font-semibold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                Admin Reply
              </span>
            )}
            <span className="text-gray-400 text-xs">
              {r.createdAt.toLocaleString()}
            </span>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{r.body}</p>
          {r.role === 'user' && (
            <ReplyVoteControls feedbackId={feedbackId} reply={r} />
          )}
        </div>
        {mine && (
          <button
            type="button"
            onClick={handleDeleteMine}
            className="shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete your comment"
            title="Delete your comment"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </li>
  );
}

function ReplyList({ feedback }: { feedback: Feedback }) {
  if (feedback.replies.length === 0) {
    return (
      <p className="text-sm text-gray-400 mt-3">No comments yet. Be the first to reply.</p>
    );
  }

  return (
    <ul className="mt-3 space-y-3">
      {feedback.replies.map((r) => (
        <ReplyListItem key={r.id} feedbackId={feedback.id} reply={r} />
      ))}
    </ul>
  );
}

export default function FeedbackPublicBoard() {
  const { feedbacks } = useFeedback();

  return (
    <section className="mt-24 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
        Community feedback
      </h2>
      <p className="text-gray-600 text-center mb-10 max-w-xl mx-auto">
        See what others are asking for and join the conversation with a comment.
      </p>

      <div className="space-y-6">
        {feedbacks.map((fb) => (
          <article
            key={fb.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-left"
          >
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{fb.title}</h3>
              <span
                className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle[fb.status]}`}
              >
                {statusLabel[fb.status]}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-1">{fb.description}</p>
            <p className="text-xs text-gray-400">
              Submitted {fb.createdAt.toLocaleDateString()} · {fb.replies.length}{' '}
              {fb.replies.length === 1 ? 'comment' : 'comments'}
            </p>

            <ReplyList feedback={fb} />
            <UserReplyForm feedbackId={fb.id} />
          </article>
        ))}
      </div>
    </section>
  );
}
