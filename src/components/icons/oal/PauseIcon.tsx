import type { IconProps } from '../Icon'

export function PauseIcon({ size = 24, color = 'currentColor', className }: IconProps) {
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
      <g clipPath="url(#clip0_147_128)">
        {/* Semi-transparent background circle */}
        <circle cx="12" cy="12" r="12" fill="white" fillOpacity={0.6} />
        
        {/* Right Pause Bar (Now dynamically uses the color prop) */}
        <path 
          d="M14 7.19995C13.34 7.19995 12.8 7.73995 12.8 8.39995V15.6C12.8 16.26 13.34 16.8 14 16.8H14.8C15.46 16.8 16 16.26 16 15.6V8.39995C16 7.73995 15.46 7.19995 14.8 7.19995H14Z" 
          fill="currentColor" 
        />
        
        {/* Left Pause Bar (Now dynamically uses the color prop) */}
        <path 
          d="M9.2 7.19995C8.54 7.19995 8 7.73995 8 8.39995V15.6C8 16.26 8.54 16.8 9.2 16.8H10C10.66 16.8 11.2 16.26 11.2 15.6V8.39995C11.2 7.73995 10.66 7.19995 10 7.19995H9.2Z" 
          fill="currentColor" 
        />
      </g>
      <defs>
        <clipPath id="clip0_147_128">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}