import { useState, type FormEvent } from 'react'
import { ZodError } from 'zod'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import { useAuth } from '@/presentation/hooks/useAuth'
import { useToast } from '@/presentation/hooks/useToast'
import { Icon } from '@/presentation/components/atoms/Icon'

export function LoginForm() {
  const { signIn } = useAuth()
  const { showSuccess, showError } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      await signIn({ email, password })
      showSuccess('Bienvenido de vuelta.')
    } catch (err) {
      const message =
        err instanceof ZodError ? (err.issues[0]?.message ?? 'Datos inválidos.') : 'Correo o contraseña incorrectos.'
      setError(message)
      showError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Stack component="form" onSubmit={handleSubmit} noValidate spacing={2.5}>
      <TextField
        id="email"
        label="Correo electrónico"
        type="email"
        autoComplete="email"
        placeholder="tu@iglesia.com"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Icon name="mail" size={16} />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        id="password"
        label="Contraseña"
        type={isPasswordVisible ? 'text' : 'password'}
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Icon name="lock" size={16} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setIsPasswordVisible((visible) => !visible)}
                  aria-label={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  edge="end"
                  size="small"
                >
                  <Icon name={isPasswordVisible ? 'eyeOff' : 'eye'} size={16} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Button type="submit" variant="contained" size="large" disabled={isSubmitting} fullWidth>
        {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
      </Button>
    </Stack>
  )
}
