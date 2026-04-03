'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Feedback, FeedbackStatus } from '@/types/feedback';

interface FeedbackContextType {
  feedbacks: Feedback[];
  addFeedback: (feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt' | 'similarCount'>) => void;
  updateFeedbackStatus: (id: string, status: FeedbackStatus) => void;
  deleteFeedback: (id: string) => void;
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
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      similarCount: 0,
    },
    {
      id: '2',
      title: 'Export to PDF',
      description: 'Allow users to export reports as PDF',
      status: 'in_progress',
      priority: 'high',
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-22'),
      similarCount: 0,
    },
    {
      id: '3',
      title: 'Mobile App Integration',
      description: 'Sync data with mobile application',
      status: 'pending',
      priority: 'low',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20'),
      similarCount: 0,
    },
  ]);

  const addFeedback = (feedback: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt' | 'similarCount'>) => {
    const newFeedback: Feedback = {
      ...feedback,
      id: Date.now().toString(),
      similarCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setFeedbacks((prev) => [newFeedback, ...prev]);
  };

  const updateFeedbackStatus = (id: string, status: FeedbackStatus) => {
    setFeedbacks((prev) =>
      prev.map((fb) =>
        fb.id === id ? { ...fb, status, updatedAt: new Date() } : fb
      )
    );
  };

  const deleteFeedback = (id: string) => {
    setFeedbacks((prev) => prev.filter((fb) => fb.id !== id));
  };

  return (
    <FeedbackContext.Provider
      value={{ feedbacks, addFeedback, updateFeedbackStatus, deleteFeedback }}
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
