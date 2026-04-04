export type FeedbackStatus = 'pending' | 'in_progress' | 'completed';
export type Priority = 'low' | 'medium' | 'high';

export type FeedbackReplyRole = 'user' | 'admin';

export interface FeedbackReply {
  id: string;
  body: string;
  authorName: string;
  role: FeedbackReplyRole;
  upvoteCount: number;
  downvoteCount: number;
  createdAt: Date;
}

export interface Feedback {
  id: string;
  title: string;
  description: string;
  status: FeedbackStatus;
  priority: Priority;
  similarCount: number;
  replies: FeedbackReply[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SimilarityResult {
  isSimilar: boolean;
  similarityScore: number;
  similarFeedbacks: Feedback[];
}
