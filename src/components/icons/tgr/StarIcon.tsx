import React from 'react'
import type { IconProps } from '../Icon'

export function StarIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path d="M12 1.32715L14.7 9.12009H23.415L16.365 13.9483L19.05 21.7554L12 16.9271L4.95002 21.7554L7.63502 13.9483L0.585022 9.12009H9.30002L12 1.32715Z" fill="currentColor"/>
    </svg>
  )
}
