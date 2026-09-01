import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

interface Props {
  label: string
  value: number
  active: boolean
  onClick: () => void
  /**
   * Accent color for the dot + active border. Accepts a hex/rgb string or an
   * MUI theme token path ("success.main"). Omit for a neutral card ("Todos").
   */
  accent?: string
}

// Clickable filter card used by the roster filters (payment status, team).
// Mirrors StatCard's look so both filter rows read as one system.
export function FilterStatCard({ label, value, active, onClick, accent }: Props) {
  const activeColor = accent ?? 'primary.main'
  return (
    <Card
      variant="outlined"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick()
        }
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.25,
        px: 1.5,
        py: 1.25,
        height: '100%',
        cursor: 'pointer',
        borderColor: active ? activeColor : 'divider',
        borderWidth: active ? 2 : 1,
        bgcolor: active ? 'action.selected' : 'background.paper',
        '&:hover': { borderColor: activeColor },
      }}
    >
      <Box
        sx={{
          width: 10,
          height: 10,
          flexShrink: 0,
          borderRadius: '50%',
          bgcolor: accent ?? 'text.disabled',
        }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: '10.5px',
            fontWeight: 700,
            color: 'text.secondary',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Typography>
        <Typography sx={{ fontSize: '19px', fontWeight: 800, lineHeight: 1.2 }}>{value}</Typography>
      </Box>
    </Card>
  )
}
