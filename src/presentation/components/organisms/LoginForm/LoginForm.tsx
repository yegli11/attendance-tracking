import { useState, type FormEvent } from 'react'
import { ZodError } from 'zod'
import { useAuth } from '@/presentation/hooks/useAuth'
import { Icon } from '@/presentation/components/atoms/Icon'
import styles from './LoginForm.module.css'

export function LoginForm() {
  const { signIn } = useAuth()
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
    } catch (err) {
      setError(
        err instanceof ZodError
          ? (err.issues[0]?.message ?? 'Datos inválidos.')
          : 'Correo o contraseña incorrectos.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label htmlFor="email">Correo electrónico</label>
        <div className={styles.inputWrapper}>
          <Icon name="mail" size={16} />
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@iglesia.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="password">Contraseña</label>
        <div className={styles.inputWrapper}>
          <Icon name="lock" size={16} />
          <input
            id="password"
            type={isPasswordVisible ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            className={styles.toggleVisibility}
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Icon name={isPasswordVisible ? 'eyeOff' : 'eye'} size={16} />
          </button>
        </div>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={isSubmitting}>
        {isSubmitting ? 'Ingresando…' : 'Iniciar sesión'}
      </button>
    </form>
  )
}
