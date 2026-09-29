'use client'

import type React from 'react'
import type { IconProps } from '@/src/components/icons/Icon'
import { ORDER_STEPS, completedStepCount, currentStepIndex, type OrderStatus } from '../../_lib/orderStatus'
import styles from './OrderProgress.module.css'

export interface OrderProgressIcons {
  CheckmarkIcon: React.ComponentType<IconProps>
}

interface OrderProgressProps {
  status: OrderStatus
  icons:  OrderProgressIcons
  /**
   * A date against each step, by step index. Sparse on purpose: steps that have
   * not happened yet have no date to show.
   */
  stepDates?: Array<string | undefined>
  /**
   * 'responsive' stacks on mobile and lays out horizontally from md up, which
   * is what both pages want. The fixed values are for callers that need one
   * shape at every width.
   */
  orientation?: 'vertical' | 'horizontal' | 'responsive'
  className?: string
}

/**
 * The five-step fulfillment stepper.
 *
 * Steps and their order come from `_lib/orderStatus`, so this never decides
 * what the journey is — only how far along it has got. Delivered fills every
 * step and marks none of them current, because there is nothing in progress.
 */
export function OrderProgress({
  status, icons, stepDates, orientation = 'responsive', className,
}: OrderProgressProps) {
  const { CheckmarkIcon } = icons
  const reachedCount = completedStepCount(status)
  const current      = currentStepIndex(status)

  const shape =
    orientation === 'vertical'   ? styles.vertical :
    orientation === 'horizontal' ? styles.horizontal :
                                   styles.responsive

  return (
    <ol className={[styles.stepper, shape, className].filter(Boolean).join(' ')}>
      {ORDER_STEPS.map((label, index) => {
        const reached = index < reachedCount
        const date    = stepDates?.[index]
        return (
          <li
            key={label}
            className={`${styles.step} ${reached ? styles.stepReached : ''}`}
            aria-current={index === current ? 'step' : undefined}
          >
            <span className={styles.circle} aria-hidden="true">
              {reached && <CheckmarkIcon size={12} color="var(--colors-text-inverse)" />}
            </span>
            <span className={styles.body}>
              <span className={styles.label}>{label}</span>
              {date && <span className={styles.date}>{date}</span>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
