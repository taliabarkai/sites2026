import React from 'react'
import type { IconProps } from '../Icon'

/** A photo: a frame with mountains and a sun (the PDP gallery's "Gallery" choice) */
export function ImageIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ color }}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.12"/>
      <circle cx="15" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.12"/>
      <path d="M3 16.5L8.5 12L12.5 15.5L15.5 13L21 17.5" stroke="currentColor" strokeWidth="1.12" strokeLinejoin="round"/>
    </svg>
  )
}
