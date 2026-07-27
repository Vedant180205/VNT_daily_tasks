export function getInitials(name: string) {
  if (!name) return '';
  return name
    .split(' ')
    .filter(n => n.length > 0)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}
