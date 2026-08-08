import type { ReactNode } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { Icon } from '@/presentation/components/atoms/Icon'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, onClose, children }: Props) {
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle component="div">
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{title}</span>
          <IconButton onClick={onClose} aria-label="Cerrar" size="small">
            <Icon name="close" size={16} />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  )
}
