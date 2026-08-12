import ButtonBase from '@mui/material/ButtonBase'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import type { RosterEntry } from '@/domain/entities/RosterEntry'
import { ageLabelForPerson } from '@/shared/utils/calculateAge'

interface Props {
  entry: RosterEntry
  onSelect: () => void
}

// One candidate in a name search's results. Shows the representative's name so
// staff can visually confirm which child is the right one when several share a
// first and last name (e.g. after a lost ticket).
export function AttendanceMatchCard({ entry, onSelect }: Props) {
  return (
    <ButtonBase
      onClick={onSelect}
      sx={{
        width: '100%',
        textAlign: 'left',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        p: 1.5,
        '&:hover': { borderColor: 'primary.main' },
      }}
    >
      <Stack direction="row" sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.875rem' }}>
            {entry.firstName} {entry.lastName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {ageLabelForPerson(entry)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Representante: {entry.representativeName ?? 'sin registrar'}
          </Typography>
        </Box>
        <Chip label={entry.code} size="small" sx={{ fontWeight: 700 }} />
      </Stack>
    </ButtonBase>
  )
}
