import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

interface Props {
  percentage: number
  size?: number
  thickness?: number
}

export function AttendanceRing({ percentage, size = 44, thickness = 4 }: Props) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={thickness}
        sx={{ color: 'divider' }}
      />
      <CircularProgress
        variant="determinate"
        value={percentage}
        size={size}
        thickness={thickness}
        sx={{ color: 'primary.main', position: 'absolute', left: 0 }}
      />
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontSize: size * 0.3, fontWeight: 800, lineHeight: 1 }}>{percentage}%</Typography>
      </Box>
    </Box>
  )
}
