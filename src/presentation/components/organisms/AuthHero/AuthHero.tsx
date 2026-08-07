import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import { Icon, type IconName } from '@/presentation/components/atoms/Icon'

const CATEGORIES: Array<{ label: string; icon: IconName }> = [
  { label: 'Niños', icon: 'user' },
  { label: 'Jóvenes', icon: 'flame' },
  { label: 'Adultos', icon: 'users' },
  { label: 'Otros eventos', icon: 'calendar' },
]

export function AuthHero() {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #060773 0%, #0a0d99 55%, #141ecf 100%)',
        color: 'common.white',
        px: { xs: 3, md: 8 },
        py: { xs: 5, md: 8 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 4,
        flex: { md: 1 },
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -90,
          right: -70,
          width: 260,
          height: 260,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.08)',
        }}
      />

      <Stack spacing={2.5} sx={{ position: 'relative' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="calendar" size={20} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>Portal de Eventos</Typography>
        </Stack>

        <Typography variant="h3" sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, lineHeight: 1.25 }}>
          Inscripciones y asistencia para todos los eventos de tu iglesia
        </Typography>

        <Typography sx={{ color: 'rgba(255,255,255,0.85)', maxWidth: '46ch', fontSize: '0.9375rem' }}>
          Un solo lugar para gestionar niños, jóvenes, adultos y cualquier actividad — con
          códigos de entrada y control en tiempo real.
        </Typography>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {CATEGORIES.map((category) => (
            <Chip
              key={category.label}
              icon={<Icon name={category.icon} size={14} />}
              label={category.label}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.12)',
                color: 'common.white',
                '& .MuiChip-icon': { color: 'common.white', ml: '8px' },
              }}
            />
          ))}
        </Stack>
      </Stack>

      <Typography
        variant="caption"
        sx={{ position: 'relative', color: 'rgba(255,255,255,0.6)', display: { xs: 'none', md: 'block' } }}
      >
        © Portal de Eventos — uso interno para equipos de ministerio
      </Typography>
    </Box>
  )
}
