import React from 'react'
import type { IconProps } from '../Icon'

export function PersonIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path fillRule="evenodd" clipRule="evenodd" d="M12 11.5C13.66 11.5 15 10.16 15 8.5C15 6.84 13.66 5.5 12 5.5C10.34 5.5 9 6.84 9 8.5C9 10.16 10.34 11.5 12 11.5ZM16.5 8.5C16.5 10.99 14.49 13 12 13C9.51 13 7.5 10.99 7.5 8.5C7.5 6.01 9.51 4 12 4C14.49 4 16.5 6.01 16.5 8.5Z" fill="currentColor"/>
<path fillRule="evenodd" clipRule="evenodd" d="M17.5 20V18C17.5 17.28 17.25 16.62 16.85 16.16C16.45 15.71 15.96 15.5 15.5 15.5H8.5C8.04 15.5 7.55 15.71 7.15 16.16C6.75 16.62 6.5 17.28 6.5 18V20H5V18C5 16.94 5.37 15.92 6.03 15.17C6.68 14.42 7.57 14 8.5 14H15.5C16.43 14 17.32 14.42 17.97 15.17C18.63 15.92 19 16.94 19 18V20H17.5Z" fill="currentColor"/>
    </svg>
  )
}
