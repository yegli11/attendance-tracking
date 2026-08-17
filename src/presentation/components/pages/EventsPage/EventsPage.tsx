import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import type { CreateEventInput } from '@/domain/repositories/EventRepository'
import type { Event } from '@/domain/entities/Event'
import type { Category } from '@/domain/entities/Category'
import { listEvents } from '@/application/useCases/listEvents'
import { listCategories } from '@/application/useCases/listCategories'
import { createEvent } from '@/application/useCases/createEvent'
import { listAllRegistrationSummaries } from '@/application/useCases/listAllRegistrationSummaries'
import { supabaseEventRepository } from '@/infrastructure/supabase/repositories/SupabaseEventRepository'
import { supabaseCategoryRepository } from '@/infrastructure/supabase/repositories/SupabaseCategoryRepository'
import { supabaseRegistrationRepository } from '@/infrastructure/supabase/repositories/SupabaseRegistrationRepository'
import { Icon } from '@/presentation/components/atoms/Icon'
import { StatCard } from '@/presentation/components/molecules/StatCard'
import { EventList, type RegistrationCounts } from '@/presentation/components/organisms/EventList'
import { EventDetailDrawer } from '@/presentation/components/organisms/EventDetailDrawer'
import { Modal } from '@/presentation/components/organisms/Modal'
import { CreateEventForm } from '@/presentation/components/organisms/CreateEventForm'
import { getEventStatus } from '@/shared/utils/getEventStatus'

type Status = 'loading' | 'ready' | 'error'

export function EventsPage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [registrationCounts, setRegistrationCounts] = useState<Map<number, RegistrationCounts>>(new Map())
  const [status, setStatus] = useState<Status>('loading')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all')
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setStatus('loading')
      try {
        const [eventsResult, categoriesResult, summaries] = await Promise.all([
          listEvents(supabaseEventRepository),
          listCategories(supabaseCategoryRepository),
          listAllRegistrationSummaries(supabaseRegistrationRepository),
        ])
        if (cancelled) return
        const counts = new Map<number, RegistrationCounts>()
        for (const summary of summaries) {
          const current = counts.get(summary.eventId) ?? { registered: 0, attended: 0 }
          current.registered += 1
          if (summary.attendedAnyDay) current.attended += 1
          counts.set(summary.eventId, current)
        }
        setEvents(eventsResult)
        setCategories(categoriesResult)
        setRegistrationCounts(counts)
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleCreateEvent(input: CreateEventInput) {
    const created = await createEvent(supabaseEventRepository, input)
    setEvents((current) =>
      [...current, created].sort((a, b) => a.eventDate.localeCompare(b.eventDate)),
    )
    setIsModalOpen(false)
  }

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase()
    return events.filter((event) => {
      if (categoryFilter !== 'all' && event.categoryId !== categoryFilter) return false
      if (query && !event.name.toLowerCase().includes(query)) return false
      return true
    })
  }, [events, search, categoryFilter])

  const stats = useMemo(() => {
    const todayEvents = events.filter((event) => {
      const lastDay = event.days[event.days.length - 1]
      return getEventStatus(event.eventDate, lastDay?.eventDate ?? event.eventDate) === 'hoy'
    })
    return {
      total: events.length,
      hoy: todayEvents.length,
    }
  }, [events])

  const selectedEventCounts = selectedEvent
    ? (registrationCounts.get(selectedEvent.id) ?? { registered: 0, attended: 0 })
    : { registered: 0, attended: 0 }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'flex-start' }, justifyContent: 'space-between' }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
            Tus eventos
          </Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Selecciona un evento para inscribir asistentes o controlar el ingreso.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Icon name="plus" size={16} />}
          onClick={() => setIsModalOpen(true)}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Crear evento
        </Button>
      </Stack>

      {status === 'ready' && (
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard icon="calendar" label="Eventos totales" value={stats.total} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <StatCard icon="clock" label="Hoy" value={stats.hoy} />
          </Grid>
        </Grid>
      )}

      {status === 'ready' && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
          <TextField
            placeholder="Buscar evento..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
            fullWidth
            sx={{ maxWidth: { sm: 320 } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon name="search" size={16} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Chip
              label="Todos"
              size="small"
              onClick={() => setCategoryFilter('all')}
              sx={
                categoryFilter === 'all'
                  ? { bgcolor: 'text.primary', color: 'common.white', fontWeight: 700 }
                  : { fontWeight: 700 }
              }
              variant={categoryFilter === 'all' ? 'filled' : 'outlined'}
            />
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                size="small"
                onClick={() => setCategoryFilter(category.id)}
                sx={
                  categoryFilter === category.id
                    ? { bgcolor: 'text.primary', color: 'common.white', fontWeight: 700 }
                    : { fontWeight: 700 }
                }
                variant={categoryFilter === category.id ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>
        </Stack>
      )}

      {status === 'loading' && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {status === 'error' && (
        <Alert severity="error">No se pudieron cargar los eventos. Intenta de nuevo.</Alert>
      )}
      {status === 'ready' && (
        <EventList
          events={filteredEvents}
          hasAnyEvents={events.length > 0}
          categories={categories}
          registrationCounts={registrationCounts}
          onSelectEvent={setSelectedEvent}
        />
      )}

      <EventDetailDrawer
        event={selectedEvent}
        category={categories.find((category) => category.id === selectedEvent?.categoryId)}
        registered={selectedEventCounts.registered}
        attended={selectedEventCounts.attended}
        onClose={() => setSelectedEvent(null)}
        onEnterEvent={() => selectedEvent && navigate(`/events/${selectedEvent.id}`)}
      />

      {isModalOpen && (
        <Modal title="Crear evento" onClose={() => setIsModalOpen(false)}>
          <CreateEventForm
            categories={categories}
            onSubmit={handleCreateEvent}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </Stack>
  )
}
