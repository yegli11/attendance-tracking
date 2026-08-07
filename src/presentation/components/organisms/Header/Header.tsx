import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useAuth } from '@/presentation/hooks/useAuth'
import { Icon } from '@/presentation/components/atoms/Icon'

function getInitials(email: string | null): string {
  if (!email) return '?'
  return email.split('@')[0]!.slice(0, 2).toUpperCase()
}

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ background: 'linear-gradient(120deg, #071B33 0%, #123A73 100%)' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', gap: 1.5, py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              flexShrink: 0,
              borderRadius: '10px',
              bgcolor: 'rgba(255,255,255,0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="calendar" size={18} />
          </Box>
          <Typography noWrap sx={{ fontWeight: 800, fontSize: '15.5px' }}>
            Portal de Eventos
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexShrink: 0 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: '12.5px', fontWeight: 700 }}>
            {getInitials(user?.email ?? null)}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.2, maxWidth: 200 }}>
              {user?.email}
            </Typography>
            <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>Staff</Typography>
          </Box>
          <Tooltip title="Cerrar sesión">
            <IconButton onClick={() => void signOut()} sx={{ color: 'common.white' }} size="small">
              <Icon name="logout" size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
