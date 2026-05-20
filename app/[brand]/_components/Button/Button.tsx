import Link from 'next/link'
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'upsell-primary' | 'link'
export type ButtonSize = 'default' | 'compact' | 'iconOnly'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  href?: string
  className?: string
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function variantClass(variant: ButtonVariant, s: typeof styles) {
  if (variant === 'primary') return s.primary
  if (variant === 'upsell-primary') return s.upsellPrimary
  if (variant === 'link') return s.link
  return s.secondary
}

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  href,
  className,
  type = 'button',
  disabled,
  leadingIcon,
  trailingIcon,
  ...rest
}: ButtonProps) {
  const isLink = variant === 'link'
  const classes = joinClasses(
    !isLink && styles.base,
    variantClass(variant, styles),
    !isLink && size === 'compact' && styles.compact,
    !isLink && size === 'iconOnly' && styles.iconOnly,
    className,
  )

  const content = (
    <>
      {leadingIcon}
      {children}
      {trailingIcon}
    </>
  )

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={classes}
        onClick={rest.onClick as MouseEventHandler<HTMLAnchorElement> | undefined}
      >
        {content}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {content}
    </button>
  )
}
