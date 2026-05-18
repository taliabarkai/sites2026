import Link from 'next/link'
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary'
export type ButtonSize = 'default' | 'compact' | 'iconOnly'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  className?: string
}

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  href,
  className,
  type = 'button',
  disabled,
  ...rest
}: ButtonProps) {
  const classes = joinClasses(
    styles.base,
    variant === 'primary' ? styles.primary : styles.secondary,
    size === 'compact' && styles.compact,
    size === 'iconOnly' && styles.iconOnly,
    className,
  )

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={classes}
        onClick={rest.onClick as MouseEventHandler<HTMLAnchorElement> | undefined}
      >
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {children}
    </button>
  )
}
