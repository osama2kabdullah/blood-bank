import { DonorDirectory } from '@components/features/donors/DonorDirectory'
import { donorService } from '@services/api'

export function MyDonors() {
  return (
    <DonorDirectory
      title="My Donors"
      cacheKeyPrefix="my-donors"
      load={donorService.searchMine}
    />
  )
}
