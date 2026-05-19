import React from 'react'
import type { IconProps } from '../Icon'

export function ClipboardCopyIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path fillRule="evenodd" clipRule="evenodd" d="M20.1 8.34C20.1 7.88 19.77 7.5 19.37 7.5H9.13002C8.73002 7.5 8.40002 7.88 8.40002 8.34V20.16C8.40002 20.62 8.73002 21 9.13002 21H19.37C19.77 21 20.1 20.62 20.1 20.16V8.34ZM18.64 9.19V19.31H9.86002V9.19H18.64Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M15.6 3.84C15.6 3.38 15.27 3 14.87 3H4.63002C4.23002 3 3.90002 3.38 3.90002 3.84V15.66C3.90002 16.12 4.23002 16.5 4.63002 16.5H6.82002V14.81H5.36002V4.69H14.14V6.37H15.6V3.84Z" fill="currentColor"/>
    </svg>
  )
}
