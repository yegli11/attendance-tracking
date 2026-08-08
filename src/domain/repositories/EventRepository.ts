import type { Event } from '@/domain/entities/Event'

export interface CreateEventInput {
  name: string
  eventDate: string
  categoryId: number
  location: string | null
}

export interface EventRepository {
  listEvents(): Promise<Event[]>
  getEvent(id: number): Promise<Event | null>
  createEvent(input: CreateEventInput): Promise<Event>
}
