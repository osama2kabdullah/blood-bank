import { PageShell } from '@components/layout'
import { useDocumentTitle } from '@hooks/useDocumentTitle'
import { DonorDirectory } from '@components/features/donors/DonorDirectory'
import { donorService } from '@services/api'

export default function HomePage() {
  useDocumentTitle('Find Donors')

  return (
    <PageShell>
      <div className="container">
        <DonorDirectory
          title="Find Donors"
          cacheKeyPrefix="donors"
          load={donorService.search}
        />
      </div>
    </PageShell>
  )
}
