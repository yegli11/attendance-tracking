import type { PaymentStatus } from '@/domain/entities/PaymentStatus'
import type { Team } from '@/domain/entities/Team'
import type { RosterEntry } from '@/domain/entities/RosterEntry'

export interface CreateRegistrationInput {
  eventId: number
  firstName: string
  lastName: string
  /** Exactly one of birthdate/ageYears must be set. */
  birthdate: string | null
  ageYears: number | null
  genderId: number
  phoneNumber: string
  alternatePhoneNumber: string | null
  representativeName: string | null
  paymentStatus: PaymentStatus | null
  team: Team | null
  isOnline: boolean
  /** Pass null to auto-generate a code from the event name. */
  code: string | null
}

export interface UpdateRegistrationInput {
  registrationId: number
  personId: number
  eventId: number
  /** Entry code; can be changed as long as it stays unique within the event. */
  code: string
  firstName: string
  lastName: string
  birthdate: string | null
  ageYears: number | null
  genderId: number
  phoneNumber: string
  alternatePhoneNumber: string | null
  representativeName: string | null
  paymentStatus: PaymentStatus | null
  team: Team | null
  isOnline: boolean
}

export interface RegistrationSummary {
  eventId: number
  attendedAnyDay: boolean
}

export interface RegistrationRepository {
  listForEvent(eventId: number): Promise<RosterEntry[]>
  /** Lightweight per-registration summary across every event, used for dashboard stats. */
  listAllSummaries(): Promise<RegistrationSummary[]>
  register(input: CreateRegistrationInput): Promise<RosterEntry>
  update(input: UpdateRegistrationInput): Promise<RosterEntry>
  findByCode(eventId: number, code: string): Promise<RosterEntry | null>
  setAttendance(registrationId: number, eventDayId: number, attended: boolean): Promise<RosterEntry>
  remove(registrationId: number): Promise<void>
}
