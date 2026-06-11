export function getInitials(username?: string | null): string {
  if (!username?.trim()) return '?';

  return username
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
