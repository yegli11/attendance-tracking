// Read model for a single registration, combining the person/contact/representative
// data the UI needs to render a roster card, a ticket, or an attendance search result.
export interface RosterEntry {
  registrationId: number
  eventId: number
  code: string
  attended: boolean
  attendedDate: string | null
  personId: number
  firstName: string
  lastName: string
  birthdate: string
  genderName: string
  phoneNumber: string
  alternatePhoneNumber: string | null
  representativeName: string | null
}
