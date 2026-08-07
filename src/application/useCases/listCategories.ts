import type { CategoryRepository } from '@/domain/repositories/CategoryRepository'
import type { Category } from '@/domain/entities/Category'

export function listCategories(repository: CategoryRepository): Promise<Category[]> {
  return repository.listCategories()
}
