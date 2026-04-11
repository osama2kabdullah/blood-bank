import { PageShell } from '@components/layout'
import { Button, Card, CardTitle } from '@components/ui'
import { useDocumentTitle } from '@hooks/useDocumentTitle'
import { useTheme } from '@hooks/useTheme'
import { env } from '@utils/env'

export default function SettingsPage() {
  useDocumentTitle('Settings')
  const { theme, setTheme } = useTheme()

  return (
    <PageShell>
      <div className="container container--md">
        <div style={{ paddingBottom: 'var(--cds-spacing-07)' }}>
          <h1 style={{ fontWeight: 300, marginBottom: 'var(--cds-spacing-03)' }}>Settings</h1>
          <p style={{ color: 'var(--cds-text-02)' }}>Configure your application preferences</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cds-spacing-05)' }}>

          {/* Appearance */}
          <Card>
            <CardTitle style={{ marginBottom: 'var(--cds-spacing-05)' }}>Appearance</CardTitle>
            <div className="form-group">
              <label className="form-label">Theme</label>
              <div style={{ display: 'flex', gap: 'var(--cds-spacing-03)' }}>
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <Button
                    key={t}
                    variant={theme === t ? 'primary' : 'tertiary'}
                    size="sm"
                    onClick={() => setTheme(t)}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {t === 'system' ? '⚙ System' : t === 'dark' ? '🌙 Dark' : '☀ Light'}
                  </Button>
                ))}
              </div>
              <p className="form-helper">Applies immediately and persists across sessions.</p>
            </div>
          </Card>

          {/* Preferences */}
          <Card>
            <CardTitle style={{ marginBottom: 'var(--cds-spacing-05)' }}>Notifications</CardTitle>
            {[
              { label: 'Email notifications', id: 'email-notif' },
              { label: 'Browser push notifications', id: 'push-notif' },
              { label: 'Weekly digest', id: 'digest' },
            ].map(({ label, id }) => (
              <div key={id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBlock: 'var(--cds-spacing-04)',
                borderBottom: '1px solid var(--cds-ui-03)',
              }}>
                <label htmlFor={id} style={{ fontSize: 'var(--cds-body-short-01-font-size)', cursor: 'pointer' }}>
                  {label}
                </label>
                <input
                  type="checkbox"
                  id={id}
                  defaultChecked={id === 'email-notif'}
                  style={{ width: '1rem', height: '1rem', cursor: 'pointer', accentColor: 'var(--cds-interactive-01)' }}
                />
              </div>
            ))}
          </Card>

          {/* System info */}
          <Card style={{ background: 'var(--cds-ui-02)' }}>
            <CardTitle style={{ marginBottom: 'var(--cds-spacing-05)' }}>System Information</CardTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--cds-spacing-04)' }}>
              {[
                ['Version', env.appVersion],
                ['Environment', env.appEnv],
                ['API Base', env.apiBaseUrl],
                ['Build', import.meta.env.MODE],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 'var(--cds-spacing-07)' }}>
                  <span style={{ fontSize: 'var(--cds-label-01-font-size)', color: 'var(--cds-text-02)', minWidth: '8rem', letterSpacing: '0.32px' }}>{k}</span>
                  <code style={{ fontFamily: 'var(--cds-font-family-mono)', fontSize: 'var(--cds-code-01-font-size)' }}>{v}</code>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ paddingBottom: 'var(--cds-spacing-09)' }}>
            <Button variant="danger" size="sm" onClick={() => { localStorage.clear(); window.location.reload() }}>
              Clear All Data
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
