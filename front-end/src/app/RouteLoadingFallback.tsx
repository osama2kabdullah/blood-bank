import { Spinner } from '@components/ui'

export function RouteLoadingFallback() {
  return (
    <div
      style={{
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--cds-spacing-04)',
        padding: 'var(--cds-spacing-09)',
        color: 'var(--cds-text-02)',
      }}
      role="status"
      aria-live="polite"
    >
      <Spinner size="lg" />
      <p style={{ margin: 0 }}>Loading page...</p>
    </div>
  )
}
