import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useAuth } from '@/presentation/hooks/useAuth'
import { Icon } from '@/presentation/components/atoms/Icon'

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'primary.main' }}>
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
            Control de Asistencia
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexShrink: 0, minWidth: 0 }}>
          <Avatar
            src="/logo.svg"
            alt="Logo"
            sx={{ width: 32, height: 32, border: '1px solid rgba(255,255,255,0.25)' }}
          />
          <Box sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 0 }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.2 }}>{user?.email}</Typography>
            <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>Administrador</Typography>
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
