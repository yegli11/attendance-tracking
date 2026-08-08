import type { EventRepository } from '@/domain/repositories/EventRepository'
import type { Event } from '@/domain/entities/Event'

export function getEvent(repository: EventRepository, id: number): Promise<Event | null> {
  return repository.getEvent(id)
}
