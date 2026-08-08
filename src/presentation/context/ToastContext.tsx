import { useCallback, useState, type ReactNode } from 'react'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { ToastContext, type ToastSeverity } from '@/presentation/hooks/useToast'

interface ToastState {
  message: string
  severity: ToastSeverity
}

interface Props {
  children: ReactNode
}

export function ToastProvider({ children }: Props) {
  const [toast, setToast] = useState<ToastState | null>(null)

  const showSuccess = useCallback((message: string) => setToast({ message, severity: 'success' }), [])
  const showError = useCallback((message: string) => setToast({ message, severity: 'error' }), [])

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}
      <Snackbar
        open={toast !== null}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert onClose={() => setToast(null)} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  )
}
