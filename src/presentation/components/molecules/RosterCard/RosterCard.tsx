import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import type { EventDay } from '@/domain/entities/EventDay'
import type { RosterEntry } from '@/domain/entities/RosterEntry'
import { Icon } from '@/presentation/components/atoms/Icon'
import { TeamBadge } from '@/presentation/components/atoms/TeamBadge'
import { useAuth } from '@/presentation/hooks/useAuth'
import { ageLabelForPerson } from '@/shared/utils/calculateAge'
import { findBirthdayEventDay } from '@/shared/utils/findBirthdayEventDay'
import { formatEventDayLabel } from '@/shared/utils/formatEventDate'
import { paymentStatusColor, paymentStatusLabel } from '@/shared/utils/paymentStatusLabel'
import { REGISTRATION_DELETE_EMAIL } from '@/shared/constants/permissions'

interface Props {
  entry: RosterEntry
  days: EventDay[]
  onEdit: () => void
  onDelete: () => void
}

export function RosterCard({ entry, days, onEdit, onDelete }: Props) {
  const { user } = useAuth()
  const canDelete = user?.email === REGISTRATION_DELETE_EMAIL
  const isMultiDay = days.length > 1
  const attendedAnyDay = entry.attendance.some((day) => day.attendedAt !== null)
  const birthdayDay = findBirthdayEventDay(entry.birthdate, days)

  function handleDelete() {
    const confirmed = window.confirm(`¿Eliminar a ${entry.firstName} ${entry.lastName} de este evento?`)
    if (confirmed) onDelete()
  }

  return (
    <Box
      sx={{
        borderLeft: '5px solid',
        borderLeftColor: attendedAnyDay ? 'success.dark' : 'divider',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 2,
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 700 }}>
              {entry.firstName} {entry.lastName}
            </Typography>
            {birthdayDay && (
              <Tooltip title={`Cumpleaños: ${formatEventDayLabel(birthdayDay)}`}>
                <span aria-label="Cumpleaños durante el evento" style={{ fontSize: '0.9rem', lineHeight: 1 }}>
                  🎂
                </span>
              </Tooltip>
            )}
          </Stack>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {ageLabelForPerson(entry)}
            </Typography>
            {entry.team && <TeamBadge team={entry.team} />}
          </Stack>
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          {entry.isOnline && (
            <Tooltip title="Inscripción hecha por el formulario online">
              <Chip
                label="Online"
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 600, color: 'text.secondary' }}
              />
            </Tooltip>
          )}
          <Chip label={entry.code} size="small" color="primary" sx={{ fontWeight: 700 }} />
          <Tooltip title="Editar inscripción">
            <IconButton size="small" onClick={onEdit} aria-label="Editar inscripción">
              <Icon name="edit" size={14} />
            </IconButton>
          </Tooltip>
          {canDelete && (
            <Tooltip title="Eliminar del evento">
              <IconButton size="small" onClick={handleDelete} aria-label="Eliminar del evento" color="error">
                <Icon name="trash" size={14} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      {entry.paymentStatus && (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            mt: 1,
            py: 0.5,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            bgcolor: paymentStatusColor(entry.paymentStatus).bg,
            color: paymentStatusColor(entry.paymentStatus).color,
          }}
        >
          {entry.paymentStatus === 'pagado' && <Icon name="check" size={11} />}
          <span>{paymentStatusLabel(entry.paymentStatus)}</span>
        </Stack>
      )}

      <Stack
        direction="row"
        spacing={0.75}
        sx={{ alignItems: 'center', color: 'text.secondary', fontSize: '0.75rem', mt: 1 }}
      >
        <Icon name="phone" size={12} />
        <span>{entry.phoneNumber}</span>
      </Stack>

      {isMultiDay ? (
        <Stack direction="row" spacing={0.5} sx={{ mt: 1.25, flexWrap: 'wrap' }} useFlexGap>
          {entry.attendance.map((day) => (
            <Chip
              key={day.eventDayId}
              size="small"
              label={`D${day.dayNumber}`}
              sx={{
                fontWeight: 700,
                bgcolor: day.attendedAt !== null ? 'success.dark' : 'action.disabledBackground',
                color: day.attendedAt !== null ? 'common.white' : 'text.secondary',
              }}
            />
          ))}
        </Stack>
      ) : (
        <Chip
          size="small"
          label={
            attendedAnyDay
              ? `En el evento${
                  entry.attendance[0]?.attendedAt
                    ? ` · ${new Date(entry.attendance[0].attendedAt).toLocaleTimeString('es-CL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`
                    : ''
                }`
              : 'Pendiente'
          }
          sx={{
            mt: 1.25,
            fontWeight: 700,
            bgcolor: attendedAnyDay ? 'success.dark' : 'warning.main',
            color: 'common.white',
          }}
        />
      )}
    </Box>
  )
}
