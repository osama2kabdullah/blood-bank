import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '@services/api'
import { PageShell } from '@components/layout'
import { Button, Card, CardTitle, CardSubtitle } from '@components/ui'
import { RadioGroup } from '@components/ui/radio-group'
import { Selector, type SelectorOption } from '@components/ui/selector'
import { useDocumentTitle } from '@hooks/useDocumentTitle'
import LOCATIONS from '@store/locations'
import BLOOD_GROUPS from '@store/bloodGroups'
import '@styles/components/form.css'
import '@styles/pages/auth.css'

function getErrorMessage(error: unknown) {
  if (!error) return 'Registration failed. Please try again.'
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const err = error as { data?: unknown }
    if (typeof err.data === 'object' && err.data !== null && 'message' in err.data) {
      return String((err.data as { message?: unknown }).message)
    }
  }
  return 'Registration failed. Please try again.'
}

export default function RegisterPage() {
  useDocumentTitle('Register')
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [bloodGroup, setBloodGroup] = useState(BLOOD_GROUPS[0].value)
  const [location, setLocation] = useState('')
  const [lastDonation, setLastDonation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const payload: {
        name: string
        phone: string
        password: string
        blood_group: string
        location: string
        last_donation?: string
      } = {
        name,
        phone,
        password,
        blood_group: bloodGroup,
        location,
      }

      if (lastDonation) {
        payload.last_donation = lastDonation
      }

      const response = await authService.registerFull(payload)
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
            <CardTitle>Register as a donor</CardTitle>
            <CardSubtitle>Join Blood Bank BD and start helping patients find blood quickly.</CardSubtitle>
          </div>

          <form className="form auth-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                />
              </div>

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
            </div>

            <div className="form-row">
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
                  placeholder="Create a password"
                  required
                />
              </div>

              <div className="form-group" style={{ minWidth: '240px' }}>
                <RadioGroup
                  label="Blood group"
                  options={BLOOD_GROUPS as SelectorOption[]}
                  value={bloodGroup}
                  onChange={setBloodGroup}
                  name="register-blood-group"
                  className="auth-radio-group"
                />
              </div>
            </div>

            <div className="form-group">
              <Selector
                label="Location"
                options={LOCATIONS as SelectorOption[]}
                value={location || null}
                onChange={setLocation}
                placeholder="Search district"
                className="auth-selector"
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_donation" className="form-label">
                Last donation date
              </label>
              <input
                id="last_donation"
                type="date"
                className="form-input"
                value={lastDonation}
                onChange={(event) => setLastDonation(event.target.value)}
                placeholder="Optional"
              />
              <p className="form-helper">Optional, but helps patients find the best match.</p>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="form-actions">
              <Button type="submit" variant="primary" size="field" isLoading={isSubmitting}>
                Create account
              </Button>
            </div>
          </form>

          <div className="auth-switch">
            <span>Already have an account?</span>
            <Link to="/login">Login</Link>
          </div>
        </Card>
      </div>
    </PageShell>
  )
}
