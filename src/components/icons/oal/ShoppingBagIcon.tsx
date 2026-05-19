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
      <path fillRule="evenodd" clipRule="evenodd" d="M9.78 7.58C9.78 6.34 10.69 5.43 11.69 5.43C12.68 5.43 13.6 6.34 13.6 7.58V8.54H9.78V7.58ZM8.34 8.54V7.58C8.34 5.66 9.78 4 11.69 4C13.59 4 15.03 5.66 15.03 7.58V8.54H16.94H18.37V9.97V18.57V20H16.94H6.43H5V18.57V9.97V8.54H6.43H8.34ZM6.43 18.57V9.97H16.94V18.57H6.43Z" fill="currentColor"/>
    </svg>
  )
}
