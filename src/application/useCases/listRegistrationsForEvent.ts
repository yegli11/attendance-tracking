import type { RegistrationRepository } from '@/domain/repositories/RegistrationRepository'
import type { RosterEntry } from '@/domain/entities/RosterEntry'

export function listRegistrationsForEvent(
  repository: RegistrationRepository,
  eventId: number,
): Promise<RosterEntry[]> {
  return repository.listForEvent(eventId)
}
