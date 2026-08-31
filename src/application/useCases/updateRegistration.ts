import { z } from 'zod'
import type { RegistrationRepository, UpdateRegistrationInput } from '@/domain/repositories/RegistrationRepository'
import type { RosterEntry } from '@/domain/entities/RosterEntry'

const updateRegistrationSchema = z
  .object({
    registrationId: z.number().int().positive(),
    personId: z.number().int().positive(),
    eventId: z.number().int().positive(),
    code: z
      .string()
      .trim()
      .min(1, 'Ingresa el código.')
      .transform((value) => value.toUpperCase()),
    firstName: z.string().trim().min(1, 'Ingresa el nombre.'),
    lastName: z.string().trim().min(1, 'Ingresa el apellido.'),
    birthdate: z.string().trim().optional().nullable(),
    ageYears: z.number().int().min(0, 'Edad inválida.').max(120, 'Edad inválida.').optional().nullable(),
    genderId: z.number().int().positive('Selecciona una opción.'),
    phoneNumber: z.string().trim().min(1, 'Ingresa un contacto.'),
    alternatePhoneNumber: z.string().trim().optional().nullable(),
    representativeName: z.string().trim().optional().nullable(),
    requiresRepresentative: z.boolean(),
    paymentStatus: z.enum(['pendiente', 'financiado', 'pagado']).optional().nullable(),
    requiresPaymentStatus: z.boolean(),
    team: z.enum(['naranja', 'rojo', 'verde', 'azul']).optional().nullable(),
    isOnline: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.requiresRepresentative && !value.representativeName) {
      ctx.addIssue({ code: 'custom', path: ['representativeName'], message: 'Ingresa el representante.' })
    }
    if (value.requiresPaymentStatus && !value.paymentStatus) {
      ctx.addIssue({ code: 'custom', path: ['paymentStatus'], message: 'Selecciona el estado de pago.' })
    }

    const birthdate = value.birthdate?.trim() || null
    // Birthdate is preferred, but an age is always accepted as a fallback when
    // the exact date is unknown (e.g. records migrated from paper sheets).
    if (!birthdate && value.ageYears == null) {
      ctx.addIssue({
        code: 'custom',
        path: ['birthdate'],
        message: 'Ingresa la fecha de nacimiento o la edad.',
      })
      return
    }
    if (birthdate) {
      if (Number.isNaN(new Date(birthdate).getTime())) {
        ctx.addIssue({ code: 'custom', path: ['birthdate'], message: 'Fecha inválida.' })
      } else if (new Date(birthdate) > new Date()) {
        ctx.addIssue({ code: 'custom', path: ['birthdate'], message: 'La fecha no puede ser futura.' })
      }
    }
  })

export type UpdateRegistrationFormInput = z.infer<typeof updateRegistrationSchema>

export async function updateRegistration(
  repository: RegistrationRepository,
  input: UpdateRegistrationFormInput,
): Promise<RosterEntry> {
  const parsed = updateRegistrationSchema.parse(input)
  const birthdate = parsed.birthdate?.trim() || null
  const updateInput: UpdateRegistrationInput = {
    registrationId: parsed.registrationId,
    personId: parsed.personId,
    eventId: parsed.eventId,
    code: parsed.code,
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    birthdate: birthdate,
    ageYears: birthdate ? null : (parsed.ageYears ?? null),
    genderId: parsed.genderId,
    phoneNumber: parsed.phoneNumber,
    alternatePhoneNumber: parsed.alternatePhoneNumber || null,
    representativeName: parsed.representativeName || null,
    paymentStatus: parsed.paymentStatus || null,
    team: parsed.team || null,
    isOnline: parsed.isOnline,
  }
  return repository.update(updateInput)
}
