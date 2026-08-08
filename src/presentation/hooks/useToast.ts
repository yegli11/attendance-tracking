import { createContext, useContext } from 'react'

export type ToastSeverity = 'success' | 'error'

export interface ToastContextValue {
  showSuccess: (message: string) => void
  showError: (message: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
