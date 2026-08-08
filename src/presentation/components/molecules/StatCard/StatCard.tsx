import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Icon, type IconName } from '@/presentation/components/atoms/Icon'

interface Props {
  icon: IconName
  label: string
  value: string | number
}

export function StatCard({ icon, label, value }: Props) {
  return (
    <Card variant="outlined" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, height: '100%' }}>
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
