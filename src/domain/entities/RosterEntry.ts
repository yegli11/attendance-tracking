// One registration's attendance state for a single day of its event.
export interface DayAttendance {
  eventDayId: number
  dayNumber: number
  attendedAt: string | null
}

// Read model for a single registration, combining the person/contact/representative
// data the UI needs to render a roster card, a ticket, or an attendance search result.
export interface RosterEntry {
  registrationId: number
  eventId: number
  code: string
  /** One entry per day of the event, ordered by dayNumber. */
  attendance: DayAttendance[]
  personId: number
  firstName: string
  lastName: string
  birthdate: string
  genderName: string
  phoneNumber: string
  alternatePhoneNumber: string | null
  representativeName: string | null
}
