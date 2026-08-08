import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import type { Event } from '@/domain/entities/Event'
import type { Category } from '@/domain/entities/Category'
import type { Gender } from '@/domain/entities/Gender'
import type { RosterEntry } from '@/domain/entities/RosterEntry'
import { getEvent } from '@/application/useCases/getEvent'
import { listCategories } from '@/application/useCases/listCategories'
import { listRegistrationsForEvent } from '@/application/useCases/listRegistrationsForEvent'
import { listGenders } from '@/application/useCases/listGenders'
import { supabaseEventRepository } from '@/infrastructure/supabase/repositories/SupabaseEventRepository'
import { supabaseCategoryRepository } from '@/infrastructure/supabase/repositories/SupabaseCategoryRepository'
import { supabaseRegistrationRepository } from '@/infrastructure/supabase/repositories/SupabaseRegistrationRepository'
import { supabaseGenderRepository } from '@/infrastructure/supabase/repositories/SupabaseGenderRepository'
import { Icon } from '@/presentation/components/atoms/Icon'
import { StatCard } from '@/presentation/components/molecules/StatCard'
import { AttendanceRing } from '@/presentation/components/molecules/AttendanceRing'
import { RosterTab } from '@/presentation/components/organisms/RosterTab'
import { RegisterTab } from '@/presentation/components/organisms/RegisterTab'
import { AttendanceTab } from '@/presentation/components/organisms/AttendanceTab'
import { formatEventDate } from '@/shared/utils/formatEventDate'
import { getCategoryColor } from '@/shared/utils/categoryColor'
import { categoryRequiresRepresentative } from '@/shared/utils/categoryRequiresRepresentative'

type Status = 'loading' | 'ready' | 'error' | 'not-found'
type TabKey = 'lista' | 'inscribir' | 'asistencia'

export function EventWorkspacePage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const id = Number(eventId)

  const [event, setEvent] = useState<Event | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [roster, setRoster] = useState<RosterEntry[]>([])
  const [genders, setGenders] = useState<Gender[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [tab, setTab] = useState<TabKey>('lista')

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setStatus('loading')
      if (!Number.isFinite(id)) {
        setStatus('not-found')
        return
      }
      try {
        const [eventResult, categoriesResult, rosterResult, gendersResult] = await Promise.all([
          getEvent(supabaseEventRepository, id),
          listCategories(supabaseCategoryRepository),
          listRegistrationsForEvent(supabaseRegistrationRepository, id),
          listGenders(supabaseGenderRepository),
        ])
        if (cancelled) return
        if (!eventResult) {
          setStatus('not-found')
          return
        }
        setEvent(eventResult)
        setCategories(categoriesResult)
        setRoster(rosterResult)
        setGenders(gendersResult)
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [id])

  const category = categories.find((item) => item.id === event?.categoryId)
  const requiresRepresentative = category ? categoryRequiresRepresentative(category.name) : false

  const stats = useMemo(() => {
    const registered = roster.length
    const attended = roster.filter((entry) => entry.attended).length
    return {
      registered,
      attended,
      pending: registered - attended,
      percentage: registered ? Math.round((attended / registered) * 100) : 0,
    }
  }, [roster])

  function handleRegistered(entry: RosterEntry) {
    setRoster((current) => [entry, ...current])
  }

  function handleRosterEntryChange(entry: RosterEntry) {
    setRoster((current) =>
      current.map((item) => (item.registrationId === entry.registrationId ? entry : item)),
    )
  }

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (status === 'not-found' || status === 'error') {
    return (
      <Stack spacing={2}>
        <Button
          startIcon={<Icon name="arrowLeft" size={15} />}
          onClick={() => navigate('/')}
          sx={{ alignSelf: 'flex-start' }}
        >
          Volver a mis eventos
        </Button>
        <Alert severity="error">
          {status === 'not-found' ? 'No se encontró el evento.' : 'No se pudo cargar el evento. Intenta de nuevo.'}
        </Alert>
      </Stack>
    )
  }

  if (!event) return null

  const color = getCategoryColor(category?.name ?? '')

  return (
    <Stack spacing={3}>
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<Icon name="arrowLeft" size={15} />}
        onClick={() => navigate('/')}
        sx={{ alignSelf: 'flex-start' }}
      >
        Volver a mis eventos
      </Button>

      <Box>
        {category && (
          <Chip
            label={category.name}
            size="small"
            sx={{ bgcolor: color.bg, color: color.dark, fontWeight: 700, mb: 1 }}
          />
        )}
        <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', md: '2rem' } }}>
          {event.name}
        </Typography>
        <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>
          {formatEventDate(event.eventDate)}
          {event.location ? ` · ${event.location}` : ''}
        </Typography>
      </Box>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard icon="users" label="Inscritos" value={stats.registered} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard icon="check" label="Asistieron" value={stats.attended} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard icon="clock" label="Faltan" value={stats.pending} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 2,
              height: '100%',
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
            }}
          >
            <AttendanceRing percentage={stats.percentage} size={42} />
            <Box>
              <Typography
                sx={{ fontSize: '11px', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}
              >
                Asistencia
              </Typography>
              <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>en tiempo real</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Tabs
        value={tab}
        onChange={(_, value: TabKey) => setTab(value)}
        variant="scrollable"
        allowScrollButtonsMobile
      >
        <Tab value="lista" label="Lista de inscritos" />
        <Tab value="inscribir" label="Inscribir" />
        <Tab value="asistencia" label="Control de asistencia" />
      </Tabs>

      {tab === 'lista' && (
        <RosterTab
          roster={roster}
          genders={genders}
          requiresRepresentative={requiresRepresentative}
          onUpdated={handleRosterEntryChange}
        />
      )}
      {tab === 'inscribir' && (
        <RegisterTab
          eventId={event.id}
          genders={genders}
          requiresRepresentative={requiresRepresentative}
          onRegistered={handleRegistered}
        />
      )}
      {tab === 'asistencia' && (
        <AttendanceTab eventId={event.id} roster={roster} onAttendanceChange={handleRosterEntryChange} />
      )}
    </Stack>
  )
}
