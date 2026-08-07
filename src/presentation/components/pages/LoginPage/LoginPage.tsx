import { Navigate } from 'react-router-dom'
import { AuthHero } from '@/presentation/components/organisms/AuthHero'
import { LoginForm } from '@/presentation/components/organisms/LoginForm'
import { useAuth } from '@/presentation/hooks/useAuth'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const { status } = useAuth()

  if (status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  return (
    <div className={styles.container}>
      <AuthHero />
      <div className={styles.panel}>
        <div className={styles.card}>
          <h2 className={styles.heading}>Bienvenido de vuelta</h2>
          <p className={styles.subtitle}>Inicia sesión para gestionar tus eventos.</p>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
