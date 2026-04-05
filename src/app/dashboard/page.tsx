import AdminDashboardNav from '@/components/AdminDashboardNav';
import FeedbackDashboard from '@/components/FeedbackDashboard';
import FloatingFeedbackWidget from '@/components/FloatingFeedbackWidget';

export default function DashboardPage() {
  return (
    <div>
      <AdminDashboardNav />

      <FeedbackDashboard />
      <FloatingFeedbackWidget />
    </div>
  );
}
