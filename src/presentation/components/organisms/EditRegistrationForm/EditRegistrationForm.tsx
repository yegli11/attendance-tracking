import { useState, type FormEvent } from 'react'
import { ZodError } from 'zod'
import dayjs, { type Dayjs } from 'dayjs'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import type { Gender } from '@/domain/entities/Gender'
import type { RosterEntry } from '@/domain/entities/RosterEntry'
import { updateRegistration } from '@/application/useCases/updateRegistration'
import { supabaseRegistrationRepository } from '@/infrastructure/supabase/repositories/SupabaseRegistrationRepository'
import { useToast } from '@/presentation/hooks/useToast'

interface Props {
  entry: RosterEntry
  genders: Gender[]
  requiresRepresentative: boolean
  onUpdated: (entry: RosterEntry) => void
  onCancel: () => void
}

export function EditRegistrationForm({ entry, genders, requiresRepresentative, onUpdated, onCancel }: Props) {
  const { showSuccess, showError } = useToast()
  const [firstName, setFirstName] = useState(entry.firstName)
  const [lastName, setLastName] = useState(entry.lastName)
  const [birthdate, setBirthdate] = useState<Dayjs | null>(dayjs(entry.birthdate))
  const [genderId, setGenderId] = useState<number | null>(
    genders.find((gender) => gender.name === entry.genderName)?.id ?? null,
  )
  const [representativeName, setRepresentativeName] = useState(entry.representativeName ?? '')
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
        birthdate: birthdate?.isValid() ? birthdate.format('YYYY-MM-DD') : '',
        genderId: genderId ?? 0,
        phoneNumber,
        alternatePhoneNumber: alternatePhoneNumber || null,
        representativeName: requiresRepresentative ? representativeName : null,
        requiresRepresentative,
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

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <DatePicker
          label="Fecha de nacimiento"
          value={birthdate}
          onChange={(value) => setBirthdate(value)}
          disableFuture
          slotProps={{
            textField: { fullWidth: true, slotProps: { inputLabel: { shrink: true } } },
          }}
        />
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
