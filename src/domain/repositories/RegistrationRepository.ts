import type { RosterEntry } from '@/domain/entities/RosterEntry'

export interface CreateRegistrationInput {
  eventId: number
  firstName: string
  lastName: string
  birthdate: string
  genderId: number
  phoneNumber: string
  alternatePhoneNumber: string | null
  representativeName: string | null
  /** Pass null to auto-generate a code from the event name. */
  code: string | null
}

export interface UpdateRegistrationInput {
  registrationId: number
  personId: number
  firstName: string
  lastName: string
  birthdate: string
  genderId: number
  phoneNumber: string
  alternatePhoneNumber: string | null
  representativeName: string | null
}

export interface RegistrationSummary {
  eventId: number
  attended: boolean
}

export interface RegistrationRepository {
  listForEvent(eventId: number): Promise<RosterEntry[]>
  /** Lightweight per-registration summary across every event, used for dashboard stats. */
  listAllSummaries(): Promise<RegistrationSummary[]>
  register(input: CreateRegistrationInput): Promise<RosterEntry>
  update(input: UpdateRegistrationInput): Promise<RosterEntry>
  findByCode(eventId: number, code: string): Promise<RosterEntry | null>
  setAttendance(registrationId: number, attended: boolean): Promise<RosterEntry>
}
