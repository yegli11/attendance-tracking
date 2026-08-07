import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <img src="/favicon.svg" alt="" className={styles.logo} width={32} height={32} />
        <div>
          <p className={styles.title}>Concentración Infantil</p>
          <p className={styles.subtitle}>Inscripción y control de asistencia</p>
        </div>
      </div>
    </header>
  )
}
