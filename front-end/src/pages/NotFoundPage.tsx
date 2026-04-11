import { Link } from 'react-router-dom'
import { PageShell } from '@components/layout'
import { Button } from '@components/ui'
import { useDocumentTitle } from '@hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('404 — Not Found')

  return (
    <PageShell>
      <div className="container" style={{ paddingBlock: 'var(--cds-spacing-11)' }}>
        <div style={{ maxWidth: '32rem' }}>
          <p style={{
            fontSize: 'clamp(4rem, 12vw, 8rem)',
            fontWeight: 300,
            color: 'var(--cds-ui-04)',
            lineHeight: 1,
            marginBottom: 'var(--cds-spacing-05)',
          }}>
            404
          </p>
          <h1 style={{ fontWeight: 300, marginBottom: 'var(--cds-spacing-05)' }}>
            Page not found
          </h1>
          <p style={{ color: 'var(--cds-text-02)', marginBottom: 'var(--cds-spacing-07)', lineHeight: 1.6 }}>
            The page you're looking for doesn't exist or has been moved.
            Check the URL or navigate back to safety.
          </p>
          <div style={{ display: 'flex', gap: 'var(--cds-spacing-03)' }}>
            <Button variant="primary" onClick={() => history.back()}>
              ← Go back
            </Button>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Button variant="tertiary">Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
