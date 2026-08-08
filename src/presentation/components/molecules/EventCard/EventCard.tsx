import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import type { Event } from '@/domain/entities/Event'
import type { Category } from '@/domain/entities/Category'
import { Icon } from '@/presentation/components/atoms/Icon'
import { EventStatusBadge } from '@/presentation/components/molecules/EventStatusBadge'
import { formatEventDate } from '@/shared/utils/formatEventDate'
import { getEventStatus } from '@/shared/utils/getEventStatus'
import { getCategoryColor } from '@/shared/utils/categoryColor'

interface Props {
  event: Event
  category?: Category
  registered: number
  attended: number
  onClick: () => void
}

export function EventCard({ event, category, registered, attended, onClick }: Props) {
  const status = getEventStatus(event.eventDate)
  const color = getCategoryColor(category?.name ?? '')

  return (
    <Card
      variant="outlined"
      sx={{
        borderLeft: '5px solid',
        borderLeftColor: color.main,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
          {category && (
            <Chip label={category.name} size="small" sx={{ bgcolor: color.bg, color: color.dark, fontWeight: 700 }} />
          )}
          <EventStatusBadge status={status} />
        </Stack>

        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '1.0625rem',
            lineHeight: 1.35,
            mt: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.name}
        </Typography>

        <Stack
          direction="row"
          spacing={0.75}
          sx={{ alignItems: 'center', color: 'text.secondary', fontSize: '0.8125rem', mt: 0.75 }}
        >
          <Icon name="calendar" size={14} />
          <span>{formatEventDate(event.eventDate)}</span>
        </Stack>
        {event.location && (
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: 'center', color: 'text.secondary', fontSize: '0.8125rem', mt: 0.5 }}
          >
            <Icon name="mapPin" size={14} />
            <span>{event.location}</span>
          </Stack>
        )}

        <Divider sx={{ mt: 2.25, mb: 2 }} />

        <Stack direction="row" spacing={4} sx={{ alignItems: 'center', flexWrap: 'nowrap' }}>
          <Box sx={{ flexShrink: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.375rem', lineHeight: 1.2 }}>{registered}</Typography>
            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
              Inscritos
            </Typography>
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.375rem', lineHeight: 1.2 }}>{attended}</Typography>
            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
              Asistieron
            </Typography>
          </Box>
        </Stack>
      </CardActionArea>
    </Card>
  )
}
