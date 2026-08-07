export interface AuthUser {
  id: string
  email: string | null
}

export interface AuthRepository {
  getSession(): Promise<AuthUser | null>
  signInWithPassword(email: string, password: string): Promise<AuthUser>
  signOut(): Promise<void>
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void
}
