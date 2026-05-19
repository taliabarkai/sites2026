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
      <path d="M19.668 10.62L22.344 6H16.98C16.5 6 16.02 5.868 15.6 5.628C15.18 5.388 14.832 5.04 14.58 4.62L11.952 0L9.27601 4.62C9.03601 5.04 8.68801 5.388 8.26801 5.628C7.84801 5.868 7.36801 6 6.87601 6H1.59601L4.27201 10.62C4.51201 11.04 4.63201 11.52 4.63201 12C4.63201 12.48 4.51201 12.96 4.27201 13.38L1.59601 18H6.93601C7.41601 18 7.89601 18.132 8.31601 18.372C8.73601 18.612 9.08401 18.96 9.33601 19.38L12 24L14.652 19.38C14.892 18.972 15.24 18.636 15.636 18.396C16.044 18.144 16.512 18.012 16.98 18H22.32L19.656 13.38C19.416 12.96 19.284 12.48 19.296 12C19.296 11.508 19.428 11.04 19.668 10.62Z" fill="currentColor"/>
    </svg>
  )
}
