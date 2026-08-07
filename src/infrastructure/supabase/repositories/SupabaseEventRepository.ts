import type { CreateEventInput, EventRepository } from '@/domain/repositories/EventRepository'
import type { Event } from '@/domain/entities/Event'
import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/types/database'

type EventRow = Database['event']['Tables']['event']['Row']

function toEvent(row: EventRow): Event {
  return {
    id: row.id,
    name: row.name,
    eventDate: row.event_date,
    categoryId: row.category_id,
    createdAt: row.created_at,
  }
}

export const supabaseEventRepository: EventRepository = {
  async listEvents() {
    const { data, error } = await supabase
      .schema('event')
      .from('event')
      .select('*')
      .order('event_date', { ascending: true })
    if (error) throw error
    return data.map(toEvent)
  },

  async createEvent(input: CreateEventInput) {
    const { data, error } = await supabase
      .schema('event')
      .from('event')
      .insert({ name: input.name, event_date: input.eventDate, category_id: input.categoryId })
      .select()
      .single()
    if (error) throw error
    return toEvent(data)
  },
}
