import React from 'react'
import type { IconProps } from '../Icon'

/** Shield with a check — guarantees (e.g. "Money back if preview not approved"). */
export function ShieldIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3L19 5.8V11.2C19 15.6 16 19.3 12 21C8 19.3 5 15.6 5 11.2V5.8L12 3Z" stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M8.8 12.2L11 14.4L15.4 9.8" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
