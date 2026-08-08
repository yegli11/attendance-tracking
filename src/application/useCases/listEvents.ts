import type { EventRepository } from '@/domain/repositories/EventRepository'
import type { Event } from '@/domain/entities/Event'

export function listEvents(repository: EventRepository): Promise<Event[]> {
  return repository.listEvents()
}
