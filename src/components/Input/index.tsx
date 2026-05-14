import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import './styles.css'

export type InputVariant = 'default' | 'filled' | 'ghost'
export type InputSize = 'sm' | 'md' | 'lg'
export type InputValidation = 'error' | 'success'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  helperText?: string
  errorText?: string
  successText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  variant?: InputVariant
  size?: InputSize
  validation?: InputValidation
  fullWidth?: boolean
}

const EyeIcon = ({ off = false }: { off?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <line x1="3" y1="3" x2="21" y2="21" />}
  </svg>
)

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label, helperText, errorText, successText,
    leftIcon, rightIcon,
    variant = 'default', size = 'md', validation,
    fullWidth = false,
    type = 'text', id, className = '', disabled, required,
    ...rest
  }, ref,
) {
  const reactId = useId()
  const inputId = id ?? `input-${reactId}`
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type

  const state: InputValidation | undefined = errorText ? 'error' : successText ? 'success' : validation
  const message = errorText ?? successText ?? helperText
  const messageId = message ? `${inputId}-msg` : undefined

  const trailing = isPassword ? (
    <button type="button" className="input__toggle" tabIndex={-1}
      onClick={() => setShowPassword(s => !s)}
      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
      <EyeIcon off={showPassword} />
    </button>
  ) : rightIcon ? <span className="input__icon" aria-hidden="true">{rightIcon}</span> : null

  return (
    <div className={`input-field ${fullWidth ? 'w-full' : ''} ${className}`.trim()} data-state={state}>
      {label && (
        <label htmlFor={inputId} className="input-field__label">
          {label}{required && <span className="input-field__required" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="input" data-variant={variant} data-size={size} data-disabled={disabled || undefined}>
        {leftIcon && <span className="input__icon" aria-hidden="true">{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          type={effectiveType}
          className="input__control"
          disabled={disabled}
          required={required}
          aria-invalid={state === 'error' || undefined}
          aria-describedby={messageId}
          {...rest}
        />
        {trailing}
      </div>
      {message && <p id={messageId} className="input-field__message">{message}</p>}
    </div>
  )
})

export default Input
