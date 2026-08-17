import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import type { EventDay } from '@/domain/entities/EventDay'
import type { PaymentStatus } from '@/domain/entities/PaymentStatus'
import type { RosterEntry } from '@/domain/entities/RosterEntry'
import { Icon } from '@/presentation/components/atoms/Icon'
import { ageLabelForPerson } from '@/shared/utils/calculateAge'
import { paymentStatusLabel } from '@/shared/utils/paymentStatusLabel'

interface Props {
  entry: RosterEntry
  days: EventDay[]
  onEdit: () => void
}

const PAYMENT_STATUS_COLOR: Record<PaymentStatus, { bg: string; color: string }> = {
  pagado: { bg: 'success.main', color: 'common.white' },
  financiado: { bg: 'info.main', color: 'common.white' },
  pendiente: { bg: 'warning.main', color: 'common.white' },
}

export function RosterCard({ entry, days, onEdit }: Props) {
  const isMultiDay = days.length > 1
  const attendedAnyDay = entry.attendance.some((day) => day.attendedAt !== null)

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
          <Typography sx={{ fontWeight: 700 }}>
            {entry.firstName} {entry.lastName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {ageLabelForPerson(entry)}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Chip label={entry.code} size="small" color="primary" sx={{ fontWeight: 700 }} />
          <Tooltip title="Editar inscripción">
            <IconButton size="small" onClick={onEdit} aria-label="Editar inscripción">
              <Icon name="edit" size={14} />
            </IconButton>
          </Tooltip>
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
            bgcolor: PAYMENT_STATUS_COLOR[entry.paymentStatus].bg,
            color: PAYMENT_STATUS_COLOR[entry.paymentStatus].color,
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
