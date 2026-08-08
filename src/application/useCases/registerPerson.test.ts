import { describe, expect, it, vi } from 'vitest'
import { ZodError } from 'zod'
import type { RegistrationRepository } from '@/domain/repositories/RegistrationRepository'
import { registerPerson } from './registerPerson'

function createRepository(): RegistrationRepository {
  return {
    listForEvent: vi.fn(),
    listAllSummaries: vi.fn(),
    register: vi.fn().mockResolvedValue({
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
    update: vi.fn(),
    findByCode: vi.fn(),
    setAttendance: vi.fn(),
  }
}

const baseInput = {
  eventId: 1,
  firstName: 'María',
  lastName: 'Pérez',
  birthdate: '2015-01-01',
  genderId: 1,
  phoneNumber: '+56911111111',
  alternatePhoneNumber: null,
  code: null,
}

describe('registerPerson', () => {
  it('registers a person when the representative is provided and required', async () => {
    const repository = createRepository()

    await registerPerson(repository, {
      ...baseInput,
      representativeName: 'Ana Pérez',
      requiresRepresentative: true,
    })

    expect(repository.register).toHaveBeenCalledWith(
      expect.objectContaining({ representativeName: 'Ana Pérez' }),
    )
  })

  it('rejects a missing representative when the category requires one', async () => {
    const repository = createRepository()

    await expect(
      registerPerson(repository, { ...baseInput, representativeName: null, requiresRepresentative: true }),
    ).rejects.toThrow(ZodError)
    expect(repository.register).not.toHaveBeenCalled()
  })

  it('allows a missing representative when the category does not require one', async () => {
    const repository = createRepository()

    await registerPerson(repository, {
      ...baseInput,
      representativeName: null,
      requiresRepresentative: false,
    })

    expect(repository.register).toHaveBeenCalledWith(expect.objectContaining({ representativeName: null }))
  })

  it('rejects a future birthdate', async () => {
    const repository = createRepository()
    const futureDate = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

    await expect(
      registerPerson(repository, {
        ...baseInput,
        birthdate: futureDate,
        representativeName: null,
        requiresRepresentative: false,
      }),
    ).rejects.toThrow(ZodError)
    expect(repository.register).not.toHaveBeenCalled()
  })
})
