import type { User } from '@supabase/supabase-js'
import type { AuthRepository, AuthUser } from '@/domain/repositories/AuthRepository'
import { supabase } from '@/infrastructure/supabase/client'

function toAuthUser(user: User | null | undefined): AuthUser | null {
  if (!user) return null
  return { id: user.id, email: user.email ?? null }
}

export const supabaseAuthRepository: AuthRepository = {
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return toAuthUser(data.session?.user)
  },

  async signInWithPassword(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const user = toAuthUser(data.user)
    if (!user) throw new Error('No se pudo iniciar sesión.')
    return user
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  onAuthStateChange(callback) {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(toAuthUser(session?.user))
    })
    return () => subscription.unsubscribe()
  },
}
