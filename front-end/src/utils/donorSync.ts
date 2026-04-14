import { invalidateCacheByPrefix } from '@hooks/useFetch'

const DONOR_SYNC_EVENT = 'donors-sync'
const DONOR_SYNC_STORAGE_KEY = 'donors-sync-updated-at'

export function notifyDonorDataChanged() {
  invalidateCacheByPrefix('donors-')
  invalidateCacheByPrefix('my-donors-')

  if (typeof window === 'undefined') return

  window.dispatchEvent(new Event(DONOR_SYNC_EVENT))
  window.localStorage.setItem(DONOR_SYNC_STORAGE_KEY, String(Date.now()))
}

export function subscribeDonorDataChanged(onChanged: () => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const handleEvent = () => onChanged()
  const handleStorage = (event: StorageEvent) => {
    if (event.key === DONOR_SYNC_STORAGE_KEY) {
      onChanged()
    }
  }

  window.addEventListener(DONOR_SYNC_EVENT, handleEvent)
  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener(DONOR_SYNC_EVENT, handleEvent)
    window.removeEventListener('storage', handleStorage)
  }
}
