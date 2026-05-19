import React from 'react'
import type { IconProps } from '../Icon'

export function FilterIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path d="M20.5 7.5H3.5V8.25H20.5V7.5Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
<path d="M3.5 15.75L20.5 15.75V15L3.5 15V15.75Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
<path d="M8.5 6.5C8.5 5.67157 7.82843 5 7 5C6.17157 5 5.5 5.67157 5.5 6.5V10.5C5.5 11.3284 6.17157 12 7 12C7.82843 12 8.5 11.3284 8.5 10.5V6.5Z" fill="currentColor"/>
<path d="M15.5 17.5C15.5 18.3284 16.1716 19 17 19C17.8284 19 18.5 18.3284 18.5 17.5V13.5C18.5 12.6716 17.8284 12 17 12C16.1716 12 15.5 12.6716 15.5 13.5V17.5Z" fill="currentColor"/>
    </svg>
  )
}
