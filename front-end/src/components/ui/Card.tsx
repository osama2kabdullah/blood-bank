import { cn } from '@utils/cn'
import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
}

export function Card({ interactive, children, className, ...props }: CardProps) {
  return (
    <div
      className={cn('card', interactive && 'card--interactive', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card__header', className)} {...props}>{children}</div>
}

export function CardTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('card__title', className)} {...props}>{children}</h3>
}

export function CardSubtitle({ children, className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('card__subtitle', className)} {...props}>{children}</p>
}
