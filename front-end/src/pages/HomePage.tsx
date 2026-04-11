import { Link } from 'react-router-dom'
import { PageShell } from '@components/layout'
import { Button, Card, CardTitle, CardSubtitle, Tag } from '@components/ui'
import { useDocumentTitle } from '@hooks/useDocumentTitle'

const FEATURES = [
  { icon: '⚡', title: 'Vite + React 18', desc: 'Blazing fast HMR and build with ESNext target.', tag: 'Performance', color: 'blue' as const },
  { icon: '🔷', title: 'TypeScript', desc: 'Strict types throughout — no anys, no surprises.', tag: 'DX', color: 'cyan' as const },
  { icon: '🧱', title: 'IBM Carbon Design', desc: 'Production-grade design tokens. Zero CSS framework imports.', tag: 'Design', color: 'teal' as const },
  { icon: '🌐', title: 'Cloudflare Pages', desc: 'Edge-ready build config with proper SPA fallback routing.', tag: 'Deploy', color: 'green' as const },
  { icon: '📦', title: 'Code Splitting', desc: 'Every page is a separate chunk. Loaded on demand.', tag: 'Perf', color: 'purple' as const },
  { icon: '📡', title: 'PWA Ready', desc: 'Offline support, installable, background sync via Workbox.', tag: 'PWA', color: 'magenta' as const },
]

export default function HomePage() {
  useDocumentTitle('Home')

  return (
    <PageShell>
      <div className="container">
        {/* Hero */}
        <section style={{ paddingBlock: 'var(--cds-spacing-11)', maxWidth: '42rem' }}>
          <div style={{ marginBottom: 'var(--cds-spacing-05)' }}>
            <Tag color="blue">Production Boilerplate</Tag>
          </div>
          <h1 style={{ marginBottom: 'var(--cds-spacing-06)', fontWeight: 300, lineHeight: 1.2 }}>
            React + Cloudflare Pages
          </h1>
          <p style={{
            fontSize: 'var(--cds-productive-heading-03-font-size)',
            color: 'var(--cds-text-02)',
            lineHeight: 1.6,
            marginBottom: 'var(--cds-spacing-07)',
          }}>
            A production-grade React boilerplate engineered for performance,
            scalability, and edge deployment on Cloudflare Pages.
          </p>
          <div className="flex gap-3">
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <Button variant="primary">View Dashboard</Button>
            </Link>
            <Link to="/posts" style={{ textDecoration: 'none' }}>
              <Button variant="tertiary">Browse Posts</Button>
            </Link>
          </div>
        </section>

        <hr className="divider" />

        {/* Features grid */}
        <section style={{ paddingBlock: 'var(--cds-spacing-09)' }}>
          <h2 style={{ fontWeight: 300, marginBottom: 'var(--cds-spacing-07)' }}>
            What&apos;s included
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--cds-spacing-05)',
          }}>
            {FEATURES.map((f) => (
              <Card key={f.title}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--cds-spacing-05)' }}>
                  <span style={{ fontSize: '1.5rem' }} aria-hidden="true">{f.icon}</span>
                  <Tag color={f.color}>{f.tag}</Tag>
                </div>
                <CardTitle style={{ marginBottom: 'var(--cds-spacing-03)' }}>{f.title}</CardTitle>
                <CardSubtitle>{f.desc}</CardSubtitle>
              </Card>
            ))}
          </div>
        </section>

        {/* Stack overview */}
        <section style={{ paddingBlock: 'var(--cds-spacing-07)', paddingBottom: 'var(--cds-spacing-11)' }}>
          <Card style={{ background: 'var(--cds-ui-02)' }}>
            <h3 style={{ fontWeight: 400, marginBottom: 'var(--cds-spacing-05)' }}>Architecture at a glance</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--cds-spacing-05)' }}>
              {[
                ['Build Tool', 'Vite 6'],
                ['Framework', 'React 18'],
                ['Language', 'TypeScript 5'],
                ['Routing', 'React Router v6'],
                ['State', 'Zustand 4'],
                ['Styling', 'Raw CSS + Carbon Tokens'],
                ['PWA', 'Workbox / vite-plugin-pwa'],
                ['Deploy', 'Cloudflare Pages'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p style={{ fontSize: 'var(--cds-label-01-font-size)', color: 'var(--cds-text-02)', marginBottom: '2px', letterSpacing: '0.32px' }}>{label}</p>
                  <p style={{ fontWeight: 600, fontSize: 'var(--cds-body-short-01-font-size)' }}>{value}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </PageShell>
  )
}
