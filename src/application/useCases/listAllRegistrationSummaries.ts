import type { RegistrationRepository, RegistrationSummary } from '@/domain/repositories/RegistrationRepository'

export function listAllRegistrationSummaries(repository: RegistrationRepository): Promise<RegistrationSummary[]> {
  return repository.listAllSummaries()
}
