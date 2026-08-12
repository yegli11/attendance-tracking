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
      attendance: [],
      personId: 1,
      firstName: 'María',
      lastName: 'Pérez',
      birthdate: '2015-01-01',
      ageYears: null,
      genderName: 'Femenino',
      phoneNumber: '+56911111111',
      alternatePhoneNumber: null,
      representativeName: 'Ana Pérez',
      paymentStatus: null,
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
  ageYears: null,
  genderId: 1,
  phoneNumber: '+56911111111',
  alternatePhoneNumber: null,
  paymentStatus: null,
  requiresPaymentStatus: false,
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

  it('updates a child using only an age when the category requires a representative', async () => {
    const repository = createRepository()

    await updateRegistration(repository, {
      ...baseInput,
      birthdate: null,
      ageYears: 8,
      representativeName: 'Ana Pérez',
      requiresRepresentative: true,
    })

    expect(repository.update).toHaveBeenCalledWith(expect.objectContaining({ birthdate: null, ageYears: 8 }))
  })

  it('rejects a missing payment status when the category requires one', async () => {
    const repository = createRepository()

    await expect(
      updateRegistration(repository, {
        ...baseInput,
        representativeName: null,
        requiresRepresentative: false,
        requiresPaymentStatus: true,
        paymentStatus: null,
      }),
    ).rejects.toThrow(ZodError)
    expect(repository.update).not.toHaveBeenCalled()
  })
})
