import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import './styles.css'

export type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'error' | 'info'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  pill?: boolean
  leftIcon?: ReactNode
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    variant = 'default',
    size = 'md',
    dot = false,
    pill = false,
    leftIcon,
    children,
    className = '',
    ...rest
  }, ref,
) {
  return (
    <span
      ref={ref}
      className={`badge ${className}`.trim()}
      data-variant={variant}
      data-size={size}
      data-pill={pill || undefined}
      {...rest}
    >
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {!dot && leftIcon && <span className="badge__icon" aria-hidden="true">{leftIcon}</span>}
      <span className="badge__label">{children}</span>
    </span>
  )
})

export default Badge
