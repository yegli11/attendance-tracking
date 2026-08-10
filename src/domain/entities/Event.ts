import type { EventDay } from '@/domain/entities/EventDay'

export interface Event {
  id: number
  name: string
  eventDate: string
  categoryId: number
  location: string | null
  createdAt: string
  /** One entry per day of the event, ordered by dayNumber. Always at least one. */
  days: EventDay[]
}
