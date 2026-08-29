import type { StaffMemberRepository } from '@/domain/repositories/StaffMemberRepository'
import type { StaffDayAttendance, StaffMember } from '@/domain/entities/StaffMember'
import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/types/database'

type StaffMemberRow = Database['event']['Tables']['staff_member']['Row']

async function hydrate(staffMembers: StaffMemberRow[]): Promise<StaffMember[]> {
  if (staffMembers.length === 0) return []

  const eventIds = [...new Set(staffMembers.map((row) => row.event_id))]
  const staffMemberIds = staffMembers.map((row) => row.id)

  const [daysResult, attendanceResult] = await Promise.all([
    supabase.schema('event').from('day').select('*').in('event_id', eventIds).order('day_number'),
    supabase.schema('event').from('staff_member_attendance').select('*').in('staff_member_id', staffMemberIds),
  ])
  if (daysResult.error) throw daysResult.error
  if (attendanceResult.error) throw attendanceResult.error

  const daysByEventId = new Map<number, typeof daysResult.data>()
  for (const day of daysResult.data) {
    const list = daysByEventId.get(day.event_id) ?? []
    list.push(day)
    daysByEventId.set(day.event_id, list)
  }
  const attendedAtByStaffAndDay = new Map<string, string>()
  for (const attendance of attendanceResult.data) {
    attendedAtByStaffAndDay.set(`${attendance.staff_member_id}:${attendance.day_id}`, attendance.attended_at)
  }

  return staffMembers.map((staffMember) => {
    const days = daysByEventId.get(staffMember.event_id) ?? []
    const attendance: StaffDayAttendance[] = days.map((day) => ({
      dayId: day.id,
      dayNumber: day.day_number,
      attendedAt: attendedAtByStaffAndDay.get(`${staffMember.id}:${day.id}`) ?? null,
    }))
    return {
      id: staffMember.id,
      eventId: staffMember.event_id,
      fullName: staffMember.full_name,
      attendance,
    }
  })
}

export const supabaseStaffMemberRepository: StaffMemberRepository = {
  async listForEvent(eventId) {
    const { data, error } = await supabase
      .schema('event')
      .from('staff_member')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return hydrate(data)
  },

  async add(eventId, fullName) {
    const { data, error } = await supabase
      .schema('event')
      .from('staff_member')
      .insert({ event_id: eventId, full_name: fullName })
      .select()
      .single()
    if (error) throw error
    const [entry] = await hydrate([data])
    if (!entry) throw new Error('No se pudo cargar el integrante recién agregado.')
    return entry
  },

  async update(staffMemberId, fullName) {
    const { data, error } = await supabase
      .schema('event')
      .from('staff_member')
      .update({ full_name: fullName })
      .eq('id', staffMemberId)
      .select()
      .single()
    if (error) throw error
    const [entry] = await hydrate([data])
    if (!entry) throw new Error('No se pudo actualizar al integrante.')
    return entry
  },

  async remove(staffMemberId) {
    const { error } = await supabase.schema('event').from('staff_member').delete().eq('id', staffMemberId)
    if (error) throw error
  },

  async setAttendance(staffMemberId, dayId, attended) {
    if (attended) {
      const { error } = await supabase
        .schema('event')
        .from('staff_member_attendance')
        .upsert(
          { staff_member_id: staffMemberId, day_id: dayId, attended_at: new Date().toISOString() },
          { onConflict: 'staff_member_id,day_id' },
        )
      if (error) throw error
    } else {
      const { error } = await supabase
        .schema('event')
        .from('staff_member_attendance')
        .delete()
        .eq('staff_member_id', staffMemberId)
        .eq('day_id', dayId)
      if (error) throw error
    }

    const { data, error: staffError } = await supabase
      .schema('event')
      .from('staff_member')
      .select('*')
      .eq('id', staffMemberId)
      .single()
    if (staffError) throw staffError
    const [entry] = await hydrate([data])
    if (!entry) throw new Error('No se pudo actualizar la asistencia del integrante.')
    return entry
  },
}
