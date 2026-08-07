import { createContext, useContext } from 'react'
import type { Event } from '@/domain/entities/Event'

export interface ActiveEventContextValue {
  activeEvent: Event | null
  setActiveEvent: (event: Event | null) => void
}

export const ActiveEventContext = createContext<ActiveEventContextValue | null>(null)

export function useActiveEvent() {
  const context = useContext(ActiveEventContext)
  if (!context) {
    throw new Error('useActiveEvent must be used within an ActiveEventProvider')
  }
  return context
}
