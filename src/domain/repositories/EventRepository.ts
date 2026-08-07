import type { Event } from '@/domain/entities/Event'

export interface CreateEventInput {
  name: string
  eventDate: string
  categoryId: number
}

export interface EventRepository {
  listEvents(): Promise<Event[]>
  createEvent(input: CreateEventInput): Promise<Event>
}
