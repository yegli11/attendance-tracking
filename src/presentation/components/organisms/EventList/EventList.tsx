import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { Event } from '@/domain/entities/Event'
import type { Category } from '@/domain/entities/Category'
import { EventCard } from '@/presentation/components/molecules/EventCard'

interface Props {
  events: Event[]
  hasAnyEvents: boolean
  categories: Category[]
  activeEventId: number | null
  onSelectEvent: (event: Event) => void
}

export function EventList({ events, hasAnyEvents, categories, activeEventId, onSelectEvent }: Props) {
  if (events.length === 0) {
    return (
      <Box
        sx={{
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          p: { xs: 5, md: 8 },
          textAlign: 'center',
          color: 'text.secondary',
        }}
      >
        {hasAnyEvents ? (
          <Typography>No hay eventos que coincidan con tu búsqueda o filtro.</Typography>
        ) : (
          <>
            <Typography>Todavía no hay eventos creados.</Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Usa "Crear evento" para agregar el primero.
            </Typography>
          </>
        )}
      </Box>
    )
  }

  return (
    <Grid container spacing={2.5}>
      {events.map((event) => (
        <Grid key={event.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <EventCard
            event={event}
            category={categories.find((category) => category.id === event.categoryId)}
            isActive={event.id === activeEventId}
            onSelect={() => onSelectEvent(event)}
          />
        </Grid>
      ))}
    </Grid>
  )
}
