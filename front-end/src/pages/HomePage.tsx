import { PageShell } from '@components/layout'
import { useDocumentTitle } from '@hooks/useDocumentTitle'
import { useSeoMeta } from '@hooks/useSeoMeta'
import { DonorDirectory } from '@components/features/donors/DonorDirectory'
import { donorService } from '@services/api'

export default function HomePage() {
  useDocumentTitle('Find Donors')
  useSeoMeta({
    title: 'Find Donors',
    description: 'Search blood donors by blood group and location across Bangladesh on Blood Bank Bangaldesh.',
    path: '/',
    type: 'website',
  })

  return (
    <PageShell>
      <div className="container">
        <DonorDirectory
          title="Find Donors"
          titleAs="h1"
          cacheKeyPrefix="donors"
          load={donorService.search}
        />
      </div>
    </PageShell>
  )
}
