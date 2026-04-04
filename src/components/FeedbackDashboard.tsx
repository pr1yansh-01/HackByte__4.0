'use client';

import { Fragment, useState } from 'react';
import { useFeedback } from '@/context/FeedbackContext';
import { FeedbackReply, FeedbackStatus } from '@/types/feedback';
import ReplyVoteControls from '@/components/ReplyVoteControls';

const statusConfig: Record<FeedbackStatus, { label: string; color: string; bgColor: string }> = {
  pending: {
    label: 'Pending',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  completed: {
    label: 'Completed',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'text-gray-600 bg-gray-100' },
  medium: { label: 'Medium', color: 'text-orange-600 bg-orange-100' },
  high: { label: 'High', color: 'text-red-600 bg-red-100' },
};

function AdminReplyForm({ feedbackId }: { feedbackId: string }) {
  const { addReply } = useFeedback();
  const [body, setBody] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    addReply(feedbackId, body, { role: 'admin' });
    setBody('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex-1 min-w-0">
        <label htmlFor={`admin-reply-${feedbackId}`} className="sr-only">
          Official reply
        </label>
        <textarea
          id={`admin-reply-${feedbackId}`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write an official team reply…"
          rows={2}
          maxLength={2000}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-y"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Post reply
      </button>
    </form>
  );
}

function DashboardReplyRow({
  feedbackId,
  reply: r,
}: {
  feedbackId: string;
  reply: FeedbackReply;
}) {
  const { deleteReply } = useFeedback();

  return (
    <li className="text-sm rounded-lg bg-white border border-gray-200 px-3 py-2.5">
      <div className="flex gap-3 justify-between items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{r.authorName}</span>
            {r.role === 'admin' && (
              <span className="text-[10px] uppercase tracking-wide font-semibold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                Team
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
        <button
          type="button"
          onClick={() => {
            if (confirm('Delete this comment?')) deleteReply(feedbackId, r.id);
          }}
          className="shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          aria-label="Delete comment"
          title="Delete comment"
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
      </div>
    </li>
  );
}

export default function FeedbackDashboard() {
  const { feedbacks, updateFeedbackStatus, deleteFeedback } = useFeedback();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (expandedId === id) setExpandedId(null);
    deleteFeedback(id);
  };

  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter((f) => f.status === 'pending').length,
    in_progress: feedbacks.filter((f) => f.status === 'in_progress').length,
    completed: feedbacks.filter((f) => f.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Feature Requests Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-sm text-gray-500 mb-1">Total Requests</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-sm text-yellow-500 mb-1">Pending</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-sm text-blue-500 mb-1">In Progress</div>
            <div className="text-3xl font-bold text-blue-600">{stats.in_progress}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="text-sm text-green-500 mb-1">Completed</div>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-10 px-3 py-4" aria-label="Expand" />
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Comments
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {feedbacks.map((feedback) => (
                  <Fragment key={feedback.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-4 align-top">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(expandedId === feedback.id ? null : feedback.id)
                          }
                          className="p-1 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                          aria-expanded={expandedId === feedback.id}
                          aria-label={
                            expandedId === feedback.id
                              ? 'Hide comments and replies'
                              : 'Show comments and replies'
                          }
                        >
                          <svg
                            className={`w-5 h-5 transition-transform ${
                              expandedId === feedback.id ? 'rotate-90' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{feedback.title}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {feedback.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            priorityConfig[feedback.priority].color
                          }`}
                        >
                          {priorityConfig[feedback.priority].label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={feedback.status}
                          onChange={(e) =>
                            updateFeedbackStatus(
                              feedback.id,
                              e.target.value as FeedbackStatus
                            )
                          }
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${
                            statusConfig[feedback.status].bgColor
                          } ${statusConfig[feedback.status].color}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 tabular-nums">
                        {feedback.replies.length}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {feedback.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(feedback.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          aria-label="Delete request"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                    {expandedId === feedback.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-5 border-t border-gray-100">
                          <div className="max-w-3xl">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">
                              Comments & replies
                            </h4>
                            {feedback.replies.length === 0 ? (
                              <p className="text-sm text-gray-500 mb-4">
                                No comments yet.
                              </p>
                            ) : (
                              <ul className="space-y-3 mb-4">
                                {feedback.replies.map((r) => (
                                  <DashboardReplyRow
                                    key={r.id}
                                    feedbackId={feedback.id}
                                    reply={r}
                                  />
                                ))}
                              </ul>
                            )}
                            <div className="border-t border-gray-200 pt-4">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                Official reply
                              </p>
                              <AdminReplyForm feedbackId={feedback.id} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
