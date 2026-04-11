import { cn } from '@utils/cn'

type NotificationType = 'info' | 'success' | 'warning' | 'error'

interface NotificationProps {
  type?: NotificationType
  title?: string
  message: string
  className?: string
}

const icons: Record<NotificationType, string> = {
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✕',
}

export function Notification({ type = 'info', title, message, className }: NotificationProps) {
  return (
    <div
      className={cn('notification', `notification--${type}`, className)}
      role="alert"
      aria-live="polite"
    >
      <span aria-hidden="true">{icons[type]}</span>
      <div>
        {title && <p className="notification__title">{title}</p>}
        <p className="notification__message">{message}</p>
      </div>
    </div>
  )
}
