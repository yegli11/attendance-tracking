import { useState, type FormEvent } from 'react'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import type { Team } from '@/domain/entities/Team'
import type { TeamLeader } from '@/domain/entities/TeamLeader'
import { addTeamLeader } from '@/application/useCases/addTeamLeader'
import { updateTeamLeader } from '@/application/useCases/updateTeamLeader'
import { removeTeamLeader } from '@/application/useCases/removeTeamLeader'
import { markLeaderAttendance } from '@/application/useCases/markLeaderAttendance'
import { supabaseTeamLeaderRepository } from '@/infrastructure/supabase/repositories/SupabaseTeamLeaderRepository'
import { Icon } from '@/presentation/components/atoms/Icon'
import { teamColor, teamLabel } from '@/shared/utils/teamLabel'
import { useToast } from '@/presentation/hooks/useToast'

const TEAMS: Team[] = ['naranja', 'rojo', 'verde', 'azul']

interface Props {
  eventId: number
  leaders: TeamLeader[]
  selectedDayId: number
  onLeadersChange: (leaders: TeamLeader[]) => void
}

function attendedAtForDay(leader: TeamLeader, dayId: number): string | null {
  return leader.attendance.find((day) => day.dayId === dayId)?.attendedAt ?? null
}

export function LeadersTab({ eventId, leaders, selectedDayId, onLeadersChange }: Props) {
  const { showSuccess, showError } = useToast()
  const [nameByTeam, setNameByTeam] = useState<Record<Team, string>>({
    naranja: '',
    rojo: '',
    verde: '',
    azul: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  async function handleAdd(event: FormEvent, team: Team) {
    event.preventDefault()
    const fullName = nameByTeam[team].trim()
    if (!fullName) return
    setIsSubmitting(true)
    try {
      const leader = await addTeamLeader(supabaseTeamLeaderRepository, eventId, team, fullName)
      onLeadersChange([...leaders, leader])
      setNameByTeam((current) => ({ ...current, [team]: '' }))
      showSuccess(`${fullName} fue agregado como líder.`)
    } catch {
      showError('No se pudo agregar al líder.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleToggleAttendance(leader: TeamLeader) {
    const attended = attendedAtForDay(leader, selectedDayId) !== null
    try {
      const updated = await markLeaderAttendance(supabaseTeamLeaderRepository, leader.id, selectedDayId, !attended)
      onLeadersChange(leaders.map((item) => (item.id === updated.id ? updated : item)))
    } catch {
      showError('No se pudo actualizar la asistencia del líder.')
    }
  }

  function handleStartEdit(leader: TeamLeader) {
    setEditingId(leader.id)
    setEditValue(leader.fullName)
  }

  function handleCancelEdit() {
    setEditingId(null)
    setEditValue('')
  }

  async function handleSaveEdit(event: FormEvent, leader: TeamLeader) {
    event.preventDefault()
    const fullName = editValue.trim()
    if (!fullName || fullName === leader.fullName) {
      handleCancelEdit()
      return
    }
    try {
      const updated = await updateTeamLeader(supabaseTeamLeaderRepository, leader.id, fullName)
      onLeadersChange(leaders.map((item) => (item.id === updated.id ? updated : item)))
      handleCancelEdit()
    } catch {
      showError('No se pudo actualizar al líder.')
    }
  }

  async function handleRemove(leader: TeamLeader) {
    const confirmed = window.confirm(`¿Eliminar a ${leader.fullName} de los líderes?`)
    if (!confirmed) return
    try {
      await removeTeamLeader(supabaseTeamLeaderRepository, leader.id)
      onLeadersChange(leaders.filter((item) => item.id !== leader.id))
      showSuccess(`${leader.fullName} fue eliminado.`)
    } catch {
      showError('No se pudo eliminar al líder.')
    }
  }

  return (
    <Grid container spacing={2}>
      {TEAMS.map((team) => {
        const teamLeaders = leaders.filter((leader) => leader.team === team)
        const presentCount = teamLeaders.filter((leader) => attendedAtForDay(leader, selectedDayId) !== null).length

        return (
          <Grid key={team} size={{ xs: 12, md: 6 }}>
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2.5, height: '100%' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: teamColor(team).bg }} />
                <Typography sx={{ fontWeight: 700 }}>{teamLabel(team)}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  ({presentCount}/{teamLeaders.length})
                </Typography>
              </Stack>

              <Stack component="form" direction="row" spacing={1} sx={{ mb: 2 }} onSubmit={(e) => handleAdd(e, team)}>
                <TextField
                  placeholder="Nombre del líder"
                  value={nameByTeam[team]}
                  onChange={(e) => setNameByTeam((current) => ({ ...current, [team]: e.target.value }))}
                  size="small"
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="outlined"
                  disabled={isSubmitting}
                  startIcon={<Icon name="plus" size={14} />}
                >
                  Agregar
                </Button>
              </Stack>

              {teamLeaders.length === 0 ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Todavía no hay líderes en este equipo.
                </Typography>
              ) : (
                <Stack spacing={0.5}>
                  {teamLeaders.map((leader) => {
                    const attended = attendedAtForDay(leader, selectedDayId) !== null

                    if (editingId === leader.id) {
                      return (
                        <Stack
                          key={leader.id}
                          component="form"
                          direction="row"
                          spacing={0.5}
                          sx={{ alignItems: 'center', py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}
                          onSubmit={(e) => handleSaveEdit(e, leader)}
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
                        key={leader.id}
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
                          {leader.fullName}
                        </Typography>
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title={attended ? 'Marcar ausente' : 'Marcar presente'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleAttendance(leader)}
                              color={attended ? 'success' : 'default'}
                              aria-label={attended ? 'Marcar ausente' : 'Marcar presente'}
                            >
                              <Icon name={attended ? 'undo' : 'check'} size={14} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar nombre">
                            <IconButton
                              size="small"
                              onClick={() => handleStartEdit(leader)}
                              aria-label="Editar nombre"
                            >
                              <Icon name="edit" size={14} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Eliminar líder">
                            <IconButton
                              size="small"
                              onClick={() => handleRemove(leader)}
                              color="error"
                              aria-label="Eliminar líder"
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
          </Grid>
        )
      })}
    </Grid>
  )
}
