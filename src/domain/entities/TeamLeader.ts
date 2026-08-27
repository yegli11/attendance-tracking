import type { Team } from '@/domain/entities/Team'

// A team leader's attendance state for a single day of the event.
export interface LeaderDayAttendance {
  dayId: number
  dayNumber: number
  attendedAt: string | null
}

// An adult volunteer leading one team (color) for a single event.
export interface TeamLeader {
  id: number
  eventId: number
  team: Team
  fullName: string
  /** One entry per day of the event, ordered by dayNumber. */
  attendance: LeaderDayAttendance[]
}
