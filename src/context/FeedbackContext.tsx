'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { clearReplyVote, removeMyReplyId } from '@/lib/replyClientStorage';
import { normalizeFeatureKey } from '@/lib/featureVoteKey';
import { assignPrioritiesByVoteRank } from '@/lib/priorityFromVotes';
import {
  Feedback,
  FeedbackReply,
  FeedbackReplyRole,
  FeedbackStatus,
} from '@/types/feedback';

function nextVoteAfterClick(
  previousVote: 'up' | 'down' | null,
  clicked: 'up' | 'down'
): 'up' | 'down' | null {
  if (clicked === 'up') {
    if (previousVote === 'up') return null;
    return 'up';
  }
  if (previousVote === 'down') return null;
  return 'down';
}

function adjustReplyVoteCounts(
  r: FeedbackReply,
  previousVote: 'up' | 'down' | null,
  nextVote: 'up' | 'down' | null
) {
  let up = r.upvoteCount;
  let down = r.downvoteCount;
  if (previousVote === 'up') up--;
  if (previousVote === 'down') down--;
  if (nextVote === 'up') up++;
  if (nextVote === 'down') down++;
  return {
    ...r,
    upvoteCount: Math.max(0, up),
    downvoteCount: Math.max(0, down),
  };
}

interface FeedbackContextType {
  feedbacks: Feedback[];
  /** Re-fetch feature vote totals from the server and merge into feedback rows. */
  refreshFeatureVotes: () => void;
  addFeedback: (
    feedback: Omit<
      Feedback,
      'id' | 'createdAt' | 'updatedAt' | 'similarCount' | 'replies' | 'votes' | 'userVote'
    >
  ) => void;
  addReply: (
    feedbackId: string,
    body: string,
    options?: { authorName?: string; role?: FeedbackReplyRole }
  ) => string | undefined;
  voteOnReply: (
    feedbackId: string,
    replyId: string,
    clicked: 'up' | 'down',
    previousVote: 'up' | 'down' | null
  ) => 'up' | 'down' | null;
  deleteReply: (feedbackId: string, replyId: string) => void;
  updateFeedbackStatus: (id: string, status: FeedbackStatus) => void;
  deleteFeedback: (id: string) => void;
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

function seedFeedbacks(): Feedback[] {
  const raw: Feedback[] = [
    {
      id: '1',
      title: 'Dark Mode Support',
      description: 'Add dark mode toggle in settings',
      status: 'completed',
      priority: 'medium',
      replies: [],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      similarCount: 0,
      votes: 0,
      userVote: undefined,
    },
    {
      id: '2',
      title: 'Export to PDF',
      description: 'Allow users to export reports as PDF',
      status: 'in_progress',
      priority: 'medium',
      replies: [],
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-22'),
      similarCount: 0,
      votes: 0,
      userVote: undefined,
    },
    {
      id: '3',
      title: 'Mobile App Integration',
      description: 'Sync data with mobile application',
      status: 'pending',
      priority: 'medium',
      replies: [],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      similarCount: 0,
      votes: 0,
      userVote: undefined,
    },
  ];
  return assignPrioritiesByVoteRank(raw);
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(seedFeedbacks);

  const refreshFeatureVotes = useCallback(() => {
    fetch('/api/feature-votes')
      .then((r) => r.json())
      .then((data: { totals?: Record<string, number> }) => {
        const totals = data.totals ?? {};
        setFeedbacks((prev) => {
          const updated = prev.map((f) => {
            const k = normalizeFeatureKey(f.title);
            const serverVotes = totals[k] ?? 0;
            if (serverVotes === f.votes) return f;
            return { ...f, votes: serverVotes, updatedAt: new Date() };
          });
          return assignPrioritiesByVoteRank(updated);
        });
      })
      .catch(() => { });
  }, []);

  const addFeedback = (
    feedback: Omit<
      Feedback,
      'id' | 'createdAt' | 'updatedAt' | 'similarCount' | 'replies' | 'votes' | 'userVote'
    >
  ) => {
    const key = normalizeFeatureKey(feedback.title);
    const apply = (voteTotal: number) => {
      const newFeedback: Feedback = {
        ...feedback,
        id: Date.now().toString(),
        similarCount: 0,
        replies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        votes: voteTotal,
        userVote: undefined,
      };
      setFeedbacks((prev) =>
        assignPrioritiesByVoteRank([newFeedback, ...prev])
      );
    };

    fetch('/api/feature-votes')
      .then((r) => r.json())
      .then((data: { totals?: Record<string, number> }) => {
        const voteTotal = data.totals?.[key] ?? 0;
        apply(voteTotal);
      })
      .catch(() => apply(0));
  };

  /** Merge server vote totals into feedback rows by title key and re-rank priority. */
  useEffect(() => {
    refreshFeatureVotes();
    const id = window.setInterval(refreshFeatureVotes, 8000);
    return () => clearInterval(id);
  }, [refreshFeatureVotes]);

  const addReply = (
    feedbackId: string,
    body: string,
    options?: { authorName?: string; role?: FeedbackReplyRole }
  ): string | undefined => {
    const trimmed = body.trim();
    if (!trimmed) return undefined;

    const role = options?.role ?? 'user';
    const authorName =
      (options?.authorName?.trim() || (role === 'admin' ? 'Team' : '')) || 'Anonymous';

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const reply = {
      id,
      body: trimmed,
      authorName,
      role,
      upvoteCount: 0,
      downvoteCount: 0,
      createdAt: new Date(),
    };

    setFeedbacks((prev) =>
      prev.map((fb) =>
        fb.id === feedbackId
          ? { ...fb, replies: [...fb.replies, reply], updatedAt: new Date() }
          : fb
      )
    );
    return id;
  };

  const voteOnReply = (
    feedbackId: string,
    replyId: string,
    clicked: 'up' | 'down',
    previousVote: 'up' | 'down' | null
  ): 'up' | 'down' | null => {
    const nextVote = nextVoteAfterClick(previousVote, clicked);

    setFeedbacks((prev) =>
      prev.map((fb) => {
        if (fb.id !== feedbackId) return fb;
        return {
          ...fb,
          replies: fb.replies.map((r) =>
            r.id === replyId
              ? adjustReplyVoteCounts(r, previousVote, nextVote)
              : r
          ),
          updatedAt: new Date(),
        };
      })
    );

    return nextVote;
  };

  const deleteReply = (feedbackId: string, replyId: string) => {
    if (typeof window !== 'undefined') {
      clearReplyVote(replyId);
      removeMyReplyId(replyId);
    }
    setFeedbacks((prev) =>
      prev.map((fb) =>
        fb.id === feedbackId
          ? {
            ...fb,
            replies: fb.replies.filter((r) => r.id !== replyId),
            updatedAt: new Date(),
          }
          : fb
      )
    );
  };

  const updateFeedbackStatus = (id: string, status: FeedbackStatus) => {
    setFeedbacks((prev) =>
      prev.map((fb) =>
        fb.id === id ? { ...fb, status, updatedAt: new Date() } : fb
      )
    );
  };

  const deleteFeedback = (id: string) => {
    setFeedbacks((prev) => {
      if (typeof window !== 'undefined') {
        const fb = prev.find((f) => f.id === id);
        fb?.replies.forEach((r) => {
          clearReplyVote(r.id);
          removeMyReplyId(r.id);
        });
      }
      const next = prev.filter((fb) => fb.id !== id);
      return assignPrioritiesByVoteRank(next);
    });
  };

  return (
    <FeedbackContext.Provider
      value={{
        feedbacks,
        refreshFeatureVotes,
        addFeedback,
        addReply,
        voteOnReply,
        deleteReply,
        updateFeedbackStatus,
        deleteFeedback,
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (context === undefined) {
    throw new Error('useFeedback must be used within a FeedbackProvider only');
  }
  return context;
}