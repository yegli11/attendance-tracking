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
import type { TeamLeader } from '@/domain/entities/TeamLeader'
import { getEvent } from '@/application/useCases/getEvent'
import { listCategories } from '@/application/useCases/listCategories'
import { listRegistrationsForEvent } from '@/application/useCases/listRegistrationsForEvent'
import { listGenders } from '@/application/useCases/listGenders'
import { listTeamLeaders } from '@/application/useCases/listTeamLeaders'
import { supabaseEventRepository } from '@/infrastructure/supabase/repositories/SupabaseEventRepository'
import { supabaseCategoryRepository } from '@/infrastructure/supabase/repositories/SupabaseCategoryRepository'
import { supabaseRegistrationRepository } from '@/infrastructure/supabase/repositories/SupabaseRegistrationRepository'
import { supabaseGenderRepository } from '@/infrastructure/supabase/repositories/SupabaseGenderRepository'
import { supabaseTeamLeaderRepository } from '@/infrastructure/supabase/repositories/SupabaseTeamLeaderRepository'
import { Icon } from '@/presentation/components/atoms/Icon'
import { StatCard } from '@/presentation/components/molecules/StatCard'
import { RosterTab } from '@/presentation/components/organisms/RosterTab'
import { RegisterTab } from '@/presentation/components/organisms/RegisterTab'
import { AttendanceTab } from '@/presentation/components/organisms/AttendanceTab'
import { LeadersTab } from '@/presentation/components/organisms/LeadersTab'
import { formatEventDateRange, formatEventDayLabel } from '@/shared/utils/formatEventDate'
import { getCategoryColor } from '@/shared/utils/categoryColor'
import { categoryRequiresRepresentative } from '@/shared/utils/categoryRequiresRepresentative'
import { categoryRequiresPaymentStatus } from '@/shared/utils/categoryRequiresPaymentStatus'
import { exportAttendanceExcel } from '@/shared/utils/exportAttendanceExcel'
import { useToast } from '@/presentation/hooks/useToast'

type Status = 'loading' | 'ready' | 'error' | 'not-found'
type TabKey = 'lista' | 'inscribir' | 'asistencia' | 'lideres'
type AttendanceFilter = 'all' | 'attended' | 'missing' | 'total'

export function EventWorkspacePage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { showError } = useToast()
  const id = Number(eventId)

  const [event, setEvent] = useState<Event | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [roster, setRoster] = useState<RosterEntry[]>([])
  const [genders, setGenders] = useState<Gender[]>([])
  const [leaders, setLeaders] = useState<TeamLeader[]>([])
  const [status, setStatus] = useState<Status>('loading')
  const [tab, setTab] = useState<TabKey>('lista')
  const [isExporting, setIsExporting] = useState(false)
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null)
  const [retryToken, setRetryToken] = useState(0)
  const [attendanceFilter, setAttendanceFilter] = useState<AttendanceFilter>('all')

  function handleFilterCardClick(filter: AttendanceFilter) {
    setAttendanceFilter(filter)
    setTab('lista')
  }

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setStatus('loading')
      if (!Number.isFinite(id)) {
        setStatus('not-found')
        return
      }
      try {
        const [eventResult, categoriesResult, rosterResult, gendersResult, leadersResult] = await Promise.all([
          getEvent(supabaseEventRepository, id),
          listCategories(supabaseCategoryRepository),
          listRegistrationsForEvent(supabaseRegistrationRepository, id),
          listGenders(supabaseGenderRepository),
          listTeamLeaders(supabaseTeamLeaderRepository, id),
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
        setLeaders(leadersResult)
        const today = new Date().toDateString()
        const todayDay = eventResult.days.find((day) => new Date(day.eventDate).toDateString() === today)
        setSelectedDayId((todayDay ?? eventResult.days[0])?.id ?? null)
        setStatus('ready')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [id, retryToken])

  const category = categories.find((item) => item.id === event?.categoryId)
  const requiresRepresentative = category ? categoryRequiresRepresentative(category.name) : false
  const requiresPaymentStatus = category ? categoryRequiresPaymentStatus(category.name) : false

  const stats = useMemo(() => {
    const registered = roster.length
    const attended = roster.filter((entry) =>
      entry.attendance.some((day) => day.eventDayId === selectedDayId && day.attendedAt !== null),
    ).length
    const attendedLeaders = leaders.filter((leader) =>
      leader.attendance.some((day) => day.dayId === selectedDayId && day.attendedAt !== null),
    ).length
    return {
      registered,
      attended,
      pending: registered - attended,
      totalAttendance: attended + attendedLeaders,
    }
  }, [roster, leaders, selectedDayId])

  function handleRegistered(entry: RosterEntry) {
    setRoster((current) => [entry, ...current])
  }

  function handleRosterEntryChange(entry: RosterEntry) {
    setRoster((current) =>
      current.map((item) => (item.registrationId === entry.registrationId ? entry : item)),
    )
  }

  function handleRosterEntryDeleted(registrationId: number) {
    setRoster((current) => current.filter((item) => item.registrationId !== registrationId))
  }

  const hasAnyAttendance = roster.some((entry) => entry.attendance.some((day) => day.attendedAt !== null))

  async function handleExportAttendance() {
    if (!event) return
    setIsExporting(true)
    try {
      await exportAttendanceExcel(event, roster, requiresRepresentative, requiresPaymentStatus)
    } catch {
      showError('No se pudo generar el Excel de asistencia.')
    } finally {
      setIsExporting(false)
    }
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
        <Alert
          severity="error"
          action={
            status === 'error' ? (
              <Button color="inherit" size="small" onClick={() => setRetryToken((token) => token + 1)}>
                Reintentar
              </Button>
            ) : undefined
          }
        >
          {status === 'not-found'
            ? 'No se encontró el evento.'
            : 'No se pudo cargar el evento. Revisa tu conexión e intenta de nuevo.'}
        </Alert>
      </Stack>
    )
  }

  if (!event) return null

  const color = getCategoryColor(category?.name ?? '')

  return (
    <Stack spacing={3}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<Icon name="arrowLeft" size={15} />}
          onClick={() => navigate('/')}
        >
          Volver a mis eventos
        </Button>
        <Button
          variant="outlined"
          startIcon={<Icon name="download" size={15} />}
          onClick={handleExportAttendance}
          disabled={isExporting || !hasAnyAttendance}
        >
          {isExporting ? 'Generando…' : 'Descargar asistencia (Excel)'}
        </Button>
      </Stack>

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
          {formatEventDateRange(event.days)}
          {event.location ? ` · ${event.location}` : ''}
        </Typography>
      </Box>

      {event.days.length > 1 && (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {event.days.map((day) => (
            <Chip
              key={day.id}
              label={formatEventDayLabel(day)}
              onClick={() => setSelectedDayId(day.id)}
              sx={
                selectedDayId === day.id
                  ? { bgcolor: 'text.primary', color: 'common.white', fontWeight: 700 }
                  : { fontWeight: 700 }
              }
              variant={selectedDayId === day.id ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>
      )}

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon="users"
            label="Inscritos"
            value={stats.registered}
            active={attendanceFilter === 'all'}
            onClick={() => handleFilterCardClick('all')}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon="check"
            label="Asistieron"
            value={stats.attended}
            active={attendanceFilter === 'attended'}
            onClick={() => handleFilterCardClick('attended')}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon="clock"
            label="Faltan"
            value={stats.pending}
            active={attendanceFilter === 'missing'}
            onClick={() => handleFilterCardClick('missing')}
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            icon="flame"
            label="Asistencia total"
            value={stats.totalAttendance}
            active={attendanceFilter === 'total'}
            onClick={() => handleFilterCardClick('total')}
          />
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
        <Tab value="lideres" label="Líderes" />
      </Tabs>

      {tab === 'lista' && selectedDayId !== null && (
        <RosterTab
          roster={roster}
          days={event.days}
          selectedDayId={selectedDayId}
          attendanceFilter={attendanceFilter}
          genders={genders}
          requiresRepresentative={requiresRepresentative}
          requiresPaymentStatus={requiresPaymentStatus}
          onUpdated={handleRosterEntryChange}
          onDeleted={handleRosterEntryDeleted}
        />
      )}
      {tab === 'inscribir' && (
        <RegisterTab
          eventId={event.id}
          genders={genders}
          requiresRepresentative={requiresRepresentative}
          requiresPaymentStatus={requiresPaymentStatus}
          onRegistered={handleRegistered}
        />
      )}
      {tab === 'asistencia' && selectedDayId !== null && (
        <AttendanceTab
          eventId={event.id}
          roster={roster}
          leaders={leaders}
          selectedDayId={selectedDayId}
          onAttendanceChange={handleRosterEntryChange}
        />
      )}
      {tab === 'lideres' && selectedDayId !== null && (
        <LeadersTab
          eventId={event.id}
          leaders={leaders}
          selectedDayId={selectedDayId}
          onLeadersChange={setLeaders}
        />
      )}
    </Stack>
  )
}
