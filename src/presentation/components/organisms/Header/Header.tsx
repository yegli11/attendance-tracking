import { useAuth } from '@/presentation/hooks/useAuth'
import styles from './Header.module.css'

export function Header() {
  const { signOut } = useAuth()

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <img src="/favicon.svg" alt="" className={styles.logo} width={32} height={32} />
        <div className={styles.titles}>
          <p className={styles.title}>Concentración Infantil</p>
          <p className={styles.subtitle}>Inscripción y control de asistencia</p>
        </div>
        <button type="button" className={styles.signOut} onClick={() => void signOut()}>
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
