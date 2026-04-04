/** Normalize feature titles so suggestion votes and submitted requests use the same key. */
export function normalizeFeatureKey(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ');
}
