import React from 'react'
import type { IconProps } from '../Icon'

export function CheckmarkIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path fillRule="evenodd" clipRule="evenodd" d="M6.03998 11.39C5.56998 11.85 5.56998 12.61 6.02998 13.08L9.34998 16.49C9.73998 16.89 10.39 16.89 10.78 16.49L17.92 9.34999C18.39 8.87999 18.39 8.11999 17.92 7.64999C17.45 7.17999 16.68 7.17999 16.21 7.64999L10.07 13.79L7.75998 11.4C7.28998 10.92 6.51998 10.91 6.03998 11.39Z" fill="currentColor"/>
    </svg>
  )
}
