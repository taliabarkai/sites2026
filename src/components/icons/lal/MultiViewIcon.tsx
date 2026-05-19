import React from 'react'
import type { IconProps } from '../Icon'

export function MultiViewIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path d="M11.5886 0.137085H0.651428V11.0742H11.5886V0.137085Z" fill="currentColor"/>
<path d="M23.36 0.137085H12.4229V11.0742H23.36V0.137085Z" fill="currentColor"/>
<path d="M11.5886 12.0571H0.651428V22.9943H11.5886V12.0571Z" fill="currentColor"/>
<path d="M23.36 12.0571H12.4229V22.9943H23.36V12.0571Z" fill="currentColor"/>
    </svg>
  )
}
