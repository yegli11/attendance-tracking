import { useMemo, useState } from 'react'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import type { Gender } from '@/domain/entities/Gender'
import type { EventDay } from '@/domain/entities/EventDay'
import type { PaymentStatus } from '@/domain/entities/PaymentStatus'
import type { RosterEntry } from '@/domain/entities/RosterEntry'
import { deleteRegistration } from '@/application/useCases/deleteRegistration'
import { supabaseRegistrationRepository } from '@/infrastructure/supabase/repositories/SupabaseRegistrationRepository'
import { Icon } from '@/presentation/components/atoms/Icon'
import { RosterCard } from '@/presentation/components/molecules/RosterCard'
import { Modal } from '@/presentation/components/organisms/Modal'
import { EditRegistrationForm } from '@/presentation/components/organisms/EditRegistrationForm'
import { paymentStatusColor, paymentStatusLabel } from '@/shared/utils/paymentStatusLabel'
import { useToast } from '@/presentation/hooks/useToast'

/** Codes are generated as "A-01", "B-02"... — the letter identifies which sign-up sheet ("planilla") a person came from. */
function codeGroup(code: string): string {
  const dashIndex = code.indexOf('-')
  return dashIndex > 0 ? code.slice(0, dashIndex) : code
}

const PAYMENT_STATUSES: PaymentStatus[] = ['pagado', 'financiado', 'pendiente']
export type RosterAttendanceFilter = 'all' | 'attended' | 'missing' | 'total'

interface Props {
  roster: RosterEntry[]
  days: EventDay[]
  selectedDayId: number
  attendanceFilter: RosterAttendanceFilter
  genders: Gender[]
  requiresRepresentative: boolean
  requiresPaymentStatus: boolean
  onUpdated: (entry: RosterEntry) => void
  onDeleted: (registrationId: number) => void
}

export function RosterTab({
  roster,
  days,
  selectedDayId,
  attendanceFilter,
  genders,
  requiresRepresentative,
  requiresPaymentStatus,
  onUpdated,
  onDeleted,
}: Props) {
  const { showSuccess, showError } = useToast()
  const [search, setSearch] = useState('')
  const [letterFilter, setLetterFilter] = useState<string | 'all'>('all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all')
  const [editingEntry, setEditingEntry] = useState<RosterEntry | null>(null)

  const availableLetters = useMemo(
    () => [...new Set(roster.map((entry) => codeGroup(entry.code)))].sort(),
    [roster],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return roster.filter((entry) => {
      if (letterFilter !== 'all' && codeGroup(entry.code) !== letterFilter) return false
      if (paymentFilter !== 'all' && entry.paymentStatus !== paymentFilter) return false
      if (query && !`${entry.firstName} ${entry.lastName} ${entry.code}`.toLowerCase().includes(query)) return false
      const attendedToday = entry.attendance.some((day) => day.eventDayId === selectedDayId && day.attendedAt !== null)
      if ((attendanceFilter === 'attended' || attendanceFilter === 'total') && !attendedToday) return false
      if (attendanceFilter === 'missing' && attendedToday) return false
      return true
    })
  }, [roster, search, letterFilter, paymentFilter, attendanceFilter, selectedDayId])

  const paymentCounts = useMemo(() => {
    const counts: Record<PaymentStatus, number> = { pagado: 0, financiado: 0, pendiente: 0 }
    for (const entry of roster) {
      if (entry.paymentStatus) counts[entry.paymentStatus]++
    }
    return counts
  }, [roster])

  async function handleDelete(entry: RosterEntry) {
    try {
      await deleteRegistration(supabaseRegistrationRepository, entry.registrationId)
      onDeleted(entry.registrationId)
      showSuccess(`${entry.firstName} ${entry.lastName} fue eliminado del evento.`)
    } catch {
      showError('No se pudo eliminar la inscripción.')
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
        <TextField
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          size="small"
          fullWidth
          sx={{ maxWidth: { sm: 360 } }}
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

        {availableLetters.length > 1 && (
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Chip
              label="Todas"
              size="small"
              onClick={() => setLetterFilter('all')}
              sx={
                letterFilter === 'all'
                  ? { bgcolor: 'text.primary', color: 'common.white', fontWeight: 700 }
                  : { fontWeight: 700 }
              }
              variant={letterFilter === 'all' ? 'filled' : 'outlined'}
            />
            {availableLetters.map((letter) => (
              <Chip
                key={letter}
                label={letter}
                size="small"
                onClick={() => setLetterFilter(letter)}
                sx={
                  letterFilter === letter
                    ? { bgcolor: 'text.primary', color: 'common.white', fontWeight: 700 }
                    : { fontWeight: 700 }
                }
                variant={letterFilter === letter ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>
        )}
      </Stack>

      {requiresPaymentStatus && (
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Chip
            label={`Todos (${roster.length})`}
            size="small"
            onClick={() => setPaymentFilter('all')}
            sx={
              paymentFilter === 'all'
                ? { bgcolor: 'text.primary', color: 'common.white', fontWeight: 700 }
                : { fontWeight: 700 }
            }
            variant={paymentFilter === 'all' ? 'filled' : 'outlined'}
          />
          {PAYMENT_STATUSES.map((status) => (
            <Chip
              key={status}
              label={`${paymentStatusLabel(status)} (${paymentCounts[status]})`}
              size="small"
              onClick={() => setPaymentFilter(status)}
              sx={
                paymentFilter === status
                  ? { bgcolor: paymentStatusColor(status).bg, color: paymentStatusColor(status).color, fontWeight: 700 }
                  : { borderColor: paymentStatusColor(status).bg, color: paymentStatusColor(status).bg, fontWeight: 700 }
              }
              variant={paymentFilter === status ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>
      )}

      {roster.length === 0 ? (
        <Typography sx={{ color: 'text.secondary', py: 4, textAlign: 'center' }}>
          Todavía no hay inscritos en este evento.
        </Typography>
      ) : filtered.length === 0 ? (
        <Typography sx={{ color: 'text.secondary', py: 4, textAlign: 'center' }}>
          No hay resultados para esa búsqueda.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((entry) => (
            <Grid key={entry.registrationId} size={{ xs: 12, sm: 6, md: 4 }}>
              <RosterCard
                entry={entry}
                days={days}
                onEdit={() => setEditingEntry(entry)}
                onDelete={() => handleDelete(entry)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {editingEntry && (
        <Modal title="Editar inscripción" onClose={() => setEditingEntry(null)}>
          <EditRegistrationForm
            entry={editingEntry}
            genders={genders}
            requiresRepresentative={requiresRepresentative}
            requiresPaymentStatus={requiresPaymentStatus}
            onUpdated={(entry) => {
              onUpdated(entry)
              setEditingEntry(null)
            }}
            onCancel={() => setEditingEntry(null)}
          />
        </Modal>
      )}
    </Stack>
  )
}
