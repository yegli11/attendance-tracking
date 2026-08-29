import { useState, type FormEvent } from 'react'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import type { StaffMember } from '@/domain/entities/StaffMember'
import { addStaffMember } from '@/application/useCases/addStaffMember'
import { updateStaffMember } from '@/application/useCases/updateStaffMember'
import { removeStaffMember } from '@/application/useCases/removeStaffMember'
import { markStaffAttendance } from '@/application/useCases/markStaffAttendance'
import { supabaseStaffMemberRepository } from '@/infrastructure/supabase/repositories/SupabaseStaffMemberRepository'
import { Icon } from '@/presentation/components/atoms/Icon'
import { useToast } from '@/presentation/hooks/useToast'

interface Props {
  eventId: number
  staffMembers: StaffMember[]
  selectedDayId: number
  onStaffMembersChange: (staffMembers: StaffMember[]) => void
}

function attendedAtForDay(staffMember: StaffMember, dayId: number): string | null {
  return staffMember.attendance.find((day) => day.dayId === dayId)?.attendedAt ?? null
}

export function StaffTab({ eventId, staffMembers, selectedDayId, onStaffMembersChange }: Props) {
  const { showSuccess, showError } = useToast()
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  const presentCount = staffMembers.filter((member) => attendedAtForDay(member, selectedDayId) !== null).length

  async function handleAdd(event: FormEvent) {
    event.preventDefault()
    const fullName = name.trim()
    if (!fullName) return
    setIsSubmitting(true)
    try {
      const staffMember = await addStaffMember(supabaseStaffMemberRepository, eventId, fullName)
      onStaffMembersChange([...staffMembers, staffMember])
      setName('')
      showSuccess(`${fullName} fue agregado al equipo de trabajo.`)
    } catch {
      showError('No se pudo agregar al integrante.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleToggleAttendance(staffMember: StaffMember) {
    const attended = attendedAtForDay(staffMember, selectedDayId) !== null
    try {
      const updated = await markStaffAttendance(supabaseStaffMemberRepository, staffMember.id, selectedDayId, !attended)
      onStaffMembersChange(staffMembers.map((item) => (item.id === updated.id ? updated : item)))
    } catch {
      showError('No se pudo actualizar la asistencia del integrante.')
    }
  }

  function handleStartEdit(staffMember: StaffMember) {
    setEditingId(staffMember.id)
    setEditValue(staffMember.fullName)
  }

  function handleCancelEdit() {
    setEditingId(null)
    setEditValue('')
  }

  async function handleSaveEdit(event: FormEvent, staffMember: StaffMember) {
    event.preventDefault()
    const fullName = editValue.trim()
    if (!fullName || fullName === staffMember.fullName) {
      handleCancelEdit()
      return
    }
    try {
      const updated = await updateStaffMember(supabaseStaffMemberRepository, staffMember.id, fullName)
      onStaffMembersChange(staffMembers.map((item) => (item.id === updated.id ? updated : item)))
      handleCancelEdit()
    } catch {
      showError('No se pudo actualizar al integrante.')
    }
  }

  async function handleRemove(staffMember: StaffMember) {
    const confirmed = window.confirm(`¿Eliminar a ${staffMember.fullName} del equipo de trabajo?`)
    if (!confirmed) return
    try {
      await removeStaffMember(supabaseStaffMemberRepository, staffMember.id)
      onStaffMembersChange(staffMembers.filter((item) => item.id !== staffMember.id))
      showSuccess(`${staffMember.fullName} fue eliminado.`)
    } catch {
      showError('No se pudo eliminar al integrante.')
    }
  }

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2.5, maxWidth: 560 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
        <Typography sx={{ fontWeight: 700 }}>Equipo de trabajo</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          ({presentCount}/{staffMembers.length})
        </Typography>
      </Stack>

      <Stack component="form" direction="row" spacing={1} sx={{ mb: 2 }} onSubmit={handleAdd}>
        <TextField
          placeholder="Nombre del integrante"
          value={name}
          onChange={(e) => setName(e.target.value)}
          size="small"
          fullWidth
        />
        <Button type="submit" variant="outlined" disabled={isSubmitting} startIcon={<Icon name="plus" size={14} />}>
          Agregar
        </Button>
      </Stack>

      {staffMembers.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Todavía no hay integrantes en el equipo de trabajo.
        </Typography>
      ) : (
        <Stack spacing={0.5}>
          {staffMembers.map((staffMember) => {
            const attended = attendedAtForDay(staffMember, selectedDayId) !== null

            if (editingId === staffMember.id) {
              return (
                <Stack
                  key={staffMember.id}
                  component="form"
                  direction="row"
                  spacing={0.5}
                  sx={{ alignItems: 'center', py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}
                  onSubmit={(e) => handleSaveEdit(e, staffMember)}
                >
                  <TextField
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    size="small"
                    fullWidth
                    autoFocus
                  />
                  <Tooltip title="Guardar">
                    <IconButton type="submit" size="small" color="success" aria-label="Guardar">
                      <Icon name="check" size={14} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancelar">
                    <IconButton size="small" onClick={handleCancelEdit} aria-label="Cancelar">
                      <Icon name="close" size={14} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )
            }

            return (
              <Stack
                key={staffMember.id}
                direction="row"
                sx={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 0.75,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography sx={{ fontSize: '0.875rem', fontWeight: attended ? 700 : 400 }}>
                  {staffMember.fullName}
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title={attended ? 'Marcar ausente' : 'Marcar presente'}>
                    <IconButton
                      size="small"
                      onClick={() => handleToggleAttendance(staffMember)}
                      color={attended ? 'success' : 'default'}
                      aria-label={attended ? 'Marcar ausente' : 'Marcar presente'}
                    >
                      <Icon name={attended ? 'undo' : 'check'} size={14} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar nombre">
                    <IconButton size="small" onClick={() => handleStartEdit(staffMember)} aria-label="Editar nombre">
                      <Icon name="edit" size={14} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar integrante">
                    <IconButton
                      size="small"
                      onClick={() => handleRemove(staffMember)}
                      color="error"
                      aria-label="Eliminar integrante"
                    >
                      <Icon name="trash" size={14} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            )
          })}
        </Stack>
      )}
    </Box>
  )
}
