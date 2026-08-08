import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { Header } from '@/presentation/components/organisms/Header'

interface Props {
  children: ReactNode
}

export function PageLayout({ children }: Props) {
  return (
    <Box sx={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container component="main" maxWidth="md" sx={{ flex: 1, py: { xs: 4, md: 5 } }}>
        {children}
      </Container>
    </Box>
  )
}
