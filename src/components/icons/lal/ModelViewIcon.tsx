import React from 'react'
import type { IconProps } from '../Icon'

export function ModelViewIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ color }}>
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l9-7.5 9 7.5" />
        <path d="M5 9.4v11.1h14V9.4" />
        <path d="M10 20.5V15h4v5.5" />
      </g>
    </svg>
  )
}
