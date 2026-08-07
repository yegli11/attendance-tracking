import { useState, type FormEvent } from 'react'
import { ZodError } from 'zod'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import type { Category } from '@/domain/entities/Category'
import type { CreateEventInput } from '@/domain/repositories/EventRepository'

interface Props {
  categories: Category[]
  onSubmit: (input: CreateEventInput) => Promise<void>
  onCancel: () => void
}

export function CreateEventForm({ categories, onSubmit, onCancel }: Props) {
  const [name, setName] = useState('')
  const [eventDate, setEventDate] = useState('')
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
        eventDate: eventDate ? new Date(eventDate).toISOString() : '',
        categoryId: Number(categoryId),
      })
    } catch (err) {
      setError(
        err instanceof ZodError
          ? (err.issues[0]?.message ?? 'Datos inválidos.')
          : 'No se pudo crear el evento.',
      )
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

      <TextField
        id="eventDate"
        label="Fecha y hora"
        type="datetime-local"
        value={eventDate}
        onChange={(event) => setEventDate(event.target.value)}
        fullWidth
        slotProps={{ inputLabel: { shrink: true } }}
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
