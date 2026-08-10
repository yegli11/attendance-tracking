export type EventStatus = 'hoy' | 'proximo' | 'finalizado'

/**
 * `endDate` defaults to `startDate` for single-day events. For multi-day events pass
 * the last day's date so "hoy" covers the whole span, not just the first day.
 */
export function getEventStatus(startDate: string, endDate: string = startDate): EventStatus {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const today = new Date()

  if (today.toDateString() === start.toDateString() || today.toDateString() === end.toDateString()) return 'hoy'
  if (today.getTime() > start.getTime() && today.getTime() < end.getTime()) return 'hoy'
  return today.getTime() < start.getTime() ? 'proximo' : 'finalizado'
}
