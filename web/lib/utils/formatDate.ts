// lib/utils/formatDate.ts
export function formatDate(date: Date | { toDate(): Date } | string | number): string {
  const d = typeof date === 'object' && 'toDate' in date ? date.toDate() : new Date(date as string | number | Date);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
}

export function formatRelative(date: Date | { toDate(): Date } | string | number): string {
  const d   = typeof date === 'object' && 'toDate' in date ? date.toDate() : new Date(date as string | number | Date);
  const now = new Date();
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (sec < 60)   return 'just now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400)return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 604800)return `${Math.floor(sec / 86400)}d ago`;
  return formatDate(d);
}
