import React from 'react'
import type { IconProps } from '../Icon'

// View in Room (AR): a cube inside dashed corner brackets. LAL only, for now —
// the Music Memories product page is the one place that offers View in Room.
export function ViewInRoomIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.6 3.9L12 2.5l2.4 1.4" />
        <path d="M18.1 6.1l2.4 1.4v2.8" />
        <path d="M20.5 13.7v2.8l-2.4 1.4" />
        <path d="M14.4 20.1L12 21.5l-2.4-1.4" />
        <path d="M5.9 17.9l-2.4-1.4v-2.8" />
        <path d="M3.5 10.3V7.5l2.4-1.4" />
        <path d="M8.6 10.1L12 12l3.4-1.9" />
        <path d="M12 12v3.9" />
        <path d="M3.5 7.5l2.3 1.2" />
        <path d="M20.5 7.5l-2.3 1.2" />
        <path d="M12 21.5v-2.6" />
      </g>
    </svg>
  )
}
