import { useState, type FormEvent } from 'react'
import { ZodError } from 'zod'
import type { Dayjs } from 'dayjs'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import type { Category } from '@/domain/entities/Category'
import type { CreateEventInput } from '@/domain/repositories/EventRepository'
import { useToast } from '@/presentation/hooks/useToast'

interface Props {
  categories: Category[]
  onSubmit: (input: CreateEventInput) => Promise<void>
  onCancel: () => void
}

export function CreateEventForm({ categories, onSubmit, onCancel }: Props) {
  const { showSuccess, showError } = useToast()
  const [name, setName] = useState('')
  const [eventDate, setEventDate] = useState<Dayjs | null>(null)
  const [location, setLocation] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0] ? String(categories[0].id) : '')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await onSubmit({
        name,
        eventDate: eventDate?.isValid() ? eventDate.toISOString() : '',
        categoryId: Number(categoryId),
        location: location.trim() || null,
      })
      showSuccess(`Evento "${name}" creado correctamente.`)
    } catch (err) {
      const message =
        err instanceof ZodError ? (err.issues[0]?.message ?? 'Datos inválidos.') : 'No se pudo crear el evento.'
      setError(message)
      showError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Stack component="form" onSubmit={handleSubmit} noValidate spacing={2.5} sx={{ pt: 1 }}>
      <TextField
        id="eventName"
        label="Nombre del evento"
        value={name}
        onChange={(event) => setName(event.target.value)}
        fullWidth
      />

      <DateTimePicker
        label="Fecha y hora"
        value={eventDate}
        onChange={(value) => setEventDate(value)}
        ampm
        slotProps={{
          textField: { fullWidth: true, id: 'eventDate', slotProps: { inputLabel: { shrink: true } } },
        }}
      />

      <TextField
        id="eventCategory"
        select
        label="Categoría"
        value={categoryId}
        onChange={(event) => setCategoryId(event.target.value)}
        fullWidth
      >
        {categories.map((category) => (
          <MenuItem key={category.id} value={String(category.id)}>
            {category.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        id="eventLocation"
        label="Lugar (opcional)"
        placeholder="Salón principal"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        fullWidth
      />

      {error && <Alert severity="error">{error}</Alert>}

      <DialogActions sx={{ px: 0, pb: 0 }}>
        <Button onClick={onCancel} color="inherit">
          Cancelar
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Creando…' : 'Crear evento'}
        </Button>
      </DialogActions>
    </Stack>
  )
}
