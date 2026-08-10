import type { EventDay } from '@/domain/entities/EventDay'

export function formatEventDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Compact label for a single day of a multi-day event, e.g. "Día 1 · vie 15 ago". */
export function formatEventDayLabel(day: EventDay): string {
  const date = new Date(day.eventDate).toLocaleString('es-CL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
  return `Día ${day.dayNumber} · ${date}`
}

/** "vie 15 - dom 17 de agosto" for events spanning more than one day. */
export function formatEventDateRange(days: EventDay[]): string {
  if (days.length <= 1) return formatEventDate(days[0]?.eventDate ?? '')

  const first = new Date(days[0].eventDate)
  const last = new Date(days[days.length - 1].eventDate)
  const firstLabel = first.toLocaleString('es-CL', { weekday: 'short', day: 'numeric' })
  const lastLabel = last.toLocaleString('es-CL', { weekday: 'short', day: 'numeric', month: 'long' })
  return `${firstLabel} - ${lastLabel}`
}
