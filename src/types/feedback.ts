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
<<<<<<< HEAD
  status: FeedbackStatus;
  priority: Priority;
  similarCount: number;
  replies: FeedbackReply[];
=======
  votes: number;
  userVote?: 'up' | 'down' | null; // ✅ ADD THIS
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
>>>>>>> b4101b8 (added voting feature for ideas to be shown in dashboard)
  createdAt: Date;
}
export interface SimilarityResult {
  isSimilar: boolean;
  similarityScore: number;
  similarFeedbacks: Feedback[];
}

