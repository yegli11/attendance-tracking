import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import type { EventStatus } from '@/shared/utils/getEventStatus'

const STATUS_LABEL: Record<EventStatus, string> = { hoy: 'Hoy', proximo: 'Próximo', finalizado: 'Finalizado' }

interface Props {
  status: EventStatus
}

export function EventStatusBadge({ status }: Props) {
  if (status === 'hoy') {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          flexShrink: 0,
          fontSize: '10.5px',
          fontWeight: 700,
          color: 'common.white',
          background: 'linear-gradient(135deg, #1E63D6, #123A73)',
          borderRadius: 999,
          px: 1.25,
          py: 0.5,
        }}
      >
        <Box
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: 'common.white',
            animation: 'pulse 1.4s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1, transform: 'scale(1)' },
              '50%': { opacity: 0.4, transform: 'scale(0.7)' },
            },
          }}
        />
        Hoy
      </Box>
    )
  }

  return (
    <Chip
      size="small"
      label={STATUS_LABEL[status]}
      sx={
        status === 'proximo'
          ? { bgcolor: '#EEF4FF', color: '#1E63D6', border: '1px solid #CFE0FF', fontWeight: 700 }
          : { bgcolor: '#F1F3F7', color: 'text.secondary', fontWeight: 700 }
      }
    />
  )
}
