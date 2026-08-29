import type { EventDay } from '@/domain/entities/EventDay'

function isSameMonthAndDay(birthdate: string, isoDate: string): boolean {
  const birth = new Date(`${birthdate}T00:00:00`)
  const date = new Date(isoDate)
  return birth.getMonth() === date.getMonth() && birth.getDate() === date.getDate()
}

/** The event day (if any) whose calendar date matches the person's birthday, so leaders can congratulate them during the event. */
export function findBirthdayEventDay(birthdate: string | null, days: EventDay[]): EventDay | null {
  if (!birthdate) return null
  return days.find((day) => isSameMonthAndDay(birthdate, day.eventDate)) ?? null
}
