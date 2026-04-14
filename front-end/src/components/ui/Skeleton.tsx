import '@/styles/components/common.css'
import '@/styles/components/card.css'
import { cn } from '@utils/cn'

interface SkeletonProps {
  variant?: 'text' | 'title' | 'btn' | 'card'
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ variant = 'text', className, style }: SkeletonProps) {
  return (
    <span
      className={cn('skeleton', `skeleton--${variant}`, className)}
      aria-hidden="true"
      style={style}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="card">
      <Skeleton variant="title" />
      <Skeleton variant="text" />
      <Skeleton variant="text" style={{ width: '80%' }} />
      <Skeleton variant="text" style={{ width: '60%' }} />
    </div>
  )
}