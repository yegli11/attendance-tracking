import type { RegistrationRepository } from '@/domain/repositories/RegistrationRepository'

export function deleteRegistration(repository: RegistrationRepository, registrationId: number): Promise<void> {
  return repository.remove(registrationId)
}
