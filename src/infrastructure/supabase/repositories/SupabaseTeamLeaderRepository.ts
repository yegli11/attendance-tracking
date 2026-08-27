import type { TeamLeaderRepository } from '@/domain/repositories/TeamLeaderRepository'
import type { LeaderDayAttendance, TeamLeader } from '@/domain/entities/TeamLeader'
import type { Team } from '@/domain/entities/Team'
import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/types/database'

type TeamLeaderRow = Database['event']['Tables']['team_leader']['Row']

async function hydrate(leaders: TeamLeaderRow[]): Promise<TeamLeader[]> {
  if (leaders.length === 0) return []

  const eventIds = [...new Set(leaders.map((row) => row.event_id))]
  const leaderIds = leaders.map((row) => row.id)

  const [daysResult, attendanceResult] = await Promise.all([
    supabase.schema('event').from('day').select('*').in('event_id', eventIds).order('day_number'),
    supabase.schema('event').from('team_leader_attendance').select('*').in('team_leader_id', leaderIds),
  ])
  if (daysResult.error) throw daysResult.error
  if (attendanceResult.error) throw attendanceResult.error

  const daysByEventId = new Map<number, typeof daysResult.data>()
  for (const day of daysResult.data) {
    const list = daysByEventId.get(day.event_id) ?? []
    list.push(day)
    daysByEventId.set(day.event_id, list)
  }
  const attendedAtByLeaderAndDay = new Map<string, string>()
  for (const attendance of attendanceResult.data) {
    attendedAtByLeaderAndDay.set(`${attendance.team_leader_id}:${attendance.day_id}`, attendance.attended_at)
  }

  return leaders.map((leader) => {
    const days = daysByEventId.get(leader.event_id) ?? []
    const attendance: LeaderDayAttendance[] = days.map((day) => ({
      dayId: day.id,
      dayNumber: day.day_number,
      attendedAt: attendedAtByLeaderAndDay.get(`${leader.id}:${day.id}`) ?? null,
    }))
    return {
      id: leader.id,
      eventId: leader.event_id,
      team: leader.team as Team,
      fullName: leader.full_name,
      attendance,
    }
  })
}

export const supabaseTeamLeaderRepository: TeamLeaderRepository = {
  async listForEvent(eventId) {
    const { data, error } = await supabase
      .schema('event')
      .from('team_leader')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return hydrate(data)
  },

  async add(eventId, team, fullName) {
    const { data, error } = await supabase
      .schema('event')
      .from('team_leader')
      .insert({ event_id: eventId, team, full_name: fullName })
      .select()
      .single()
    if (error) throw error
    const [entry] = await hydrate([data])
    if (!entry) throw new Error('No se pudo cargar el líder recién agregado.')
    return entry
  },

  async update(teamLeaderId, fullName) {
    const { data, error } = await supabase
      .schema('event')
      .from('team_leader')
      .update({ full_name: fullName })
      .eq('id', teamLeaderId)
      .select()
      .single()
    if (error) throw error
    const [entry] = await hydrate([data])
    if (!entry) throw new Error('No se pudo actualizar al líder.')
    return entry
  },

  async remove(teamLeaderId) {
    const { error } = await supabase.schema('event').from('team_leader').delete().eq('id', teamLeaderId)
    if (error) throw error
  },

  async setAttendance(teamLeaderId, dayId, attended) {
    if (attended) {
      const { error } = await supabase
        .schema('event')
        .from('team_leader_attendance')
        .upsert(
          { team_leader_id: teamLeaderId, day_id: dayId, attended_at: new Date().toISOString() },
          { onConflict: 'team_leader_id,day_id' },
        )
      if (error) throw error
    } else {
      const { error } = await supabase
        .schema('event')
        .from('team_leader_attendance')
        .delete()
        .eq('team_leader_id', teamLeaderId)
        .eq('day_id', dayId)
      if (error) throw error
    }

    const { data, error: leaderError } = await supabase
      .schema('event')
      .from('team_leader')
      .select('*')
      .eq('id', teamLeaderId)
      .single()
    if (leaderError) throw leaderError
    const [entry] = await hydrate([data])
    if (!entry) throw new Error('No se pudo actualizar la asistencia del líder.')
    return entry
  },
}
