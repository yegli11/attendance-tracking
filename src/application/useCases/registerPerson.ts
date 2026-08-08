import { z } from 'zod'
import type { CreateRegistrationInput, RegistrationRepository } from '@/domain/repositories/RegistrationRepository'
import type { RosterEntry } from '@/domain/entities/RosterEntry'

const registerPersonSchema = z
  .object({
    eventId: z.number().int().positive(),
    firstName: z.string().trim().min(1, 'Ingresa el nombre.'),
    lastName: z.string().trim().min(1, 'Ingresa el apellido.'),
    birthdate: z
      .string()
      .min(1, 'Ingresa la fecha de nacimiento.')
      .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Fecha inválida.')
      .refine((value) => new Date(value) <= new Date(), 'La fecha no puede ser futura.'),
    genderId: z.number().int().positive('Selecciona una opción.'),
    phoneNumber: z.string().trim().min(1, 'Ingresa un contacto.'),
    alternatePhoneNumber: z.string().trim().optional().nullable(),
    representativeName: z.string().trim().optional().nullable(),
    requiresRepresentative: z.boolean(),
    code: z.string().trim().optional().nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.requiresRepresentative && !value.representativeName) {
      ctx.addIssue({ code: 'custom', path: ['representativeName'], message: 'Ingresa el representante.' })
    }
  })

export type RegisterPersonFormInput = z.infer<typeof registerPersonSchema>

export async function registerPerson(
  repository: RegistrationRepository,
  input: RegisterPersonFormInput,
): Promise<RosterEntry> {
  const parsed = registerPersonSchema.parse(input)
  const registrationInput: CreateRegistrationInput = {
    eventId: parsed.eventId,
    firstName: parsed.firstName,
    lastName: parsed.lastName,
    birthdate: parsed.birthdate,
    genderId: parsed.genderId,
    phoneNumber: parsed.phoneNumber,
    alternatePhoneNumber: parsed.alternatePhoneNumber || null,
    representativeName: parsed.representativeName || null,
    code: parsed.code || null,
  }
  return repository.register(registrationInput)
}
