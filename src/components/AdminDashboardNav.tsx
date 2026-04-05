'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function AdminDashboardNav() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = (await res.json()) as {
        user?: { email: string; name: string } | null;
      };
      if (res.ok && data.user) setUser(data.user);
      else setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/dashboard/login');
    router.refresh();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between gap-y-3 h-auto min-h-16 py-3 sm:py-0 sm:h-16 sm:items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
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
              <span className="text-xl font-bold text-gray-900">FeatureHub</span>
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 font-medium">Dashboard</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {!loading && user && (
              <span className="text-sm text-gray-600 max-w-[200px] truncate">
                <span className="font-medium text-gray-900">{user.name}</span>
                <span className="text-gray-400 mx-1">·</span>
                <span className="text-gray-500">{user.email}</span>
              </span>
            )}
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
            >
              Sign out
            </button>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center gap-2"
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
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
