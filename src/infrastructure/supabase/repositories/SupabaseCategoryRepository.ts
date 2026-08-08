import type { CategoryRepository } from '@/domain/repositories/CategoryRepository'
import type { Category } from '@/domain/entities/Category'
import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/types/database'

type CategoryRow = Database['event']['Tables']['category']['Row']

function toCategory(row: CategoryRow): Category {
  return { id: row.id, name: row.name }
}

export const supabaseCategoryRepository: CategoryRepository = {
  async listCategories() {
    const { data, error } = await supabase.schema('event').from('category').select('*').order('name')
    if (error) throw error
    return data.map(toCategory)
  },
}
