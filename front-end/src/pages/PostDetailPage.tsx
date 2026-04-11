import { useParams, Link } from 'react-router-dom'
import { PageShell } from '@components/layout'
import { Button, Skeleton, Notification } from '@components/ui'
import { useDocumentTitle } from '@hooks/useDocumentTitle'
import { postService } from '@services/api'
import { useFetch } from '@hooks/useFetch'

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const postId = Number(id)

  const { data: post, isLoading, isError } = useFetch(
    `post-${postId}`,
    () => postService.getById(postId),
    { cacheTtl: 300_000 },
  )

  useDocumentTitle(post?.title ?? 'Post')

  return (
    <PageShell>
      <div className="container container--md">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/" className="breadcrumb__link">Home</Link>
          <span className="breadcrumb__separator" aria-hidden="true">/</span>
          <Link to="/posts" className="breadcrumb__link">Posts</Link>
          <span className="breadcrumb__separator" aria-hidden="true">/</span>
          <span className="breadcrumb__current">{isLoading ? '…' : `Post ${id}`}</span>
        </nav>

        {isError && (
          <Notification type="error" title="Post not found" message="This post could not be loaded." />
        )}

        {isLoading ? (
          <article>
            <Skeleton variant="title" style={{ width: '80%', height: '2rem', marginBottom: 'var(--cds-spacing-07)' }} />
            <Skeleton variant="text" />
            <Skeleton variant="text" />
            <Skeleton variant="text" style={{ width: '70%' }} />
          </article>
        ) : post ? (
          <article style={{ paddingBottom: 'var(--cds-spacing-11)' }}>
            <header style={{ marginBottom: 'var(--cds-spacing-07)' }}>
              <p style={{
                fontSize: 'var(--cds-label-01-font-size)',
                color: 'var(--cds-text-03)',
                letterSpacing: '0.32px',
                marginBottom: 'var(--cds-spacing-03)',
              }}>
                POST #{post.id} · USER #{post.userId}
              </p>
              <h1 style={{ fontWeight: 300, lineHeight: 1.3, fontSize: 'var(--cds-productive-heading-05-font-size)' }}>
                {post.title}
              </h1>
            </header>

            <hr className="divider" />

            <div style={{
              fontSize: 'var(--cds-body-long-01-font-size)',
              lineHeight: 'var(--cds-body-long-01-line-height)',
              color: 'var(--cds-text-01)',
              maxWidth: '60ch',
              paddingBlock: 'var(--cds-spacing-07)',
            }}>
              {post.body.split('\n').map((line, i) => (
                <p key={i} style={{ marginBottom: 'var(--cds-spacing-05)' }}>{line}</p>
              ))}
            </div>

            <Button variant="tertiary" onClick={() => history.back()}>
              ← Back to Posts
            </Button>
          </article>
        ) : null}
      </div>
    </PageShell>
  )
}
