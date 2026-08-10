import { describe, expect, it, vi } from 'vitest'
import { ZodError } from 'zod'
import type { EventRepository } from '@/domain/repositories/EventRepository'
import { createEvent } from './createEvent'

function createRepository(): EventRepository {
  return {
    listEvents: vi.fn(),
    getEvent: vi.fn(),
    createEvent: vi.fn().mockResolvedValue({
      id: 1,
      name: 'Concentración de domingo',
      eventDate: '2026-08-09T15:00:00.000Z',
      categoryId: 3,
      location: null,
      createdAt: '2026-08-07T00:00:00.000Z',
      days: [{ id: 1, eventId: 1, dayNumber: 1, eventDate: '2026-08-09T15:00:00.000Z', createdAt: '2026-08-07T00:00:00.000Z' }],
    }),
  }
}

describe('createEvent', () => {
  it('calls the repository with the validated input', async () => {
    const repository = createRepository()

    const event = await createEvent(repository, {
      name: 'Concentración de domingo',
      eventDate: '2026-08-09T15:00:00.000Z',
      categoryId: 3,
      durationDays: 1,
    })

    expect(repository.createEvent).toHaveBeenCalledWith({
      name: 'Concentración de domingo',
      eventDate: '2026-08-09T15:00:00.000Z',
      categoryId: 3,
      durationDays: 1,
    })
    expect(event.id).toBe(1)
  })

  it('rejects an empty name before calling the repository', async () => {
    const repository = createRepository()

    await expect(
      createEvent(repository, {
        name: '  ',
        eventDate: '2026-08-09T15:00:00.000Z',
        categoryId: 3,
        durationDays: 1,
      }),
    ).rejects.toThrow(ZodError)
    expect(repository.createEvent).not.toHaveBeenCalled()
  })

  it('rejects a missing category before calling the repository', async () => {
    const repository = createRepository()

    await expect(
      createEvent(repository, {
        name: 'Concentración de domingo',
        eventDate: '2026-08-09T15:00:00.000Z',
        categoryId: 0,
        durationDays: 1,
      }),
    ).rejects.toThrow(ZodError)
    expect(repository.createEvent).not.toHaveBeenCalled()
  })

  it('rejects a duration over 14 days before calling the repository', async () => {
    const repository = createRepository()

    await expect(
      createEvent(repository, {
        name: 'Concentración de domingo',
        eventDate: '2026-08-09T15:00:00.000Z',
        categoryId: 3,
        durationDays: 15,
      }),
    ).rejects.toThrow(ZodError)
    expect(repository.createEvent).not.toHaveBeenCalled()
  })
})
