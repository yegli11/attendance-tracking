import type { AuthRepository } from '@/domain/repositories/AuthRepository'

export function signOut(repository: AuthRepository): Promise<void> {
  return repository.signOut()
}
