import React from 'react'
import type { IconProps } from '../Icon'

export function MeasureChartIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path d="M20 14V18C20 18.9 19.3 19.67 18.39 19.67H9.66998V14H20Z" fill="white" stroke="currentColor"/>
<path d="M20 8.67004V14.33H9.66998V8.67004H20Z" fill="white" stroke="currentColor"/>
<path d="M10.67 8.67004V14.33H5V8.67004H10.67Z" fill="white" stroke="currentColor"/>
<path d="M10.67 14V19.67H6.61C5.7 19.67 5 18.9 5 18V14H10.67Z" fill="white" stroke="currentColor"/>
<path d="M18.39 4C19.3 4 20 4.77 20 5.67V9.67H9.66998V4H18.39Z" fill="white" stroke="currentColor"/>
<path d="M10.67 4V9.67H5V5.67C5 4.77 5.7 4 6.61 4H10.67Z" fill="white" stroke="currentColor"/>
    </svg>
  )
}
