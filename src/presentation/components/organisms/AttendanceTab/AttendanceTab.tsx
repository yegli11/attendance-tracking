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
import type { RosterEntry } from '@/domain/entities/RosterEntry'
import { findRegistrationByCode } from '@/application/useCases/findRegistrationByCode'
import { markAttendance } from '@/application/useCases/markAttendance'
import { supabaseRegistrationRepository } from '@/infrastructure/supabase/repositories/SupabaseRegistrationRepository'
import { Icon } from '@/presentation/components/atoms/Icon'
import { AttendanceMatchCard } from '@/presentation/components/molecules/AttendanceMatchCard'
import { ageLabel } from '@/shared/utils/calculateAge'
import { useToast } from '@/presentation/hooks/useToast'

interface Props {
  eventId: number
  roster: RosterEntry[]
  selectedDayId: number
  onAttendanceChange: (entry: RosterEntry) => void
}

function formatTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

function attendedAtForDay(entry: RosterEntry, eventDayId: number): string | null {
  return entry.attendance.find((day) => day.eventDayId === eventDayId)?.attendedAt ?? null
}

export function AttendanceTab({ eventId, roster, selectedDayId, onAttendanceChange }: Props) {
  const { showSuccess, showError } = useToast()
  const [code, setCode] = useState('')
  const [result, setResult] = useState<RosterEntry | null | undefined>(undefined)
  const [searchedCode, setSearchedCode] = useState('')
  const [nameQuery, setNameQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

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

  const presentes = [...roster]
    .map((entry) => ({ entry, attendedAt: attendedAtForDay(entry, selectedDayId) }))
    .filter((item) => item.attendedAt !== null)
    .sort((a, b) => (b.attendedAt ?? '').localeCompare(a.attendedAt ?? ''))

  return (
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
                    {ageLabel(result.birthdate)} · {result.genderName}
                  </Typography>
                  {result.representativeName && (
                    <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', mt: 0.25 }}>
                      Representante: {result.representativeName}
                    </Typography>
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
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {attendedAt ? formatTime(attendedAt) : ''}
                    </Typography>
                  </Box>
                  <Chip label={entry.code} size="small" sx={{ fontWeight: 700 }} />
                </Stack>
              ))}
            </Stack>
          )}
        </Box>
      </Grid>
    </Grid>
  )
}
