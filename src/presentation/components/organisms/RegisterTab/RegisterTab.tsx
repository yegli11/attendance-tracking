import { useState, type FormEvent } from 'react'
import { ZodError } from 'zod'
import type { Dayjs } from 'dayjs'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import type { Gender } from '@/domain/entities/Gender'
import type { PaymentStatus } from '@/domain/entities/PaymentStatus'
import type { Team } from '@/domain/entities/Team'
import type { RosterEntry } from '@/domain/entities/RosterEntry'
import { registerPerson } from '@/application/useCases/registerPerson'
import { supabaseRegistrationRepository } from '@/infrastructure/supabase/repositories/SupabaseRegistrationRepository'
import { BirthdateOrAgeField, type BirthInputMode } from '@/presentation/components/molecules/BirthdateOrAgeField'
import { ageLabelForPerson } from '@/shared/utils/calculateAge'
import { teamLabel } from '@/shared/utils/teamLabel'
import { useToast } from '@/presentation/hooks/useToast'

interface Props {
  eventId: number
  genders: Gender[]
  requiresRepresentative: boolean
  requiresPaymentStatus: boolean
  onRegistered: (entry: RosterEntry) => void
}

type CodeMode = 'auto' | 'manual'
const TEAMS: Team[] = ['naranja', 'rojo', 'verde', 'azul']

export function RegisterTab({ eventId, genders, requiresRepresentative, requiresPaymentStatus, onRegistered }: Props) {
  const { showSuccess, showError } = useToast()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [birthInputMode, setBirthInputMode] = useState<BirthInputMode>('birthdate')
  const [birthdate, setBirthdate] = useState<Dayjs | null>(null)
  const [ageYears, setAgeYears] = useState('')
  const [genderId, setGenderId] = useState<number | null>(null)
  const [representativeName, setRepresentativeName] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pendiente')
  const [team, setTeam] = useState<Team | ''>('')
  const [isOnline, setIsOnline] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [alternatePhoneNumber, setAlternatePhoneNumber] = useState('')
  const [codeMode, setCodeMode] = useState<CodeMode>('auto')
  const [manualCode, setManualCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastTicket, setLastTicket] = useState<RosterEntry | null>(null)

  function resetForm() {
    setFirstName('')
    setLastName('')
    setBirthInputMode('birthdate')
    setBirthdate(null)
    setAgeYears('')
    setGenderId(null)
    setRepresentativeName('')
    setPaymentStatus('pendiente')
    setTeam('')
    setIsOnline(false)
    setPhoneNumber('')
    setAlternatePhoneNumber('')
    setCodeMode('auto')
    setManualCode('')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const entry = await registerPerson(supabaseRegistrationRepository, {
        eventId,
        firstName,
        lastName,
        birthdate: birthInputMode === 'birthdate' && birthdate?.isValid() ? birthdate.format('YYYY-MM-DD') : null,
        ageYears: birthInputMode === 'age' && ageYears.trim() !== '' ? Number(ageYears) : null,
        genderId: genderId ?? 0,
        phoneNumber,
        alternatePhoneNumber: alternatePhoneNumber || null,
        representativeName: requiresRepresentative ? representativeName : null,
        requiresRepresentative,
        paymentStatus: requiresPaymentStatus ? paymentStatus : null,
        requiresPaymentStatus,
        team: requiresRepresentative && team ? team : null,
        isOnline,
        code: codeMode === 'manual' ? manualCode : null,
      })
      setLastTicket(entry)
      onRegistered(entry)
      resetForm()
      showSuccess(`Inscripción creada · código ${entry.code}.`)
    } catch (err) {
      const message =
        err instanceof ZodError
          ? (err.issues[0]?.message ?? 'Datos inválidos.')
          : err instanceof Error
            ? err.message
            : 'No se pudo completar la inscripción.'
      setError(message)
      showError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 7 }}>
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', mb: 0.5 }}>Datos del asistente</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
            El código de entrada se genera al inscribir.
          </Typography>

          <Stack component="form" onSubmit={handleSubmit} noValidate spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Nombre" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth />
              <TextField label="Apellido" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1, width: '100%' }}>
                {requiresRepresentative ? (
                  <BirthdateOrAgeField
                    mode={birthInputMode}
                    onModeChange={setBirthInputMode}
                    birthdate={birthdate}
                    onBirthdateChange={setBirthdate}
                    ageYears={ageYears}
                    onAgeYearsChange={setAgeYears}
                  />
                ) : (
                  <DatePicker
                    label="Fecha de nacimiento"
                    value={birthdate}
                    onChange={(value) => setBirthdate(value)}
                    disableFuture
                    slotProps={{ textField: { fullWidth: true, slotProps: { inputLabel: { shrink: true } } } }}
                  />
                )}
              </Box>
              <TextField
                select
                label="Género"
                value={genderId !== null ? String(genderId) : ''}
                onChange={(e) => setGenderId(Number(e.target.value))}
                fullWidth
              >
                {genders.map((gender) => (
                  <MenuItem key={gender.id} value={String(gender.id)}>
                    {gender.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {requiresRepresentative && (
              <TextField
                label="Representante"
                placeholder="Nombre del papá, mamá o tutor"
                value={representativeName}
                onChange={(e) => setRepresentativeName(e.target.value)}
                fullWidth
              />
            )}

            {requiresRepresentative && (
              <TextField
                select
                label="Equipo"
                value={team}
                onChange={(e) => setTeam(e.target.value as Team | '')}
                fullWidth
              >
                <MenuItem value="">Sin asignar</MenuItem>
                {TEAMS.map((value) => (
                  <MenuItem key={value} value={value}>
                    {teamLabel(value)}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {requiresPaymentStatus && (
              <TextField
                select
                label="Estado de pago"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                fullWidth
              >
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="financiado">Financiado</MenuItem>
                <MenuItem value="pagado">Pagado</MenuItem>
              </TextField>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Contacto telefónico"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                fullWidth
              />
              <TextField
                label="Contacto adicional (opcional)"
                value={alternatePhoneNumber}
                onChange={(e) => setAlternatePhoneNumber(e.target.value)}
                fullWidth
              />
            </Stack>

            <FormControlLabel
              control={<Checkbox checked={isOnline} onChange={(e) => setIsOnline(e.target.checked)} />}
              label="Se inscribió por el formulario online"
              sx={{ alignSelf: 'flex-start' }}
            />

            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                Código de entrada
              </Typography>
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={codeMode}
                onChange={(_, value: CodeMode | null) => value !== null && setCodeMode(value)}
              >
                <ToggleButton value="auto">Generar automático</ToggleButton>
                <ToggleButton value="manual">Ingresar manualmente</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {codeMode === 'manual' && (
              <TextField
                label="Escribe el código"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                fullWidth
              />
            )}

            {error && <Alert severity="error">{error}</Alert>}

            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? 'Inscribiendo…' : 'Generar código e inscribir'}
            </Button>
          </Stack>
        </Box>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem', mb: 0.5 }}>Ticket de entrada</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
            {lastTicket ? 'Muéstrale o entrégale este código.' : 'Aparecerá aquí apenas inscribas.'}
          </Typography>

          {lastTicket ? (
            <Stack direction="row" sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 3 }}>
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  background: 'linear-gradient(135deg, #123A73 0%, #071B33 100%)',
                  color: 'common.white',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#4C8DFF',
                    mb: 0.75,
                  }}
                >
                  Ticket
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
                  {lastTicket.firstName} {lastTicket.lastName}
                </Typography>
                <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', mt: 0.5 }}>
                  {ageLabelForPerson(lastTicket)} · {lastTicket.genderName}
                </Typography>
                {lastTicket.team && (
                  <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', mt: 0.25 }}>
                    Equipo: {teamLabel(lastTicket.team)}
                  </Typography>
                )}
              </Box>
              <Stack
                sx={{
                  width: 96,
                  flexShrink: 0,
                  bgcolor: 'primary.main',
                  color: 'common.white',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.5,
                  p: 1,
                }}
              >
                <Typography sx={{ fontSize: '9.5px', textTransform: 'uppercase', fontWeight: 700 }}>
                  código
                </Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '1.0625rem' }}>{lastTicket.code}</Typography>
              </Stack>
            </Stack>
          ) : (
            <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
              Sin inscripción pendiente de mostrar.
            </Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  )
}
