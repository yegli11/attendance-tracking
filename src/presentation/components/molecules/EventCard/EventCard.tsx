import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import type { Event } from '@/domain/entities/Event'
import type { Category } from '@/domain/entities/Category'
import { Icon } from '@/presentation/components/atoms/Icon'
import { formatEventDate } from '@/shared/utils/formatEventDate'
import { getEventStatus } from '@/shared/utils/getEventStatus'
import { getCategoryColor } from '@/shared/utils/categoryColor'

interface Props {
  event: Event
  category?: Category
  isActive: boolean
  onSelect: () => void
}

const STATUS_LABEL = { hoy: 'Hoy', proximo: 'Próximo', finalizado: 'Finalizado' } as const

export function EventCard({ event, category, isActive, onSelect }: Props) {
  const status = getEventStatus(event.eventDate)
  const color = getCategoryColor(category?.name ?? '')

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: '5px solid',
        borderLeftColor: color.main,
        borderColor: isActive ? 'primary.main' : 'divider',
        boxShadow: isActive ? 2 : 0,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
      }}
    >
      <Box sx={{ p: 2.25 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
          {category && (
            <Chip label={category.name} size="small" sx={{ bgcolor: color.bg, color: color.dark, fontWeight: 700 }} />
          )}

          {status === 'hoy' ? (
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
          ) : (
            <Chip
              size="small"
              label={STATUS_LABEL[status]}
              sx={
                status === 'proximo'
                  ? { bgcolor: '#EEF4FF', color: '#1E63D6', border: '1px solid #CFE0FF', fontWeight: 700 }
                  : { bgcolor: '#F1F3F7', color: 'text.secondary', fontWeight: 700 }
              }
            />
          )}
        </Stack>

        <Typography sx={{ fontWeight: 700, fontSize: '1.03125rem', mt: 1.25 }}>{event.name}</Typography>

        <Stack
          direction="row"
          spacing={0.75}
          sx={{ alignItems: 'center', color: 'text.secondary', fontSize: '0.8125rem', mt: 0.5 }}
        >
          <Icon name="calendar" size={13} />
          <span>{formatEventDate(event.eventDate)}</span>
        </Stack>

        <Button
          fullWidth
          variant={isActive ? 'contained' : 'outlined'}
          color={isActive ? 'success' : 'primary'}
          size="small"
          startIcon={isActive ? <Icon name="check" size={14} /> : undefined}
          onClick={onSelect}
          disabled={isActive}
          sx={{ mt: 2 }}
        >
          {isActive ? 'Evento activo' : 'Usar este evento'}
        </Button>
      </Box>
    </Card>
  )
}
