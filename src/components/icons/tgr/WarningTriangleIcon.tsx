import React from 'react'
import type { IconProps } from '../Icon'

export function WarningTriangleIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <path d="M20.3163 17.2047L13.6496 5.53803C13.5042 5.28153 13.2934 5.06819 13.0387 4.91975C12.784 4.77132 12.4944 4.69312 12.1996 4.69312C11.9048 4.69312 11.6152 4.77132 11.3605 4.91975C11.1058 5.06819 10.895 5.28153 10.7496 5.53803L4.08295 17.2047C3.93601 17.4592 3.85896 17.7479 3.85962 18.0418C3.86027 18.3356 3.93859 18.6241 4.08665 18.8779C4.23471 19.1317 4.44724 19.3418 4.70269 19.4871C4.95815 19.6323 5.24745 19.7073 5.54127 19.7047H18.8746C19.167 19.7044 19.4543 19.6272 19.7074 19.4808C19.9605 19.3343 20.1706 19.1239 20.3166 18.8706C20.4628 18.6173 20.5396 18.3301 20.5395 18.0376C20.5395 17.7452 20.4625 17.4579 20.3163 17.2047Z" fill="#FF8D7E" stroke="#FF8D7E" strokeWidth="1.66666" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M12.2078 9.70459V13.0379" stroke="white" strokeWidth="1.66666" strokeLinecap="round" strokeLinejoin="round"/>
<path d="M12.2078 16.3713H12.2151" stroke="white" strokeWidth="1.66666" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
