import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { Team } from '@/domain/entities/Team'
import { teamColor, teamLabel } from '@/shared/utils/teamLabel'

interface Props {
  team: Team
  /** Use "onDark" over a dark/colored background (e.g. the attendance ticket panel). */
  variant?: 'default' | 'onDark'
}

// Small color dot + label, deliberately understated so it reads as metadata
// rather than a loud status chip.
export function TeamBadge({ team, variant = 'default' }: Props) {
  return (
    <Stack direction="row" spacing={0.625} sx={{ alignItems: 'center', display: 'inline-flex' }}>
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          bgcolor: teamColor(team).bg,
          flexShrink: 0,
        }}
      />
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          lineHeight: 1,
          color: variant === 'onDark' ? 'rgba(255,255,255,0.85)' : 'text.secondary',
        }}
      >
        {teamLabel(team)}
      </Typography>
    </Stack>
  )
}
