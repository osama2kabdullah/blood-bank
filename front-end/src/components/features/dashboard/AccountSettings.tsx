import '@/styles/components/form.css'
import '@/styles/components/button.css'
import '@/styles/components/card.css'
import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@services/api'
import { Button } from '@components/ui'
import { Card } from '@components/ui'
import { Notification } from '@components/ui'

interface AccountSettingsProps {
  user: { id: string; name: string; phone: string }
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const [profileName, setProfileName] = useState(user.name)
  const [profilePhone, setProfilePhone] = useState(user.phone)
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [profileSubmitting, setProfileSubmitting] = useState(false)

  const [passwordCurrent, setPasswordCurrent] = useState('')
  const [passwordNew, setPasswordNew] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteMsg, setDeleteMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileMsg(null)

    if (!profileName.trim() || !profilePhone.trim()) {
      setProfileMsg({ type: 'error', text: 'Full name and phone number are required.' })
      return
    }

    setProfileSubmitting(true)
    try {
      const response = await authService.updateProfile({ name: profileName, phone: profilePhone })
      const updatedUser = {
        ...JSON.parse(window.localStorage.getItem('authUser') || '{}'),
        name: profileName,
        phone: profilePhone,
      }
      window.localStorage.setItem('authUser', JSON.stringify(updatedUser))
      window.dispatchEvent(new Event('auth-change'))
      setProfileMsg({ type: 'success', text: response.data.message })
    } catch (err) {
      setProfileMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update profile.' })
    } finally {
      setProfileSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPasswordMsg(null)

    if (!passwordCurrent || !passwordNew || !passwordConfirm) {
      setPasswordMsg({ type: 'error', text: 'Please fill in all password fields.' })
      return
    }

    if (passwordNew.length < 3) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 3 characters.' })
      return
    }

    if (passwordNew !== passwordConfirm) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setPasswordSubmitting(true)
    try {
      const response = await authService.changePassword({
        current_password: passwordCurrent,
        new_password: passwordNew,
      })
      setPasswordCurrent('')
      setPasswordNew('')
      setPasswordConfirm('')
      setPasswordMsg({ type: 'success', text: response.data.message })
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to change password.' })
    } finally {
      setPasswordSubmitting(false)
    }
  }

  const handleDeleteAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setDeleteMsg(null)

    if (!deletePassword) {
      setDeleteMsg({ type: 'error', text: 'Please enter your password to confirm deletion.' })
      return
    }

    setDeleteSubmitting(true)
    try {
      await authService.deleteAccount({ password: deletePassword })
      window.localStorage.removeItem('authToken')
      window.localStorage.removeItem('authUser')
      window.dispatchEvent(new Event('auth-change'))
      navigate('/login')
    } catch (err) {
      setDeleteMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to delete account.' })
    } finally {
      setDeleteSubmitting(false)
    }
  }

  return (
    <div className="account-settings">
      <Card>
        <div className="account-settings__card">
          <h3 className="dashboard__section-title">Profile</h3>

          {profileMsg && (
            <Notification
              type={profileMsg.type}
              message={profileMsg.text}
            />
          )}

          <form className="form" onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label htmlFor="profile-name" className="form-label form-label--required">
                Full name
              </label>
              <input
                id="profile-name"
                type="text"
                className="form-input"
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                placeholder="Full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-phone" className="form-label form-label--required">
                Phone number
              </label>
              <input
                id="profile-phone"
                type="tel"
                className="form-input"
                value={profilePhone}
                onChange={(event) => setProfilePhone(event.target.value)}
                placeholder="01XXXXXXXXX"
                required
              />
            </div>

            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={profileSubmitting}
              >
                Save changes
              </Button>
            </div>
          </form>
        </div>
      </Card>

      <Card>
        <div className="account-settings__card">
          <h3 className="dashboard__section-title">Change password</h3>

          {passwordMsg && (
            <Notification
              type={passwordMsg.type}
              message={passwordMsg.text}
            />
          )}

          <form className="form" onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label htmlFor="current-password" className="form-label form-label--required">
                Current password
              </label>
              <input
                id="current-password"
                type="password"
                className="form-input"
                value={passwordCurrent}
                onChange={(event) => setPasswordCurrent(event.target.value)}
                placeholder="Current password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-password" className="form-label form-label--required">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                className="form-input"
                value={passwordNew}
                onChange={(event) => setPasswordNew(event.target.value)}
                placeholder="New password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password" className="form-label form-label--required">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="form-input"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                placeholder="Confirm password"
                required
              />
            </div>

            <div className="form-actions">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={passwordSubmitting}
              >
                Change password
              </Button>
            </div>
          </form>
        </div>
      </Card>

      <div className="danger-zone">
        <p className="danger-zone__title">Danger Zone</p>
        <p className="danger-zone__desc">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        {deleteMsg && (
          <div style={{ marginBottom: 'var(--cds-spacing-05)' }}>
            <Notification
              type={deleteMsg.type}
              message={deleteMsg.text}
            />
          </div>
        )}

        {!deleteConfirm ? (
          <Button variant="danger" size="sm" onClick={() => setDeleteConfirm(true)}>
            Delete account
          </Button>
        ) : (
          <form className="form" onSubmit={handleDeleteAccount}>
            <div className="form-group">
              <label htmlFor="delete-password" className="form-label form-label--required">
                Confirm with password
              </label>
              <input
                id="delete-password"
                type="password"
                className="form-input"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="form-actions" style={{ display: 'flex', gap: 'var(--cds-spacing-03)', alignItems: 'center' }}>
              <Button type="submit" variant="danger" size="sm" isLoading={deleteSubmitting}>
                Yes, delete my account
              </Button>
              <Button variant="ghost" size="sm" type="button" onClick={() => {
                setDeleteConfirm(false)
                setDeletePassword('')
                setDeleteMsg(null)
              }}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
