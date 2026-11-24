import React from 'react'
import type { IconProps } from '../Icon'

export function ProductViewIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ color }}>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.5 3c1 5.5 4 9.5 6.5 9.5s5.5-4 6.5-9.5" />
        <path d="M12 12.5v1.2" />
        <path d="M12 13.7l2.4 1.4v2.8L12 19.3l-2.4-1.4v-2.8z" />
      </g>
    </svg>
  )
}
