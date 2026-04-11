import { SkeletonCard } from '@components/ui'

export function RouteLoadingFallback() {
  return (
    <div
      style={{
        padding: 'var(--cds-spacing-09) var(--cds-spacing-07)',
        maxWidth: 'var(--container-lg)',
        margin: '0 auto',
      }}
    >
      <div style={{ height: '2rem', width: '40%', marginBottom: 'var(--cds-spacing-07)' }}
           className="skeleton" />
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}
