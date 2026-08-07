import { useState, type ReactNode } from 'react'
import type { Event } from '@/domain/entities/Event'
import { ActiveEventContext } from '@/presentation/hooks/useActiveEvent'

const STORAGE_KEY = 'attendance-tracking:active-event'

function readStoredEvent(): Event | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Event) : null
  } catch {
    return null
  }
}

interface Props {
  children: ReactNode
}

export function ActiveEventProvider({ children }: Props) {
  const [activeEvent, setActiveEventState] = useState<Event | null>(readStoredEvent)

  function setActiveEvent(event: Event | null) {
    setActiveEventState(event)
    if (event) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(event))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return (
    <ActiveEventContext.Provider value={{ activeEvent, setActiveEvent }}>
      {children}
    </ActiveEventContext.Provider>
  )
}
