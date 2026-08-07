import { Navigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { AuthHero } from '@/presentation/components/organisms/AuthHero'
import { LoginForm } from '@/presentation/components/organisms/LoginForm'
import { useAuth } from '@/presentation/hooks/useAuth'

export function LoginPage() {
  const { status } = useAuth()

  if (status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  return (
    <Box sx={{ minHeight: '100svh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
      <AuthHero />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: { xs: 'flex-start', md: 'center' },
          bgcolor: 'background.paper',
          px: { xs: 3, md: 8 },
          py: { xs: 5, md: 8 },
          mt: { xs: '-24px', md: 0 },
          borderRadius: { xs: '20px 20px 0 0', md: 0 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Typography variant="h5" sx={{ color: 'text.primary', mb: 0.5 }}>
            Bienvenido de vuelta
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 4 }}>
            Inicia sesión para gestionar tus eventos.
          </Typography>
          <LoginForm />
        </Box>
      </Box>
    </Box>
  )
}
