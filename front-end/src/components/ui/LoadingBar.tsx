import '@/styles/components/common.css'
import { useAppStore } from '@store/appStore'

export function LoadingBar() {
  const isNavigating = useAppStore((s) => s.isNavigating)
  if (!isNavigating) return null
  return <div className="loading-bar" aria-hidden="true" />
}