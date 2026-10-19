import React from 'react'
import type { IconProps } from '../Icon'

export function GridDoubleIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ color }}>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="5" width="16" height="14" rx="2.5" />
        <path d="M12 5v14" />
      </g>
    </svg>
  )
}
