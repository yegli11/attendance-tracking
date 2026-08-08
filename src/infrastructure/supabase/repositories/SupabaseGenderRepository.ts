import type { GenderRepository } from '@/domain/repositories/GenderRepository'
import type { Gender } from '@/domain/entities/Gender'
import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/types/database'

type GenderRow = Database['person']['Tables']['gender']['Row']

function toGender(row: GenderRow): Gender {
  return { id: row.id, name: row.name }
}

export const supabaseGenderRepository: GenderRepository = {
  async listGenders() {
    const { data, error } = await supabase.schema('person').from('gender').select('*').order('name')
    if (error) throw error
    return data.map(toGender)
  },
}
