/**
 * Review summary for a product, derived from the single source of truth in the
 * product registry (`rating` + `reviewCount`). Every surface that shows a
 * rating — category card, PDP price row, PDP reviews section — reads from here,
 * so one product never shows three different numbers.
 */

export interface ReviewBreakdownRow {
  label: string
  /** Star value as a string, used by the rating filter. */
  value: string
  /** Reviews at this star rating. The rows always sum to `total`. */
  count: number
  /** Bar width, relative to the largest bucket. */
  pct: number
}

export interface ReviewSummary {
  rating: number
  total: number
  breakdown: ReviewBreakdownRow[]
}

/** Small fixed tail for 3/2/1 stars; the rest is split between 5 and 4. */
const TAIL = { 3: 0.04, 2: 0.015, 1: 0.005 }
const TAIL_SHARE = TAIL[3] + TAIL[2] + TAIL[1]
const TAIL_POINTS = TAIL[3] * 3 + TAIL[2] * 2 + TAIL[1] * 1

/**
 * Splits `total` reviews across the five star buckets so the weighted average
 * lands on `rating` and the counts add up exactly. Deterministic, so the bars
 * are stable between renders.
 */
export function getReviewSummary(rating: number, total: number): ReviewSummary {
  const head = 1 - TAIL_SHARE
  // 5·p5 + 4·(head − p5) + tail points = rating  →  p5 = rating − 4·head − tailPoints
  const p5 = Math.min(head, Math.max(0, rating - 4 * head - TAIL_POINTS))
  const shares: Record<number, number> = {
    5: p5,
    4: head - p5,
    3: TAIL[3],
    2: TAIL[2],
    1: TAIL[1],
  }

  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let assigned = 0
  for (const star of [5, 4, 3, 2, 1]) {
    counts[star] = Math.round(shares[star] * total)
    assigned += counts[star]
  }
  // Rounding drift goes to the biggest bucket so the rows still sum to `total`.
  const biggest = counts[5] >= counts[4] ? 5 : 4
  counts[biggest] += total - assigned
  if (counts[biggest] < 0) counts[biggest] = 0

  const max = Math.max(...Object.values(counts), 1)

  return {
    rating,
    total,
    breakdown: [5, 4, 3, 2, 1].map(star => ({
      label: star === 1 ? '1 Star' : `${star} Stars`,
      value: String(star),
      count: counts[star],
      pct: Math.round((counts[star] / max) * 100),
    })),
  }
}
