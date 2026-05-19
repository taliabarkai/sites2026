import React from 'react'
import type { IconProps } from '../Icon'

export function ChevronIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path fillRule="evenodd" clipRule="evenodd" d="M12.69 12.35C12.89 12.16 12.89 11.84 12.69 11.65L9.49999 8.44997C9.22999 8.17997 9.22999 7.74997 9.49999 7.47997C9.76999 7.21997 10.2 7.21997 10.47 7.47997L14.63 11.65C14.83 11.84 14.83 12.16 14.63 12.35L10.47 16.52C10.2 16.78 9.76999 16.78 9.49999 16.52C9.22999 16.25 9.22999 15.82 9.49999 15.55L12.69 12.35Z" fill="currentColor"/>
    </svg>
  )
}
