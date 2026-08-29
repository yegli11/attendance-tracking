import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { Icon, type IconName } from '@/presentation/components/atoms/Icon'

interface Props {
  icon: IconName
  label: string
  value: string | number
  active?: boolean
  onClick?: () => void
}

export function StatCard({ icon, label, value, active = false, onClick }: Props) {
  return (
    <Card
      variant="outlined"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 2,
        height: '100%',
        borderColor: active ? 'primary.main' : 'divider',
        borderWidth: active ? 2 : 1,
        bgcolor: active ? alpha('#060773', 0.05) : 'background.paper',
        ...(onClick && {
          cursor: 'pointer',
          '&:hover': { borderColor: 'primary.main' },
        }),
      }}
    >
      <Box
        sx={{
          width: 38,
          height: 38,
          flexShrink: 0,
          borderRadius: 1.5,
          bgcolor: 'background.default',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={18} />
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
          {label}
        </Typography>
        <Typography sx={{ fontSize: '21px', fontWeight: 800, lineHeight: 1.2 }}>{value}</Typography>
      </Box>
    </Card>
  )
}
