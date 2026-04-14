import { Link } from 'react-router-dom'
import { PageShell } from '@components/layout'
import { Button } from '@components/ui'
import { useDocumentTitle } from '@hooks/useDocumentTitle'
import { useSeoMeta } from '@hooks/useSeoMeta'

export default function NotFoundPage() {
  useDocumentTitle('404 - Not Found')
  useSeoMeta({
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist on Blood Bank Bangaldesh.',
    noIndex: true,
  })

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
            The page you are looking for does not exist or has been moved.
            Check the URL or navigate back.
          </p>
          <div style={{ display: 'flex', gap: 'var(--cds-spacing-03)' }}>
            <Button variant="primary" onClick={() => history.back()}>
              {'<- Go back'}
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
