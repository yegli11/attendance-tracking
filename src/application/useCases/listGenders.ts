import type { GenderRepository } from '@/domain/repositories/GenderRepository'
import type { Gender } from '@/domain/entities/Gender'

export function listGenders(repository: GenderRepository): Promise<Gender[]> {
  return repository.listGenders()
}
