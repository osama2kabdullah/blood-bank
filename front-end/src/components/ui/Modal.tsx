import '@/styles/components/modal.css'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@utils/cn'
import { Button } from './Button'

let modalOpenCount = 0
let previousBodyOverflow = ''

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'danger'
  footer?: ReactNode
  children: ReactNode
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  size = 'md',
  variant = 'default',
  footer,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return

    if (modalOpenCount === 0) {
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    modalOpenCount += 1

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      modalOpenCount = Math.max(0, modalOpenCount - 1)
      if (modalOpenCount === 0) {
        document.body.style.overflow = previousBodyOverflow
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null
  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="modal-overlay" onMouseDown={onClose} role="presentation">
      <div
        className={cn(
          'modal',
          size !== 'md' && `modal--${size}`,
          variant === 'danger' && 'modal--danger',
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <div>
            <h3 className="modal__title">{title}</h3>
            {subtitle && <p className="modal__subtitle">{subtitle}</p>}
          </div>
          <Button type="button" variant="ghost" size="sm" className="modal__close" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </Button>
        </div>

        <div className="modal__body">{children}</div>

        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
