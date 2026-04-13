import { PageShell } from '@components/layout'
import { Card, CardTitle, CardSubtitle, Tag, Skeleton } from '@components/ui'
import { useDocumentTitle } from '@hooks/useDocumentTitle'
import { useFetch } from '@hooks/useFetch'

export default function DashboardPage() {
  useDocumentTitle('Dashboard')

  return (
    <PageShell>
      <div className="container">
      </div>
    </PageShell>
  )
}
