import { useEffect, useState, type ReactNode } from 'react'
import type { AuthUser } from '@/domain/repositories/AuthRepository'
import { signIn } from '@/application/useCases/signIn'
import { signOut } from '@/application/useCases/signOut'
import { supabaseAuthRepository } from '@/infrastructure/supabase/repositories/SupabaseAuthRepository'
import { AuthContext, type AuthContextValue, type AuthStatus } from '@/presentation/hooks/useAuth'

interface Props {
  children: ReactNode
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    supabaseAuthRepository.getSession().then((session) => {
      setUser(session)
      setStatus(session ? 'authenticated' : 'unauthenticated')
    })

    return supabaseAuthRepository.onAuthStateChange((nextUser) => {
      setUser(nextUser)
      setStatus(nextUser ? 'authenticated' : 'unauthenticated')
    })
  }, [])

  const value: AuthContextValue = {
    user,
    status,
    signIn: async (credentials) => {
      await signIn(supabaseAuthRepository, credentials)
    },
    signOut: async () => {
      await signOut(supabaseAuthRepository)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
