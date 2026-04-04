/** Keyword-based suggestions when Gemini is unavailable (offline / no API key). */
export function getKeywordFeatureSuggestions(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  const buckets: { test: (s: string) => boolean; items: string[] }[] = [
    {
      test: (s) =>
        /dark|theme|night|light mode|appearance/.test(s),
      items: [
        'Implement dark mode across the entire app',
        'Add system theme sync (follow OS light/dark)',
        'Dark mode for dashboard and settings only',
        'User-selectable color themes (light / dark / high contrast)',
      ],
    },
    {
      test: (s) => /bug|fix|crash|error|broken|defect/.test(s),
      items: [
        'Fix critical bug affecting checkout flow',
        'Resolve mobile Safari layout bug',
        'Bug fix: session timeout on idle users',
        'Address reported crash when uploading large files',
      ],
    },
    {
      test: (s) => /export|pdf|csv|download|report/.test(s),
      items: [
        'Export reports to PDF',
        'Export data tables to CSV',
        'Scheduled email export of weekly summaries',
        'Download analytics as Excel-compatible file',
      ],
    },
    {
      test: (s) => /notif|alert|email|push/.test(s),
      items: [
        'Email notifications for status changes',
        'In-app push notifications for mentions',
        'Configurable notification preferences per project',
        'Digest emails: daily summary of activity',
      ],
    },
    {
      test: (s) => /search|filter|sort/.test(s),
      items: [
        'Global search across projects and tasks',
        'Advanced filters saved as custom views',
        'Full-text search with highlighted matches',
      ],
    },
    {
      test: (s) => /mobile|ios|android|responsive/.test(s),
      items: [
        'Improve responsive layout on small screens',
        'Dedicated mobile app for iOS and Android',
        'Touch-friendly controls for tablet users',
      ],
    },
    {
      test: (s) => /auth|login|sso|oauth|security/.test(s),
      items: [
        'Single sign-on (SSO) with SAML',
        'OAuth login with Google and Microsoft',
        'Two-factor authentication (2FA) for all users',
      ],
    },
  ];

  const seen = new Set<string>();
  const out: string[] = [];

  for (const { test, items } of buckets) {
    if (!test(q)) continue;
    for (const item of items) {
      if (seen.has(item)) continue;
      seen.add(item);
      out.push(item);
      if (out.length >= 4) return out;
    }
  }

  if (out.length > 0) return out;

  return [
    // `Expand on: ${query.trim()}`,
    // 'Add user preferences for this feature area',
    // 'Improve performance and loading times',
    // 'Accessibility improvements (keyboard & screen readers)',
    `Feature not found, please try again with a different query`
  ].slice(0, 4);
}
