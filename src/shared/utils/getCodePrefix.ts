export function getCodePrefix(eventName: string): string {
  const initials = eventName
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
  return initials.length >= 2 ? initials.slice(0, 3) : eventName.replace(/\s+/g, '').slice(0, 3).toUpperCase()
}
