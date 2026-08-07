import { z } from 'zod'
import type { AuthRepository, AuthUser } from '@/domain/repositories/AuthRepository'

const credentialsSchema = z.object({
  email: z.string().trim().min(1, 'Ingresa tu correo.').email('Ingresa un correo válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
})

export type SignInCredentials = z.infer<typeof credentialsSchema>

export async function signIn(
  repository: AuthRepository,
  credentials: SignInCredentials,
): Promise<AuthUser> {
  const { email, password } = credentialsSchema.parse(credentials)
  return repository.signInWithPassword(email, password)
}
