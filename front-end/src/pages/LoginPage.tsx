import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '@services/api'
import { PageShell } from '@components/layout'
import { Button, Card, CardTitle, CardSubtitle } from '@components/ui'
import { useDocumentTitle } from '@hooks/useDocumentTitle'
import '@styles/components/form.css'
import '@styles/pages/auth.css'

function getErrorMessage(error: unknown) {
  if (!error) return 'Login failed. Please try again.'
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const err = error as { data?: unknown }
    if (typeof err.data === 'object' && err.data !== null && 'message' in err.data) {
      return String((err.data as { message?: unknown }).message)
    }
  }
  return 'Login failed. Please try again.'
}

export default function LoginPage() {
  useDocumentTitle('Login')
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await authService.login({ phone, password })
      window.localStorage.setItem('authToken', response.data.token)
      window.localStorage.setItem('authUser', JSON.stringify(response.data.user))
      window.dispatchEvent(new Event('auth-change'))
      navigate('/dashboard')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell>
      <div className="auth-page">
        <Card className="auth-card">
          <div className="auth-card-header">
            <CardTitle>Welcome back</CardTitle>
            <CardSubtitle>Login to manage donors and view your dashboard.</CardSubtitle>
          </div>

          <form className="form auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="phone" className="form-label form-label--required">
                Phone number
              </label>
              <input
                id="phone"
                type="tel"
                className="form-input"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="01XXXXXXXXX"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label form-label--required">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="form-actions">
              <Button type="submit" variant="primary" size="field" isLoading={isSubmitting}>
                Login
              </Button>
            </div>
          </form>

          <div className="auth-switch">
            <span>New here?</span>
            <Link to="/register">Create an account</Link>
          </div>
        </Card>
      </div>
    </PageShell>
  )
}
