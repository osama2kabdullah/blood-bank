import { cn } from '@utils/cn'
import type { HTMLAttributes } from 'react'

type TagColor = 'blue' | 'cyan' | 'teal' | 'green' | 'magenta' | 'red' | 'purple' | 'warm-gray' | 'cool-gray'

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  color?: TagColor
}

export function Tag({ color = 'blue', children, className, ...props }: TagProps) {
  return (
    <span className={cn('tag', `tag--${color}`, className)} {...props}>
      {children}
    </span>
  )
}
