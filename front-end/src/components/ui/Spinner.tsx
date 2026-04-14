import '@/styles/components/common.css'
import { cn } from '@utils/cn'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span
      className={cn(
        'spinner',
        size === 'sm' && 'spinner--sm',
        size === 'lg' && 'spinner--lg',
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  )
}