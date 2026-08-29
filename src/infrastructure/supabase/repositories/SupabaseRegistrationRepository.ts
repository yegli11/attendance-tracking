import type { RegistrationRepository } from '@/domain/repositories/RegistrationRepository'
import type { DayAttendance, RosterEntry } from '@/domain/entities/RosterEntry'
import type { PaymentStatus } from '@/domain/entities/PaymentStatus'
import type { Team } from '@/domain/entities/Team'
import { supabase } from '@/infrastructure/supabase/client'
import type { Database } from '@/infrastructure/supabase/types/database'

type RegistrationRow = Database['event']['Tables']['registration']['Row']
type ContactRow = Database['person']['Tables']['contact']['Row']

async function hydrate(registrations: RegistrationRow[]): Promise<RosterEntry[]> {
  if (registrations.length === 0) return []

  const personIds = [...new Set(registrations.map((row) => row.person_id))]
  const eventIds = [...new Set(registrations.map((row) => row.event_id))]
  const registrationIds = registrations.map((row) => row.id)

  const [personsResult, contactsResult, gendersResult, representativesResult, daysResult, attendanceResult] =
    await Promise.all([
      supabase.schema('person').from('person').select('*').in('id', personIds),
      supabase.schema('person').from('contact').select('*').in('person_id', personIds),
      supabase.schema('person').from('gender').select('*'),
      supabase
        .schema('person')
        .from('authorized_representative')
        .select('*')
        .in('registration_id', registrationIds),
      supabase.schema('event').from('day').select('*').in('event_id', eventIds).order('day_number'),
      supabase.schema('event').from('attendance').select('*').in('registration_id', registrationIds),
    ])
  if (personsResult.error) throw personsResult.error
  if (contactsResult.error) throw contactsResult.error
  if (gendersResult.error) throw gendersResult.error
  if (representativesResult.error) throw representativesResult.error
  if (daysResult.error) throw daysResult.error
  if (attendanceResult.error) throw attendanceResult.error

  const personById = new Map(personsResult.data.map((person) => [person.id, person]))
  const genderById = new Map(gendersResult.data.map((gender) => [gender.id, gender]))
  const contactsByPersonId = new Map<number, ContactRow[]>()
  for (const contact of contactsResult.data) {
    const list = contactsByPersonId.get(contact.person_id) ?? []
    list.push(contact)
    contactsByPersonId.set(contact.person_id, list)
  }
  const representativeByRegistrationId = new Map(
    representativesResult.data.map((representative) => [representative.registration_id, representative]),
  )
  const daysByEventId = new Map<number, typeof daysResult.data>()
  for (const day of daysResult.data) {
    const list = daysByEventId.get(day.event_id) ?? []
    list.push(day)
    daysByEventId.set(day.event_id, list)
  }
  const attendedAtByRegistrationAndDay = new Map<string, string>()
  for (const attendance of attendanceResult.data) {
    attendedAtByRegistrationAndDay.set(`${attendance.registration_id}:${attendance.day_id}`, attendance.attended_at)
  }

  const entries: RosterEntry[] = []
  for (const registration of registrations) {
    const person = personById.get(registration.person_id)
    if (!person) continue
    const contacts = (contactsByPersonId.get(person.id) ?? []).sort((a, b) => a.id - b.id)
    const days = daysByEventId.get(registration.event_id) ?? []
    const attendance: DayAttendance[] = days.map((day) => ({
      eventDayId: day.id,
      dayNumber: day.day_number,
      attendedAt: attendedAtByRegistrationAndDay.get(`${registration.id}:${day.id}`) ?? null,
    }))
    entries.push({
      registrationId: registration.id,
      eventId: registration.event_id,
      code: registration.code,
      attendance,
      personId: person.id,
      firstName: person.name,
      lastName: person.last_name,
      birthdate: person.birthdate,
      ageYears: person.age_years,
      genderName: genderById.get(person.gender_id)?.name ?? '',
      phoneNumber: contacts[0]?.phone_number ?? '',
      alternatePhoneNumber: contacts[1]?.phone_number ?? null,
      representativeName: representativeByRegistrationId.get(registration.id)?.full_name ?? null,
      paymentStatus: (registration.payment_status as PaymentStatus | null) ?? null,
      team: (registration.team as Team | null) ?? null,
      isOnline: registration.is_online,
    })
  }
  return entries
}

const CODE_LETTERS = 'ZYXWVUTSRQPONMLKJIHGFEDCBA'.split('')

async function generateUniqueCode(eventId: number): Promise<string> {
  for (const letter of CODE_LETTERS) {
    for (let number = 1; number <= 99; number++) {
      const code = `${letter}-${String(number).padStart(2, '0')}`
      const { data, error } = await supabase
        .schema('event')
        .from('registration')
        .select('id')
        .eq('event_id', eventId)
        .eq('code', code)
        .maybeSingle()
      if (error) throw error
      if (!data) return code
    }
  }
  throw new Error('No se pudo generar un código único para este evento.')
}

export const supabaseRegistrationRepository: RegistrationRepository = {
  async listForEvent(eventId) {
    const { data, error } = await supabase
      .schema('event')
      .from('registration')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return hydrate(data)
  },

  async listAllSummaries() {
    const [registrationsResult, attendanceResult] = await Promise.all([
      supabase.schema('event').from('registration').select('id, event_id'),
      supabase.schema('event').from('attendance').select('registration_id'),
    ])
    if (registrationsResult.error) throw registrationsResult.error
    if (attendanceResult.error) throw attendanceResult.error

    const registrationIdsWithAttendance = new Set(attendanceResult.data.map((row) => row.registration_id))
    return registrationsResult.data.map((row) => ({
      eventId: row.event_id,
      attendedAnyDay: registrationIdsWithAttendance.has(row.id),
    }))
  },

  async register(input) {
    const { data: person, error: personError } = await supabase
      .schema('person')
      .from('person')
      .insert({
        name: input.firstName,
        last_name: input.lastName,
        gender_id: input.genderId,
        birthdate: input.birthdate,
        age_years: input.ageYears,
      })
      .select()
      .single()
    if (personError) throw personError

    const contactRows = [{ person_id: person.id, phone_number: input.phoneNumber }]
    if (input.alternatePhoneNumber) {
      contactRows.push({ person_id: person.id, phone_number: input.alternatePhoneNumber })
    }
    const { error: contactError } = await supabase.schema('person').from('contact').insert(contactRows)
    if (contactError) throw contactError

    let code = input.code?.trim().toUpperCase() || null
    if (code) {
      const { data: existing, error: existingError } = await supabase
        .schema('event')
        .from('registration')
        .select('id')
        .eq('event_id', input.eventId)
        .eq('code', code)
        .maybeSingle()
      if (existingError) throw existingError
      if (existing) throw new Error('Ese código ya fue asignado a otro asistente, ingresa uno diferente.')
    } else {
      code = await generateUniqueCode(input.eventId)
    }

    const { data: registration, error: registrationError } = await supabase
      .schema('event')
      .from('registration')
      .insert({
        person_id: person.id,
        event_id: input.eventId,
        code,
        payment_status: input.paymentStatus,
        team: input.team,
        is_online: input.isOnline,
      })
      .select()
      .single()
    if (registrationError) throw registrationError

    if (input.representativeName) {
      const { error: representativeError } = await supabase
        .schema('person')
        .from('authorized_representative')
        .insert({ full_name: input.representativeName, registration_id: registration.id })
      if (representativeError) throw representativeError
    }

    const [entry] = await hydrate([registration])
    if (!entry) throw new Error('No se pudo cargar la inscripción recién creada.')
    return entry
  },

  async update(input) {
    const { error: personError } = await supabase
      .schema('person')
      .from('person')
      .update({
        name: input.firstName,
        last_name: input.lastName,
        gender_id: input.genderId,
        birthdate: input.birthdate,
        age_years: input.ageYears,
      })
      .eq('id', input.personId)
    if (personError) throw personError

    const { data: existingContacts, error: contactsError } = await supabase
      .schema('person')
      .from('contact')
      .select('*')
      .eq('person_id', input.personId)
      .order('id', { ascending: true })
    if (contactsError) throw contactsError

    const [primaryContact, alternateContact] = existingContacts

    if (primaryContact) {
      const { error } = await supabase
        .schema('person')
        .from('contact')
        .update({ phone_number: input.phoneNumber })
        .eq('id', primaryContact.id)
      if (error) throw error
    } else {
      const { error } = await supabase
        .schema('person')
        .from('contact')
        .insert({ person_id: input.personId, phone_number: input.phoneNumber })
      if (error) throw error
    }

    if (input.alternatePhoneNumber) {
      if (alternateContact) {
        const { error } = await supabase
          .schema('person')
          .from('contact')
          .update({ phone_number: input.alternatePhoneNumber })
          .eq('id', alternateContact.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .schema('person')
          .from('contact')
          .insert({ person_id: input.personId, phone_number: input.alternatePhoneNumber })
        if (error) throw error
      }
    } else if (alternateContact) {
      const { error } = await supabase.schema('person').from('contact').delete().eq('id', alternateContact.id)
      if (error) throw error
    }

    const { data: existingRepresentative, error: representativeError } = await supabase
      .schema('person')
      .from('authorized_representative')
      .select('*')
      .eq('registration_id', input.registrationId)
      .maybeSingle()
    if (representativeError) throw representativeError

    if (input.representativeName) {
      if (existingRepresentative) {
        const { error } = await supabase
          .schema('person')
          .from('authorized_representative')
          .update({ full_name: input.representativeName })
          .eq('id', existingRepresentative.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .schema('person')
          .from('authorized_representative')
          .insert({ full_name: input.representativeName, registration_id: input.registrationId })
        if (error) throw error
      }
    } else if (existingRepresentative) {
      const { error } = await supabase
        .schema('person')
        .from('authorized_representative')
        .delete()
        .eq('id', existingRepresentative.id)
      if (error) throw error
    }

    const { data: registration, error: registrationError } = await supabase
      .schema('event')
      .from('registration')
      .update({ payment_status: input.paymentStatus, team: input.team, is_online: input.isOnline })
      .eq('id', input.registrationId)
      .select()
      .single()
    if (registrationError) throw registrationError

    const [entry] = await hydrate([registration])
    if (!entry) throw new Error('No se pudo cargar la inscripción actualizada.')
    return entry
  },

  async findByCode(eventId, code) {
    const { data, error } = await supabase
      .schema('event')
      .from('registration')
      .select('*')
      .eq('event_id', eventId)
      .eq('code', code.trim().toUpperCase())
      .maybeSingle()
    if (error) throw error
    if (!data) return null
    const [entry] = await hydrate([data])
    return entry ?? null
  },

  async setAttendance(registrationId, eventDayId, attended) {
    if (attended) {
      const { error } = await supabase
        .schema('event')
        .from('attendance')
        .upsert(
          { registration_id: registrationId, day_id: eventDayId, attended_at: new Date().toISOString() },
          { onConflict: 'registration_id,day_id' },
        )
      if (error) throw error
    } else {
      const { error } = await supabase
        .schema('event')
        .from('attendance')
        .delete()
        .eq('registration_id', registrationId)
        .eq('day_id', eventDayId)
      if (error) throw error
    }

    const { data, error: registrationError } = await supabase
      .schema('event')
      .from('registration')
      .select('*')
      .eq('id', registrationId)
      .single()
    if (registrationError) throw registrationError
    const [entry] = await hydrate([data])
    if (!entry) throw new Error('No se pudo actualizar la asistencia.')
    return entry
  },

  async remove(registrationId) {
    const { error } = await supabase.schema('event').from('registration').delete().eq('id', registrationId)
    if (error) throw error
  },
}
