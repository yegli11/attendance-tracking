import { describe, expect, it, vi } from 'vitest'
import { ZodError } from 'zod'
import type { RegistrationRepository } from '@/domain/repositories/RegistrationRepository'
import { updateRegistration } from './updateRegistration'

function createRepository(): RegistrationRepository {
  return {
    listForEvent: vi.fn(),
    listAllSummaries: vi.fn(),
    register: vi.fn(),
    update: vi.fn().mockResolvedValue({
      registrationId: 1,
      eventId: 1,
      code: 'CI-001',
      attended: false,
      attendedDate: null,
      personId: 1,
      firstName: 'María',
      lastName: 'Pérez',
      birthdate: '2015-01-01',
      genderName: 'Femenino',
      phoneNumber: '+56911111111',
      alternatePhoneNumber: null,
      representativeName: 'Ana Pérez',
    }),
    findByCode: vi.fn(),
    setAttendance: vi.fn(),
  }
}

const baseInput = {
  registrationId: 1,
  personId: 1,
  firstName: 'María',
  lastName: 'Pérez',
  birthdate: '2015-01-01',
  genderId: 1,
  phoneNumber: '+56911111111',
  alternatePhoneNumber: null,
}

describe('updateRegistration', () => {
  it('updates a registration when the representative is provided and required', async () => {
    const repository = createRepository()

    await updateRegistration(repository, {
      ...baseInput,
      representativeName: 'Ana Pérez',
      requiresRepresentative: true,
    })

    expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({ representativeName: 'Ana Pérez' }))
  })

  it('rejects a missing representative when the category requires one', async () => {
    const repository = createRepository()

    await expect(
      updateRegistration(repository, { ...baseInput, representativeName: null, requiresRepresentative: true }),
    ).rejects.toThrow(ZodError)
    expect(repository.update).not.toHaveBeenCalled()
  })

  it('rejects an empty first name', async () => {
    const repository = createRepository()

    await expect(
      updateRegistration(repository, {
        ...baseInput,
        firstName: '  ',
        representativeName: null,
        requiresRepresentative: false,
      }),
    ).rejects.toThrow(ZodError)
    expect(repository.update).not.toHaveBeenCalled()
  })
})
