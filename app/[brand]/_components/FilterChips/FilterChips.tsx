import styles from './FilterChips.module.css'

export interface FilterChip {
  value: string
  label: string
}

interface FilterChipsProps {
  chips: FilterChip[]
  onRemove: (value: string) => void
  onClearAll: () => void
  XIcon: React.ComponentType<{ size?: number }>
}

export function FilterChips({ chips, onRemove, onClearAll, XIcon }: FilterChipsProps) {
  return (
    <>
      {chips.map(chip => (
        <button
          key={chip.value}
          type="button"
          className={styles.chip}
          onClick={() => onRemove(chip.value)}
          aria-label={`Remove ${chip.label} filter`}
        >
          {chip.label} <XIcon size={16} />
        </button>
      ))}
      <button
        type="button"
        className={styles.clearAll}
        onClick={onClearAll}
      >
        Clear All
      </button>
    </>
  )
}
