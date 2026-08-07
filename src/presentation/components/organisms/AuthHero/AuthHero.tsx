import { Icon, type IconName } from '@/presentation/components/atoms/Icon'
import styles from './AuthHero.module.css'

const CATEGORIES: Array<{ label: string; icon: IconName }> = [
  { label: 'Niños', icon: 'user' },
  { label: 'Jóvenes', icon: 'flame' },
  { label: 'Adultos', icon: 'users' },
  { label: 'Otros eventos', icon: 'calendar' },
]

export function AuthHero() {
  return (
    <div className={styles.hero}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.badge}>
          <span className={styles.badgeIcon}>
            <Icon name="calendar" size={20} />
          </span>
          <span className={styles.badgeText}>Portal de Eventos</span>
        </div>
        <h1 className={styles.headline}>
          Inscripciones y asistencia para todos los eventos de tu iglesia
        </h1>
        <p className={styles.description}>
          Un solo lugar para gestionar niños, jóvenes, adultos y cualquier actividad — con
          códigos de entrada y control en tiempo real.
        </p>
        <ul className={styles.pills}>
          {CATEGORIES.map((category) => (
            <li key={category.label} className={styles.pill}>
              <Icon name={category.icon} size={14} />
              {category.label}
            </li>
          ))}
        </ul>
      </div>
      <p className={styles.copyright}>© Portal de Eventos — uso interno para equipos de ministerio</p>
    </div>
  )
}
