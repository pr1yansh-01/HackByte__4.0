import type { Metadata } from 'next';
import { FeedbackProvider } from '@/context/FeedbackContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Feature Request System',
  description: 'Submit and manage feature requests',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <FeedbackProvider>{children}</FeedbackProvider>
      </body>
    </html>
  );
}
