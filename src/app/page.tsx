'use client';

import dynamic from 'next/dynamic';
import FloatingFeedbackWidget from '@/components/FloatingFeedbackWidget';
import FeedbackPublicBoard from '@/components/FeedbackPublicBoard';
import Link from 'next/link';

const HomeAnimatedBackground = dynamic(
  () => import('@/components/HomeAnimatedBackground'),
  {
    ssr: false,
    loading: () => (
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-br from-indigo-100 via-violet-50 to-blue-100 animate-pulse"
        aria-hidden
      />
    ),
  }
);

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <HomeAnimatedBackground />
      <nav className="relative z-10 border-b border-white/40 bg-white/80 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span className="text-xl font-bold text-gray-950">
                FeatureHub
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-950 mb-6">
            Shape the Future of Your Product
          </h1>
          <p className="text-xl text-gray-800 mb-10 max-w-2xl mx-auto">
            Have an idea for a new feature? Submit your suggestions and help us
            build a better product. Track the progress of your requests and see
            what's coming next.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => document.querySelector<HTMLButtonElement>('.floating-widget')?.click()}
              className="bg-primary hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg"
            >
              Submit a Feature Request
            </button>
            <Link
              href="/dashboard"
              className="bg-white hover:bg-gray-50 text-gray-950 px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-gray-300 shadow-sm"
            >
              View All Requests
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-950 mb-2">
              Submit Ideas
            </h3>
            <p className="text-gray-800">
              Easily submit your feature requests with our floating widget. Just
              click and fill out the form.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-950 mb-2">
              Track Progress
            </h3>
            <p className="text-gray-800">
              See the status of your requests - whether they're pending, in
              progress, or completed.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-950 mb-2">
              Community Driven
            </h3>
            <p className="text-gray-800">
              Vote for features that matter most to you. Help prioritize the
              roadmap together.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-violet-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-950 mb-2">
              Upvote &amp; downvote
            </h3>
            <p className="text-gray-800">
              Show support for ideas you love or signal when something is less
              important—every vote shapes what we build next.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-rose-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-950 mb-2">
              Email when it&apos;s done
            </h3>
            <p className="text-gray-800">
              Get notified by email the moment your request moves to completed,
              so you never miss an update.
            </p>
          </div>
        </div>

        <FeedbackPublicBoard />
      </div>

      <FloatingFeedbackWidget />
    </main>
  );
}
