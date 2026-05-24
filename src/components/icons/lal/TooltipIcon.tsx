import React from 'react'
import type { IconProps } from '../Icon'

export function TooltipIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <g clipPath="url(#lal-tooltip-clip)">
        <path d="M12 23C5.92 23 1 18.08 1 12C1 5.92 5.92 1 12 1C18.08 1 23 5.92 23 12C23 18.08 18.08 23 12 23Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12.2 6.71997C13.28 6.71997 14.14 7.01997 14.8 7.61997C15.46 8.21997 15.8 9.01997 15.8 10.06C15.8 11.14 15.46 11.96 14.76 12.5C14.08 13.04 13.18 13.32 12.04 13.32L11.98 14.58H10.4L10.32 12.06H10.84C11.88 12.06 12.68 11.92 13.22 11.64C13.78 11.38 14.04 10.84 14.04 10.06C14.04 9.49997 13.88 9.05997 13.56 8.73997C13.24 8.41997 12.78 8.25997 12.2 8.25997C11.64 8.25997 11.18 8.41997 10.84 8.71997C10.52 9.01997 10.36 9.45997 10.36 10.02H8.64001C8.64001 9.37997 8.78001 8.79997 9.08001 8.29997C9.36001 7.79997 9.78001 7.41997 10.3 7.13997C10.84 6.85997 11.48 6.71997 12.2 6.71997ZM11.16 18.12C10.84 18.12 10.56 18 10.34 17.78C10.12 17.56 10 17.28 10 16.94C10 16.62 10.12 16.34 10.34 16.12C10.56 15.88 10.84 15.78 11.16 15.78C11.48 15.78 11.76 15.88 11.98 16.12C12.2 16.34 12.32 16.62 12.32 16.94C12.32 17.28 12.2 17.56 11.98 17.78C11.76 18 11.48 18.12 11.16 18.12Z" fill="currentColor"/>
      </g>
      <defs>
        <clipPath id="lal-tooltip-clip">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  )
}
