// A staff member's attendance state for a single day of the event.
export interface StaffDayAttendance {
  dayId: number
  dayNumber: number
  attendedAt: string | null
}

// A general event staff member ("equipo de trabajo") — unlike a TeamLeader,
// not tied to any color/team.
export interface StaffMember {
  id: number
  eventId: number
  fullName: string
  /** One entry per day of the event, ordered by dayNumber. */
  attendance: StaffDayAttendance[]
}
