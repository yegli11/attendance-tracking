import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import type { RosterEntry } from '@/domain/entities/RosterEntry'
import { Icon } from '@/presentation/components/atoms/Icon'
import { ageLabel } from '@/shared/utils/calculateAge'

interface Props {
  entry: RosterEntry
  onEdit: () => void
}

export function RosterCard({ entry, onEdit }: Props) {
  return (
    <Box
      sx={{
        borderLeft: '5px solid',
        borderLeftColor: entry.attended ? '#1E63D6' : 'divider',
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
            {ageLabel(entry.birthdate)}
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

      <Stack
        direction="row"
        spacing={0.75}
        sx={{ alignItems: 'center', color: 'text.secondary', fontSize: '0.75rem', mt: 1 }}
      >
        <Icon name="phone" size={12} />
        <span>{entry.phoneNumber}</span>
      </Stack>

      <Chip
        size="small"
        label={
          entry.attended
            ? `En el evento${
                entry.attendedDate
                  ? ` · ${new Date(entry.attendedDate).toLocaleTimeString('es-CL', {
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
          bgcolor: entry.attended ? '#EEF4FF' : 'warning.light',
          color: entry.attended ? '#1E63D6' : 'warning.dark',
        }}
      />
    </Box>
  )
}
