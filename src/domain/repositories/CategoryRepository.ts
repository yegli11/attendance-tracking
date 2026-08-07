import type { Category } from '@/domain/entities/Category'

export interface CategoryRepository {
  listCategories(): Promise<Category[]>
}
