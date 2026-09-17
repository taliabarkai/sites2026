/**
 * Mockup lookup so the advisor can answer without a backend.
 * Standard Hebrew spellings for common names; anything else gets a reply that
 * offers help rather than inventing a spelling.
 */
interface HebrewName {
  hebrew:  string
  meaning: string
}

const HEBREW_NAMES: Record<string, HebrewName> = {
  aaron:    { hebrew: 'אהרן',   meaning: 'mountain of strength' },
  abigail:  { hebrew: 'אביגיל', meaning: "my father's joy" },
  adam:     { hebrew: 'אדם',    meaning: 'earth' },
  benjamin: { hebrew: 'בנימין', meaning: 'son of the right hand' },
  daniel:   { hebrew: 'דניאל',  meaning: 'God is my judge' },
  david:    { hebrew: 'דוד',    meaning: 'beloved' },
  eli:      { hebrew: 'אלי',    meaning: 'ascended' },
  esther:   { hebrew: 'אסתר',   meaning: 'star' },
  hannah:   { hebrew: 'חנה',    meaning: 'grace' },
  isaac:    { hebrew: 'יצחק',   meaning: 'he will laugh' },
  jacob:    { hebrew: 'יעקב',   meaning: 'holder of the heel' },
  leah:     { hebrew: 'לאה',    meaning: 'weary' },
  michael:  { hebrew: 'מיכאל',  meaning: 'who is like God' },
  miriam:   { hebrew: 'מרים',   meaning: 'wished-for child' },
  naomi:    { hebrew: 'נעמי',   meaning: 'pleasantness' },
  noah:     { hebrew: 'נח',     meaning: 'rest' },
  rachel:   { hebrew: 'רחל',    meaning: 'ewe' },
  rebecca:  { hebrew: 'רבקה',   meaning: 'to bind' },
  samuel:   { hebrew: 'שמואל',  meaning: 'God has heard' },
  sarah:    { hebrew: 'שרה',    meaning: 'princess' },
  talia:    { hebrew: 'טליה',   meaning: 'dew of God' },
}

export interface AdvisorReply {
  text:    string
  /** Present only when a spelling is known, which is what the CTA offers. */
  hebrew?: string
  name?:   string
}

/** Finds the first known name anywhere in the query. */
export function lookupReply(query: string): AdvisorReply {
  const words = query.toLowerCase().match(/[a-z]+/g) ?? []

  for (const word of words) {
    const entry = HEBREW_NAMES[word]
    if (entry) {
      const name = word.charAt(0).toUpperCase() + word.slice(1)
      return {
        name,
        hebrew: entry.hebrew,
        text: `The beautiful Hebrew name ${name} is written as ${entry.hebrew}. It means "${entry.meaning}".`,
      }
    }
  }

  return {
    text: 'I can help with that spelling. Tell me the name on its own — for example "Sarah" — and I\'ll show you how it looks in Hebrew.',
  }
}
