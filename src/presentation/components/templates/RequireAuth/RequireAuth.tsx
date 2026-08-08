import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useAuth } from '@/presentation/hooks/useAuth'

interface Props {
  children: ReactNode
}

export function RequireAuth({ children }: Props) {
  const { status } = useAuth()

  if (status === 'loading') {
    return (
      <Box sx={{ minHeight: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
