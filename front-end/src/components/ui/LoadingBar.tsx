import '@/styles/components/common.css'
import { useNavigation } from 'react-router-dom'

export function LoadingBar() {
  const navigation = useNavigation()
  const isNavigating = navigation.state !== 'idle'
  if (!isNavigating) return null
  return <div className="loading-bar" aria-hidden="true" />
}
