'use client'

import { SearchField } from '../SearchField'
import { ShowcaseCard } from '../ShowcaseCard'

export function SearchFieldCard() {
  return (
    <ShowcaseCard
      id="search-field"
      title="Search field"
      criteria={['2.4.7 Focus Visible', '1.4.11 Non-text Contrast', '3.3.2 Labels or Instructions', '4.1.2 Name, Role, Value']}
      notes={{
        before:
          'Production: the ring wraps only the text box between the icons, and the field cuts it off at the top and bottom.',
        after:
          'The whole field highlights, icons included. The clear button has its own ring and only appears when there is text to clear.',
      }}
      dos={[
        'Put the ring on the whole field while the text box has focus.',
        'Give the clear button its own name ("Clear search") and its own ring.',
        'Label the field "Search" for screen readers; the magnifier is decoration.',
      ]}
      donts={[
        "Don't ring just the text box inside a field with icons on both sides.",
        "Don't light up the whole field when the clear button has focus; it hides which one does.",
        "Don't show a clear button when there's nothing to clear.",
      ]}
      states={[
        { label: 'Empty', content: <SearchField /> },
        { label: 'Text box focused', content: <SearchField demoState="focus" /> },
        { label: 'With text', content: <SearchField defaultValue="Gold name necklace" /> },
        { label: 'Clear button focused', content: <SearchField defaultValue="Gold name necklace" demoState="clearFocus" /> },
      ]}
    >
      <SearchField defaultValue="Gold name necklace" />
    </ShowcaseCard>
  )
}
