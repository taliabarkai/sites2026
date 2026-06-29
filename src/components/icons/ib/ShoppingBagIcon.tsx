import React from 'react'
import type { IconProps } from '../Icon'

export function ShoppingBagIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color }}
    >
      <path fillRule="evenodd" clipRule="evenodd" d="M16.7777 6.36691H19.8774L21.6442 21.8541H2.37L4.13686 6.36691H6.99845C7.18443 3.96772 9.34618 2.146 11.8881 2.146C14.43 2.146 16.5918 3.96772 16.7777 6.36691ZM15.5721 6.36691C15.3873 4.7074 13.8502 3.346 11.8881 3.346C9.92594 3.346 8.38887 4.7074 8.20412 6.36691H15.5721ZM3.71468 20.6541L5.20774 7.56691H18.8065L20.2996 20.6541H3.71468Z" fill="currentColor"/>
    </svg>
  )
}
