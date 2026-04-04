'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { clearReplyVote, removeMyReplyId } from '@/lib/replyClientStorage';
import {
  clearFeedbackIdeaUpvote,
  getFeedbackIdeaUpvoted,
  setFeedbackIdeaUpvoted,
} from '@/lib/featureVoteStorage';
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
  voteFeedback: (id: string, type: 'up' | 'down') => void; 
}

const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
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
      priority: 'high',
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
      priority: 'low',
      replies: [],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      similarCount: 0,
      votes: 0,                
      userVote: undefined,     
    },
  ]);

  const addFeedback = (
    feedback: Omit<
      Feedback,
      'id' | 'createdAt' | 'updatedAt' | 'similarCount' | 'replies' | 'votes' | 'userVote'
    >
  ) => {
    const newFeedback: Feedback = {
      ...feedback,
      id: Date.now().toString(),
      similarCount: 0,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      votes: 0,              
      userVote: undefined,   
    };
    setFeedbacks((prev) => [newFeedback, ...prev]);
  };

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
        clearFeedbackIdeaUpvote(id);
        const fb = prev.find((f) => f.id === id);
        fb?.replies.forEach((r) => {
          clearReplyVote(r.id);
          removeMyReplyId(r.id);
        });
      }
      return prev.filter((fb) => fb.id !== id);
    });
  };

  /** One upvote per browser session per request; down removes only that upvote. */
  const voteFeedback = (id: string, type: 'up' | 'down') => {
    if (typeof window === 'undefined') return;

    if (type === 'up') {
      if (getFeedbackIdeaUpvoted(id)) return;
      setFeedbackIdeaUpvoted(id);
      setFeedbacks((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;
          return {
            ...item,
            votes: item.votes + 1,
            updatedAt: new Date(),
          };
        })
      );
      return;
    }

    if (!getFeedbackIdeaUpvoted(id)) return;
    clearFeedbackIdeaUpvote(id);
    setFeedbacks((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          votes: Math.max(0, item.votes - 1),
          updatedAt: new Date(),
        };
      })
    );
  };

  return (
    <FeedbackContext.Provider
      value={{
        feedbacks,
        addFeedback,
        addReply,
        voteOnReply,
        deleteReply,
        updateFeedbackStatus,
        deleteFeedback,
        voteFeedback,
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