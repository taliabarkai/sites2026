import React from 'react'
import type { IconProps } from '../Icon'

export function PlayIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <g clipPath="url(#clip0_147_180)">
<path d="M24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24C18.6274 24 24 18.6274 24 12Z" fill="white" fill-opacity="0.6"/>
<path d="M7.95001 8.56002C7.97001 7.93002 8.44001 7.49002 8.99001 7.48002C9.18001 7.47002 9.37001 7.52002 9.55001 7.62002L15.5 11.06C15.83 11.25 16.05 11.6 16.05 12C16.05 12.4 15.83 12.75 15.5 12.94L9.55001 16.38C8.81001 16.78 7.97001 16.27 7.95001 15.43V8.56002Z" fill="#1E1E1E"/>
</g>
<defs>
<clipPath id="clip0_147_180">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>
    </svg>
  )
}
