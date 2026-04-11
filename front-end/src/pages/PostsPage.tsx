import { Link } from 'react-router-dom'
import { useState } from 'react'
import { PageShell } from '@components/layout'
import { Button, SkeletonCard, Notification } from '@components/ui'
import { useDocumentTitle } from '@hooks/useDocumentTitle'
import { useDebounce } from '@hooks/useDebounce'
import { postService } from '@services/api'
import { useFetch } from '@hooks/useFetch'
import { truncate } from '@utils/format'

export default function PostsPage() {
  useDocumentTitle('Posts')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  const { data: posts, isLoading, isError, refetch } = useFetch(
    `posts-page-${page}`,
    () => postService.getAll(page, 12),
    { cacheTtl: 60_000 },
  )

  const filtered = posts?.filter((p) =>
    debouncedSearch === '' ||
    p.title.toLowerCase().includes(debouncedSearch.toLowerCase())
  ) ?? []

  return (
    <PageShell>
      <div className="container">
        <div style={{ paddingBottom: 'var(--cds-spacing-07)' }}>
          <h1 style={{ fontWeight: 300, marginBottom: 'var(--cds-spacing-03)' }}>Posts</h1>
          <p style={{ color: 'var(--cds-text-02)' }}>Browse all posts from the API</p>
        </div>

        {/* Toolbar */}
        <div style={{
          display: 'flex',
          gap: 'var(--cds-spacing-03)',
          marginBottom: 'var(--cds-spacing-06)',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <input
              type="search"
              className="form-input"
              placeholder="Search posts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search posts"
              style={{ paddingLeft: 'var(--cds-spacing-07)' }}
            />
            <span style={{
              position: 'absolute', left: 'var(--cds-spacing-03)', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--cds-text-03)', pointerEvents: 'none',
            }}>
              🔍
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            ↻ Refresh
          </Button>
        </div>

        {isError && (
          <Notification type="error" title="Failed to load" message="Could not fetch posts. Check your connection." />
        )}

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--cds-spacing-05)' }}>
          {isLoading
            ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.map((post) => (
                <Link
                  key={post.id}
                  to={`/posts/${post.id}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <div
                    className="card card--interactive"
                    style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                  >
                    <div style={{
                      fontSize: 'var(--cds-label-01-font-size)',
                      color: 'var(--cds-text-03)',
                      marginBottom: 'var(--cds-spacing-03)',
                    }}>
                      POST #{post.id}
                    </div>
                    <h3 style={{
                      fontSize: 'var(--cds-body-short-01-font-size)',
                      fontWeight: 600,
                      color: 'var(--cds-text-01)',
                      marginBottom: 'var(--cds-spacing-03)',
                      lineHeight: 1.4,
                      flex: 1,
                    }}>
                      {truncate(post.title, 80)}
                    </h3>
                    <p style={{
                      fontSize: 'var(--cds-label-01-font-size)',
                      color: 'var(--cds-text-02)',
                      lineHeight: 1.5,
                    }}>
                      {truncate(post.body, 100)}
                    </p>
                  </div>
                </Link>
              ))}
        </div>

        {/* Pagination */}
        {!isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--cds-spacing-03)',
            paddingBlock: 'var(--cds-spacing-09)',
          }}>
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              ← Previous
            </Button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 var(--cds-spacing-05)', fontSize: 'var(--cds-body-short-01-font-size)' }}>
              Page {page}
            </span>
            <Button variant="secondary" size="sm" onClick={() => setPage((p) => p + 1)}>
              Next →
            </Button>
          </div>
        )}
      </div>
    </PageShell>
  )
}
