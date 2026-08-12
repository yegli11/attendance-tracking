import { useState, type FormEvent } from 'react'
import { ZodError } from 'zod'
import dayjs, { type Dayjs } from 'dayjs'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import type { Gender } from '@/domain/entities/Gender'
import type { PaymentStatus } from '@/domain/entities/PaymentStatus'
import type { RosterEntry } from '@/domain/entities/RosterEntry'
import { updateRegistration } from '@/application/useCases/updateRegistration'
import { supabaseRegistrationRepository } from '@/infrastructure/supabase/repositories/SupabaseRegistrationRepository'
import { BirthdateOrAgeField, type BirthInputMode } from '@/presentation/components/molecules/BirthdateOrAgeField'
import { useToast } from '@/presentation/hooks/useToast'

interface Props {
  entry: RosterEntry
  genders: Gender[]
  requiresRepresentative: boolean
  requiresPaymentStatus: boolean
  onUpdated: (entry: RosterEntry) => void
  onCancel: () => void
}

export function EditRegistrationForm({
  entry,
  genders,
  requiresRepresentative,
  requiresPaymentStatus,
  onUpdated,
  onCancel,
}: Props) {
  const { showSuccess, showError } = useToast()
  const [firstName, setFirstName] = useState(entry.firstName)
  const [lastName, setLastName] = useState(entry.lastName)
  const [birthInputMode, setBirthInputMode] = useState<BirthInputMode>(entry.birthdate ? 'birthdate' : 'age')
  const [birthdate, setBirthdate] = useState<Dayjs | null>(entry.birthdate ? dayjs(entry.birthdate) : null)
  const [ageYears, setAgeYears] = useState(entry.ageYears !== null ? String(entry.ageYears) : '')
  const [genderId, setGenderId] = useState<number | null>(
    genders.find((gender) => gender.name === entry.genderName)?.id ?? null,
  )
  const [representativeName, setRepresentativeName] = useState(entry.representativeName ?? '')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(entry.paymentStatus ?? 'pendiente')
  const [phoneNumber, setPhoneNumber] = useState(entry.phoneNumber)
  const [alternatePhoneNumber, setAlternatePhoneNumber] = useState(entry.alternatePhoneNumber ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const updated = await updateRegistration(supabaseRegistrationRepository, {
        registrationId: entry.registrationId,
        personId: entry.personId,
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
      })
      onUpdated(updated)
      showSuccess('Inscripción actualizada correctamente.')
    } catch (err) {
      const message =
        err instanceof ZodError ? (err.issues[0]?.message ?? 'Datos inválidos.') : 'No se pudo actualizar la inscripción.'
      setError(message)
      showError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Stack component="form" onSubmit={handleSubmit} noValidate spacing={2.5} sx={{ pt: 1 }}>
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
          value={representativeName}
          onChange={(e) => setRepresentativeName(e.target.value)}
          fullWidth
        />
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

      {error && <Alert severity="error">{error}</Alert>}

      <DialogActions sx={{ px: 0, pb: 0 }}>
        <Button onClick={onCancel} color="inherit">
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </DialogActions>
    </Stack>
  )
}
