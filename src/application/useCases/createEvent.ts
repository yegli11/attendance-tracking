import { z } from 'zod'
import type { EventRepository } from '@/domain/repositories/EventRepository'
import type { Event } from '@/domain/entities/Event'

const createEventSchema = z.object({
  name: z.string().trim().min(1, 'Ingresa el nombre del evento.').max(50, 'Máximo 50 caracteres.'),
  eventDate: z.string().trim().min(1, 'Selecciona la fecha y hora del evento.'),
  categoryId: z.number().int().positive('Selecciona una categoría.'),
  location: z.string().trim().optional().nullable(),
})

export type CreateEventFormInput = z.infer<typeof createEventSchema>

export async function createEvent(
  repository: EventRepository,
  input: CreateEventFormInput,
): Promise<Event> {
  const parsed = createEventSchema.parse(input)
  return repository.createEvent({ ...parsed, location: parsed.location || null })
}
