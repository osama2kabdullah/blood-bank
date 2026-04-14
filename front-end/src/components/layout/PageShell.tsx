import { cn } from '@utils/cn'
import type { ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
  className?: string
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main className={cn('page-wrapper', className)}>
      <div className="page-content page-enter">
        {children}
      </div>
    </main>
  )
}