import { useMemo, useState, type FormEvent } from 'react'
import { ZodError } from 'zod'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import type { EventDay } from '@/domain/entities/EventDay'
import type { RosterEntry } from '@/domain/entities/RosterEntry'
import type { Team } from '@/domain/entities/Team'
import type { TeamLeader } from '@/domain/entities/TeamLeader'
import { findRegistrationByCode } from '@/application/useCases/findRegistrationByCode'
import { markAttendance } from '@/application/useCases/markAttendance'
import { supabaseRegistrationRepository } from '@/infrastructure/supabase/repositories/SupabaseRegistrationRepository'
import { Icon } from '@/presentation/components/atoms/Icon'
import { TeamBadge } from '@/presentation/components/atoms/TeamBadge'
import { AttendanceMatchCard } from '@/presentation/components/molecules/AttendanceMatchCard'
import { TeamStatCard } from '@/presentation/components/molecules/TeamStatCard'
import { ageLabelForPerson } from '@/shared/utils/calculateAge'
import { findBirthdayEventDay } from '@/shared/utils/findBirthdayEventDay'
import { teamLabel } from '@/shared/utils/teamLabel'
import { useToast } from '@/presentation/hooks/useToast'

const TEAMS: Team[] = ['naranja', 'rojo', 'verde', 'azul']

/** Colored chip for a gender: pink for Femenino, blue for Masculino, grey for anything else. */
function genderColor(name: string): string {
  const key = name.trim().toLowerCase()
  if (key.startsWith('f')) return '#EC4899'
  if (key.startsWith('m')) return '#3B82F6'
  return '#6B7280'
}

interface Props {
  eventId: number
  roster: RosterEntry[]
  days: EventDay[]
  leaders: TeamLeader[]
  selectedDayId: number
  onAttendanceChange: (entry: RosterEntry) => void
}

function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

function attendedAtForDay(entry: RosterEntry, eventDayId: number): string | null {
  return entry.attendance.find((day) => day.eventDayId === eventDayId)?.attendedAt ?? null
}

export function AttendanceTab({ eventId, roster, days, leaders, selectedDayId, onAttendanceChange }: Props) {
  const { showSuccess, showError } = useToast()
  const [code, setCode] = useState('')
  const [result, setResult] = useState<RosterEntry | null | undefined>(undefined)
  const [searchedCode, setSearchedCode] = useState('')
  const [nameQuery, setNameQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [genderFilter, setGenderFilter] = useState<string>('all')

  function handleTeamCardClick(team: Team) {
    setGenderFilter('all')
    setSelectedTeam((current) => (current === team ? null : team))
  }

  const teamRoster = useMemo(
    () => (selectedTeam ? roster.filter((entry) => entry.team === selectedTeam) : []),
    [roster, selectedTeam],
  )

  const teamGenderNames = useMemo(
    () => [...new Set(teamRoster.map((entry) => entry.genderName).filter(Boolean))].sort(),
    [teamRoster],
  )

  const teamRosterFiltered = useMemo(
    () =>
      [...teamRoster]
        .filter((entry) => genderFilter === 'all' || entry.genderName === genderFilter)
        .sort((a, b) =>
          `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, 'es'),
        ),
    [teamRoster, genderFilter],
  )

  const nameMatches = useMemo(() => {
    const query = nameQuery.trim().toLowerCase()
    if (!query) return []
    return roster.filter((entry) => `${entry.firstName} ${entry.lastName}`.toLowerCase().includes(query))
  }, [roster, nameQuery])

  async function handleSearch(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setNameQuery('')
    setIsSearching(true)
    try {
      const entry = await findRegistrationByCode(supabaseRegistrationRepository, { eventId, code })
      setResult(entry)
      setSearchedCode(code)
    } catch (err) {
      const message = err instanceof ZodError ? (err.issues[0]?.message ?? 'Código inválido.') : 'No se pudo buscar.'
      setError(message)
      showError(message)
    } finally {
      setIsSearching(false)
    }
  }

  function handleSelectMatch(entry: RosterEntry) {
    setResult(entry)
    setSearchedCode(entry.code)
    setNameQuery('')
    setError(null)
  }

  async function handleToggleAttendance() {
    if (!result) return
    const attended = attendedAtForDay(result, selectedDayId) !== null
    setIsToggling(true)
    try {
      const updated = await markAttendance(supabaseRegistrationRepository, result.registrationId, selectedDayId, !attended)
      setResult(updated)
      onAttendanceChange(updated)
      showSuccess(attended ? 'Entrada deshecha.' : 'Entrada marcada.')
    } catch {
      const message = 'No se pudo actualizar la asistencia.'
      setError(message)
      showError(message)
    } finally {
      setIsToggling(false)
    }
  }

  const resultAttended = result ? attendedAtForDay(result, selectedDayId) !== null : false
  const resultBirthdayToday = result
    ? findBirthdayEventDay(result.birthdate, days)?.id === selectedDayId
    : false

  const presentes = [...roster]
    .map((entry) => ({ entry, attendedAt: attendedAtForDay(entry, selectedDayId) }))
    .filter((item) => item.attendedAt !== null)
    .sort((a, b) => (b.attendedAt ?? '').localeCompare(a.attendedAt ?? ''))

  const teamStats = TEAMS.map((team) => {
    const inTeam = roster.filter((entry) => entry.team === team)
    const present = inTeam.filter((entry) => attendedAtForDay(entry, selectedDayId) !== null).length
    const teamLeaders = leaders.filter((leader) => leader.team === team)
    const presentLeaders = teamLeaders.filter((leader) =>
      leader.attendance.some((day) => day.dayId === selectedDayId && day.attendedAt !== null),
    ).length
    return { team, total: inTeam.length, present, totalLeaders: teamLeaders.length, presentLeaders }
  }).filter((stat) => stat.total > 0 || stat.totalLeaders > 0)

  return (
    <Stack spacing={3}>
      {teamStats.length > 0 && (
        <Grid container spacing={1.5}>
          {teamStats.map((stat) => (
            <Grid key={stat.team} size={{ xs: 6, sm: 3 }}>
              <TeamStatCard
                team={stat.team}
                present={stat.present}
                total={stat.total}
                presentLeaders={stat.presentLeaders}
                totalLeaders={stat.totalLeaders}
                active={selectedTeam === stat.team}
                onClick={() => handleTeamCardClick(stat.team)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {selectedTeam && (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: { xs: 2, sm: 3 } }}>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5, gap: 1 }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
              Equipo {teamLabel(selectedTeam)} · {teamRoster.length} inscritos
            </Typography>
            <Button size="small" color="inherit" onClick={() => setSelectedTeam(null)}>
              Cerrar
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
            <Chip
              label={`Todos (${teamRoster.length})`}
              size="small"
              onClick={() => setGenderFilter('all')}
              variant={genderFilter === 'all' ? 'filled' : 'outlined'}
              sx={
                genderFilter === 'all'
                  ? { bgcolor: 'text.primary', color: 'common.white', fontWeight: 700 }
                  : { fontWeight: 700 }
              }
            />
            {teamGenderNames.map((name) => {
              const count = teamRoster.filter((entry) => entry.genderName === name).length
              const chipColor = genderColor(name)
              const selected = genderFilter === name
              return (
                <Chip
                  key={name}
                  label={`${name} (${count})`}
                  size="small"
                  onClick={() => setGenderFilter(selected ? 'all' : name)}
                  variant={selected ? 'filled' : 'outlined'}
                  sx={
                    selected
                      ? { bgcolor: chipColor, color: 'common.white', fontWeight: 700 }
                      : { borderColor: chipColor, color: chipColor, fontWeight: 700 }
                  }
                />
              )
            })}
          </Stack>

          {teamRosterFiltered.length === 0 ? (
            <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
              No hay inscritos con ese filtro.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {teamRosterFiltered.map((entry) => {
                const attended = attendedAtForDay(entry, selectedDayId) !== null
                return (
                  <Stack
                    key={entry.registrationId}
                    direction="row"
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 0.75,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {entry.firstName} {entry.lastName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {ageLabelForPerson(entry)}
                        {entry.genderName ? ` · ${entry.genderName}` : ''}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexShrink: 0 }}>
                      <Chip
                        label={attended ? 'Presente' : 'Falta'}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: attended ? 'success.main' : 'action.disabledBackground',
                          color: attended ? 'common.white' : 'text.secondary',
                        }}
                      />
                      <Chip label={entry.code} size="small" sx={{ fontWeight: 700 }} />
                    </Stack>
                  </Stack>
                )
              })}
            </Stack>
          )}
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', mb: 0.5 }}>Buscar por código</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
              Escribe el código para marcar la entrada.
            </Typography>

            <Stack component="form" direction="row" spacing={1.5} onSubmit={handleSearch}>
              <TextField
                placeholder="A-01"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                fullWidth
                size="small"
              />
              <Button type="submit" variant="contained" disabled={isSearching}>
                Buscar
              </Button>
            </Stack>

            <Divider sx={{ my: 2.5 }}>o busca por nombre</Divider>

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
              Si perdió el ticket, escribe su nombre y apellido. Verifica al representante antes
              de marcar la entrada: puede haber más de un inscrito con el mismo nombre.
            </Typography>
            <TextField
              placeholder="Nombre y apellido"
              value={nameQuery}
              onChange={(e) => setNameQuery(e.target.value)}
              fullWidth
              size="small"
            />

            {nameQuery.trim() !== '' && (
              <Stack spacing={1} sx={{ mt: 1.5 }}>
                {nameMatches.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    No hay inscritos que coincidan con "{nameQuery}".
                  </Typography>
                ) : (
                  nameMatches.map((entry) => (
                    <AttendanceMatchCard key={entry.registrationId} entry={entry} onSelect={() => handleSelectMatch(entry)} />
                  ))
                )}
              </Stack>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {result === null && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                No se encontró ningún inscrito con el código "{searchedCode}".
              </Alert>
            )}

            {result && (
              <Box sx={{ mt: 2.5 }}>
                {resultBirthdayToday && (
                  <Alert severity="success" icon={<span>🎉</span>} sx={{ mb: 1.5 }}>
                    ¡Hoy cumple años! Aprovecha para felicitarlo/a.
                  </Alert>
                )}
                <Stack direction="row" sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      background: 'linear-gradient(135deg, #123A73 0%, #071B33 100%)',
                      color: 'common.white',
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>
                      {result.firstName} {result.lastName}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', mt: 0.5 }}>
                      {ageLabelForPerson(result)} · {result.genderName}
                    </Typography>
                    {result.representativeName && (
                      <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', mt: 0.25 }}>
                        Representante: {result.representativeName}
                      </Typography>
                    )}
                    {result.team && (
                      <Box sx={{ mt: 0.75 }}>
                        <TeamBadge team={result.team} variant="onDark" />
                      </Box>
                    )}
                    {result.attendance.length > 1 && (
                      <Stack direction="row" spacing={0.5} sx={{ mt: 0.75, flexWrap: 'wrap' }} useFlexGap>
                        {result.attendance.map((day) => (
                          <Chip
                            key={day.eventDayId}
                            size="small"
                            label={`D${day.dayNumber}`}
                            sx={{
                              fontWeight: 700,
                              bgcolor: day.attendedAt !== null ? 'success.dark' : 'action.disabledBackground',
                              color: day.attendedAt !== null ? 'common.white' : 'text.secondary',
                            }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Box>
                  <Stack
                    sx={{
                      width: 90,
                      flexShrink: 0,
                      bgcolor: resultAttended ? 'success.main' : 'primary.main',
                      color: 'common.white',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: 800 }}>{result.code}</Typography>
                  </Stack>
                </Stack>
                <Button
                  fullWidth
                  variant={resultAttended ? 'outlined' : 'contained'}
                  color={resultAttended ? 'inherit' : 'primary'}
                  startIcon={<Icon name={resultAttended ? 'undo' : 'check'} size={15} />}
                  onClick={handleToggleAttendance}
                  disabled={isToggling}
                  sx={{ mt: 1.5 }}
                >
                  {resultAttended ? 'Deshacer entrada' : 'Marcar entrada'}
                </Button>
              </Box>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', mb: 2 }}>
              Presentes ({presentes.length})
            </Typography>
            {presentes.length === 0 ? (
              <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
                Nadie ha llegado todavía.
              </Typography>
            ) : (
              <Stack spacing={1.25}>
                {presentes.map(({ entry, attendedAt }) => (
                  <Stack
                    key={entry.registrationId}
                    direction="row"
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {entry.firstName} {entry.lastName}
                      </Typography>
                      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {attendedAt ? formatTime(attendedAt) : ''}
                        </Typography>
                        {entry.team && <TeamBadge team={entry.team} />}
                      </Stack>
                    </Box>
                    <Chip label={entry.code} size="small" sx={{ fontWeight: 700 }} />
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>
        </Grid>
      </Grid>
    </Stack>
  )
}
