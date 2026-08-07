import type { ReactNode } from 'react'
import { Header } from '@/presentation/components/organisms/Header'
import styles from './PageLayout.module.css'

interface Props {
  children: ReactNode
}

export function PageLayout({ children }: Props) {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.content}>{children}</main>
    </div>
  )
}
