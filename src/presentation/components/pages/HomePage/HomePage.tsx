import styles from './HomePage.module.css'

export function HomePage() {
  return (
    <section className={styles.section}>
      <h1 className={styles.heading}>Bienvenido</h1>
      <p className={styles.text}>
        Aquí podrás gestionar eventos, inscribir niños y controlar la asistencia.
      </p>
    </section>
  )
}
