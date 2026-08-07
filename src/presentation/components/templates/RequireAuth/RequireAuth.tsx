import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/presentation/hooks/useAuth'
import styles from './RequireAuth.module.css'

interface Props {
  children: ReactNode
}

export function RequireAuth({ children }: Props) {
  const { status } = useAuth()

  if (status === 'loading') {
    return <div className={styles.loading}>Cargando…</div>
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
