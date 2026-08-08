import { z } from 'zod'
import type { RegistrationRepository } from '@/domain/repositories/RegistrationRepository'
import type { RosterEntry } from '@/domain/entities/RosterEntry'

const searchSchema = z.object({
  eventId: z.number().int().positive(),
  code: z.string().trim().min(1, 'Ingresa un código.'),
})

export type FindRegistrationInput = z.infer<typeof searchSchema>

export function findRegistrationByCode(
  repository: RegistrationRepository,
  input: FindRegistrationInput,
): Promise<RosterEntry | null> {
  const parsed = searchSchema.parse(input)
  return repository.findByCode(parsed.eventId, parsed.code)
}
