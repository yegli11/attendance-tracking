import { describe, expect, it, vi } from 'vitest'
import { ZodError } from 'zod'
import type { AuthRepository } from '@/domain/repositories/AuthRepository'
import { signIn } from './signIn'

function createRepository(): AuthRepository {
  return {
    getSession: vi.fn(),
    signInWithPassword: vi.fn().mockResolvedValue({ id: 'user-1', email: 'staff@example.com' }),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  }
}

describe('signIn', () => {
  it('calls the repository with the validated credentials', async () => {
    const repository = createRepository()

    const user = await signIn(repository, { email: 'staff@example.com', password: 'secret123' })

    expect(repository.signInWithPassword).toHaveBeenCalledWith('staff@example.com', 'secret123')
    expect(user).toEqual({ id: 'user-1', email: 'staff@example.com' })
  })

  it('rejects an invalid email before calling the repository', async () => {
    const repository = createRepository()

    await expect(signIn(repository, { email: 'not-an-email', password: 'secret123' })).rejects.toThrow(
      ZodError,
    )
    expect(repository.signInWithPassword).not.toHaveBeenCalled()
  })

  it('rejects a password shorter than 6 characters', async () => {
    const repository = createRepository()

    await expect(signIn(repository, { email: 'staff@example.com', password: '123' })).rejects.toThrow(
      ZodError,
    )
    expect(repository.signInWithPassword).not.toHaveBeenCalled()
  })
})
