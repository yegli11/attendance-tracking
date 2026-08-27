import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { Team } from '@/domain/entities/Team'
import { teamColor, teamLabel } from '@/shared/utils/teamLabel'

interface Props {
  team: Team
  present: number
  total: number
  presentLeaders?: number
  totalLeaders?: number
}

export function TeamStatCard({ team, present, total, presentLeaders, totalLeaders }: Props) {
  return (
    <Card variant="outlined" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, height: '100%' }}>
      <Box
        sx={{
          width: 38,
          height: 38,
          flexShrink: 0,
          borderRadius: 1.5,
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: teamColor(team).bg }} />
      </Box>
      <Box>
        <Typography
          sx={{
            fontSize: '11px',
            fontWeight: 700,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          {teamLabel(team)}
        </Typography>
        <Typography sx={{ fontSize: '21px', fontWeight: 800, lineHeight: 1.2 }}>
          {present}/{total}
        </Typography>
        {totalLeaders !== undefined && totalLeaders > 0 && (
          <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>
            Líderes: {presentLeaders}/{totalLeaders}
          </Typography>
        )}
      </Box>
    </Card>
  )
}
