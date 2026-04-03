export type FeedbackStatus = 'pending' | 'in_progress' | 'completed';
export type Priority = 'low' | 'medium' | 'high';

export interface Feedback {
  id: string;
  title: string;
  description: string;
  status: FeedbackStatus;
  priority: Priority;
  similarCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SimilarityResult {
  isSimilar: boolean;
  similarityScore: number;
  similarFeedbacks: Feedback[];
}
