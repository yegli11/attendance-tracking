import { createContext, useContext } from 'react'
import type { AuthUser } from '@/domain/repositories/AuthRepository'
import type { SignInCredentials } from '@/application/useCases/signIn'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  signIn: (credentials: SignInCredentials) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
