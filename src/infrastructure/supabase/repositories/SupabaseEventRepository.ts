import type { CreateEventInput, EventRepository } from '@/domain/repositories/EventRepository'
import type { Event } from '@/domain/entities/Event'
import type { EventDay } from '@/domain/entities/EventDay'
import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/types/database'

type EventRow = Database['event']['Tables']['event']['Row']
type EventDayRow = Database['event']['Tables']['day']['Row']

function toEventDay(row: EventDayRow): EventDay {
  return {
    id: row.id,
    eventId: row.event_id,
    dayNumber: row.day_number,
    eventDate: row.event_date,
    createdAt: row.created_at,
  }
}

async function hydrate(rows: EventRow[]): Promise<Event[]> {
  if (rows.length === 0) return []

  const eventIds = rows.map((row) => row.id)
  const { data: dayRows, error } = await supabase
    .schema('event')
    .from('day')
    .select('*')
    .in('event_id', eventIds)
    .order('day_number', { ascending: true })
  if (error) throw error

  const daysByEventId = new Map<number, EventDay[]>()
  for (const dayRow of dayRows) {
    const day = toEventDay(dayRow)
    const list = daysByEventId.get(day.eventId) ?? []
    list.push(day)
    daysByEventId.set(day.eventId, list)
  }

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    eventDate: row.event_date,
    categoryId: row.category_id,
    location: row.location,
    createdAt: row.created_at,
    days: daysByEventId.get(row.id) ?? [],
  }))
}

export const supabaseEventRepository: EventRepository = {
  async listEvents() {
    const { data, error } = await supabase
      .schema('event')
      .from('event')
      .select('*')
      .order('event_date', { ascending: true })
    if (error) throw error
    return hydrate(data)
  },

  async getEvent(id) {
    const { data, error } = await supabase.schema('event').from('event').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    if (!data) return null
    const [event] = await hydrate([data])
    return event ?? null
  },

  async createEvent(input: CreateEventInput) {
    const { data, error } = await supabase
      .schema('event')
      .from('event')
      .insert({
        name: input.name,
        event_date: input.eventDate,
        category_id: input.categoryId,
      })
      .select()
      .single()
    if (error) throw error

    const startDate = new Date(input.eventDate)
    const dayRows = Array.from({ length: input.durationDays }, (_, index) => {
      const dayDate = new Date(startDate)
      dayDate.setDate(dayDate.getDate() + index)
      return { event_id: data.id, day_number: index + 1, event_date: dayDate.toISOString() }
    })
    const { error: daysError } = await supabase.schema('event').from('day').insert(dayRows)
    if (daysError) throw daysError

    const [event] = await hydrate([data])
    if (!event) throw new Error('No se pudo cargar el evento recién creado.')
    return event
  },
}
