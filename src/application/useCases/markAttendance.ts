import type { RegistrationRepository } from '@/domain/repositories/RegistrationRepository'
import type { RosterEntry } from '@/domain/entities/RosterEntry'

export function markAttendance(
  repository: RegistrationRepository,
  registrationId: number,
  attended: boolean,
): Promise<RosterEntry> {
  return repository.setAttendance(registrationId, attended)
}
