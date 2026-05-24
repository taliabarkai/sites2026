import React from 'react'
import type { IconProps } from '../Icon'

export function ReturnIcon({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ color }}>
      <path d="M5.9585 8.1228L17.6252 8.1228" stroke="currentColor" strokeWidth="1.25"/>
      <path d="M14.2915 4.3728L18.0415 8.1228L14.2915 11.8728" stroke="currentColor" strokeWidth="1.25"/>
      <path d="M18.0415 15.6228L6.37484 15.6228" stroke="currentColor" strokeWidth="1.25"/>
      <path d="M9.7085 19.3728L5.9585 15.6228L9.7085 11.8728" stroke="currentColor" strokeWidth="1.25"/>
    </svg>
  )
}
