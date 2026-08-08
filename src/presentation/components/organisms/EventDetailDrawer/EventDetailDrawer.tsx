import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Grid from '@mui/material/Grid'
import type { Event } from '@/domain/entities/Event'
import type { Category } from '@/domain/entities/Category'
import { Icon } from '@/presentation/components/atoms/Icon'
import { EventStatusBadge } from '@/presentation/components/molecules/EventStatusBadge'
import { formatEventDate } from '@/shared/utils/formatEventDate'
import { getEventStatus } from '@/shared/utils/getEventStatus'
import { getCategoryColor } from '@/shared/utils/categoryColor'

interface Props {
  event: Event | null
  category?: Category
  registered: number
  attended: number
  onClose: () => void
  onEnterEvent: () => void
}

export function EventDetailDrawer({ event, category, registered, attended, onClose, onEnterEvent }: Props) {
  const color = getCategoryColor(category?.name ?? '')

  return (
    <Drawer
      anchor="right"
      open={event !== null}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 420 }, p: 3 } } }}
    >
      {event && (
        <Stack spacing={2.5}>
          <IconButton onClick={onClose} sx={{ alignSelf: 'flex-start', bgcolor: 'background.default' }} size="small">
            <Icon name="close" size={16} />
          </IconButton>

          <Stack direction="row" spacing={1}>
            {category && (
              <Chip
                label={category.name}
                size="small"
                sx={{ bgcolor: color.bg, color: color.dark, fontWeight: 700 }}
              />
            )}
            <EventStatusBadge status={getEventStatus(event.eventDate)} />
          </Stack>

          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {event.name}
          </Typography>

          <Stack spacing={1}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', color: 'text.secondary', fontSize: '0.875rem' }}
            >
              <Icon name="calendar" size={15} />
              <span>{formatEventDate(event.eventDate)}</span>
            </Stack>
            {event.location && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', color: 'text.secondary', fontSize: '0.875rem' }}
              >
                <Icon name="mapPin" size={15} />
                <span>{event.location}</span>
              </Stack>
            )}
          </Stack>

          <Grid container spacing={1.5}>
            <Grid size={6}>
              <Box sx={{ bgcolor: 'background.default', borderRadius: 1.5, p: 1.75 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem' }}>{registered}</Typography>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'text.secondary' }}>
                  Inscritos
                </Typography>
              </Box>
            </Grid>
            <Grid size={6}>
              <Box sx={{ bgcolor: 'background.default', borderRadius: 1.5, p: 1.75 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem' }}>{attended}</Typography>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: 'text.secondary' }}>
                  Asistieron
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Stack spacing={1.25}>
            <Button variant="contained" fullWidth onClick={onEnterEvent}>
              Entrar al evento
            </Button>
            <Button variant="outlined" color="inherit" fullWidth onClick={onEnterEvent}>
              Ver lista de inscritos
            </Button>
          </Stack>
        </Stack>
      )}
    </Drawer>
  )
}
