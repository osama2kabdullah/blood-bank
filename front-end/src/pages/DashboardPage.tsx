import { PageShell } from '@components/layout'
import { Card, CardTitle, CardSubtitle, Tag, Skeleton } from '@components/ui'
import { useDocumentTitle } from '@hooks/useDocumentTitle'
import { postService } from '@services/api'
import { useFetch } from '@hooks/useFetch'

const STATS = [
  { label: 'Total Posts', value: '100', delta: '+12%', color: 'blue' as const },
  { label: 'Active Users', value: '2,847', delta: '+4.3%', color: 'green' as const },
  { label: 'API Latency', value: '18ms', delta: '-2ms', color: 'cyan' as const },
  { label: 'Cache Hit Rate', value: '94%', delta: '+1.2%', color: 'teal' as const },
]

export default function DashboardPage() {
  useDocumentTitle('Dashboard')

  const { data: posts, isLoading, isError, refetch } = useFetch(
    'dashboard-posts',
    () => postService.getAll(1, 5),
    { cacheTtl: 120_000 },
  )

  return (
    <PageShell>
      <div className="container">
        <div style={{ paddingBottom: 'var(--cds-spacing-07)' }}>
          <h1 style={{ fontWeight: 300, marginBottom: 'var(--cds-spacing-03)' }}>Dashboard</h1>
          <p style={{ color: 'var(--cds-text-02)' }}>Real-time metrics and recent activity</p>
        </div>

        {/* Stats */}
        <section style={{ marginBottom: 'var(--cds-spacing-07)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--cds-spacing-05)' }}>
            {STATS.map((stat) => (
              <Card key={stat.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--cds-spacing-05)' }}>
                  <p style={{ fontSize: 'var(--cds-label-01-font-size)', color: 'var(--cds-text-02)', letterSpacing: '0.32px' }}>
                    {stat.label}
                  </p>
                  <Tag color={stat.color}>{stat.delta}</Tag>
                </div>
                <p style={{ fontSize: 'var(--cds-productive-heading-05-font-size)', fontWeight: 300 }}>
                  {stat.value}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent posts */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--cds-spacing-05)' }}>
            <h2 style={{ fontWeight: 400, fontSize: 'var(--cds-productive-heading-03-font-size)' }}>Recent Posts</h2>
            <button
              onClick={() => refetch()}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--cds-link-01)', fontSize: 'var(--cds-body-short-01-font-size)',
              }}
            >
              Refresh
            </button>
          </div>

          {isError && (
            <div style={{
              padding: 'var(--cds-spacing-05)',
              background: 'var(--cds-notification-error-bg)',
              borderLeft: '3px solid var(--cds-support-01)',
              marginBottom: 'var(--cds-spacing-05)',
            }}>
              Failed to load posts.{' '}
              <button onClick={() => refetch()} style={{ color: 'var(--cds-link-01)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Try again
              </button>
            </div>
          )}

          <div style={{ border: '1px solid var(--cds-ui-03)' }}>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} style={{ padding: 'var(--cds-spacing-05)', borderBottom: '1px solid var(--cds-ui-03)' }}>
                    <Skeleton variant="title" style={{ width: '50%', marginBottom: 'var(--cds-spacing-02)' }} />
                    <Skeleton variant="text" style={{ width: '80%' }} />
                  </div>
                ))
              : posts?.map((post) => (
                  <div
                    key={post.id}
                    style={{
                      padding: 'var(--cds-spacing-05)',
                      borderBottom: '1px solid var(--cds-ui-03)',
                      cursor: 'pointer',
                      transition: 'background var(--cds-duration-fast-01) var(--cds-standard)',
                    }}
                    onClick={() => window.location.href = `/posts/${post.id}`}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--cds-hover-row)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <CardTitle style={{ fontSize: 'var(--cds-body-short-01-font-size)' }}>
                        {post.title}
                      </CardTitle>
                      <span style={{ fontSize: 'var(--cds-label-01-font-size)', color: 'var(--cds-text-03)' }}>
                        #{post.id}
                      </span>
                    </div>
                    <CardSubtitle style={{ marginTop: 'var(--cds-spacing-02)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {post.body}
                    </CardSubtitle>
                  </div>
                ))}
          </div>
        </section>

        {/* Progress bars demo */}
        <section style={{ marginTop: 'var(--cds-spacing-07)', paddingBottom: 'var(--cds-spacing-09)' }}>
          <h2 style={{ fontWeight: 400, fontSize: 'var(--cds-productive-heading-03-font-size)', marginBottom: 'var(--cds-spacing-06)' }}>
            System Health
          </h2>
          <Card>
            {[
              { label: 'CPU Usage', value: 34 },
              { label: 'Memory', value: 61 },
              { label: 'Disk I/O', value: 22 },
              { label: 'Network', value: 78 },
            ].map((item) => (
              <div key={item.label} style={{ marginBottom: 'var(--cds-spacing-05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--cds-spacing-02)' }}>
                  <span style={{ fontSize: 'var(--cds-label-01-font-size)', color: 'var(--cds-text-02)' }}>{item.label}</span>
                  <span style={{ fontSize: 'var(--cds-label-01-font-size)', fontWeight: 600 }}>{item.value}%</span>
                </div>
                <div className="progress">
                  <div className="progress__bar" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </Card>
        </section>
      </div>
    </PageShell>
  )
}
