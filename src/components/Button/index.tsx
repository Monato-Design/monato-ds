import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { motion } from 'motion/react'
import './styles.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'ref'> {
  variant?: ButtonVariant
  size?: ButtonSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  loading?: boolean
  fullWidth?: boolean
}

const Spinner = () => (
  <svg className="btn__spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    leftIcon,
    rightIcon,
    loading = false,
    fullWidth = false,
    disabled,
    children,
    className = '',
    type = 'button',
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading
  return (
    <motion.button
      ref={ref}
      type={type}
      className={`btn ${fullWidth ? 'w-full' : ''} ${className}`.trim()}
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      whileTap={isDisabled ? undefined : { scale: 0.98 }}
      style={{ position: 'relative' }}
      {...rest}
    >
      {loading && <Spinner />}
      {leftIcon && <span className="btn__icon" aria-hidden="true">{leftIcon}</span>}
      <span className="btn__label">{children}</span>
      {rightIcon && <span className="btn__icon" aria-hidden="true">{rightIcon}</span>}
    </motion.button>
  )
})

export default Button
