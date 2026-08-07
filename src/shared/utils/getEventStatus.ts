export type EventStatus = 'hoy' | 'proximo' | 'finalizado'

export function getEventStatus(isoDate: string): EventStatus {
  const eventDate = new Date(isoDate)
  const today = new Date()

  if (eventDate.toDateString() === today.toDateString()) return 'hoy'
  return eventDate.getTime() > today.getTime() ? 'proximo' : 'finalizado'
}
