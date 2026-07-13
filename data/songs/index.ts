// Song catalog for the Music Memories customizer. No lyrics are stored — the
// record rings show placeholder copy (see RING_COPY in MusicMemoriesCustomizer),
// and only the center title is personalized per song.
export interface SongEntry {
  id: string
  label: string
  center: string[]
}

export const SONG_CATALOG: SongEntry[] = [
  { id: 'coldplay-yellow', label: 'Yellow – Coldplay', center: ['YELLOW'] },
  { id: 'bruno-just-the-way', label: 'Just the Way You Are – Bruno Mars', center: ['JUST THE', 'WAY YOU ARE'] },
  { id: 'adele-someone', label: 'Someone Like You – Adele', center: ['SOMEONE', 'LIKE YOU'] },
  { id: 'gaga-shallow', label: 'Shallow – Lady Gaga', center: ['SHALLOW'] },
  { id: 'rhcp-californication', label: 'Californication – Red Hot Chili Peppers', center: ['CALIFORNI', 'CATION'] },
  { id: 'beatles-hey-jude', label: 'Hey Jude – The Beatles', center: ['HEY JUDE'] },
  { id: 'swift-love-story', label: 'Love Story – Taylor Swift', center: ['LOVE', 'STORY'] },
  { id: 'edsheeran-perfect', label: 'Perfect – Ed Sheeran', center: ['PERFECT'] },
  { id: 'queen-rhapsody', label: 'Bohemian Rhapsody – Queen', center: ['BOHEMIAN', 'RHAPSODY'] },
  { id: 'billie-ocean-eyes', label: 'Ocean Eyes – Billie Eilish', center: ['OCEAN', 'EYES'] },
  { id: 'beyonce-halo', label: 'Halo – Beyoncé', center: ['HALO'] },
  { id: 'u2-with-or-without', label: 'With or Without You – U2', center: ['WITH OR', 'WITHOUT YOU'] },
  { id: 'imaginedragons-believer', label: 'Believer – Imagine Dragons', center: ['BELIEVER'] },
  { id: 'maroon5-sugar', label: 'Sugar – Maroon 5', center: ['SUGAR'] },
  { id: 'rihanna-diamonds', label: 'Diamonds – Rihanna', center: ['DIAMONDS'] },
  { id: 'elton-your-song', label: 'Your Song – Elton John', center: ['YOUR SONG'] },
  { id: 'fleetwood-dreams', label: 'Dreams – Fleetwood Mac', center: ['DREAMS'] },
  { id: 'nirvana-come-as-you-are', label: 'Come As You Are – Nirvana', center: ['COME AS YOU', 'ARE'] },
  { id: 'dualipa-levitating', label: 'Levitating – Dua Lipa', center: ['LEVITATING'] },
  { id: 'oasis-wonderwall', label: 'Wonderwall – Oasis', center: ['WONDER', 'WALL'] },
]

export function getSongById(id: string): SongEntry | undefined {
  return SONG_CATALOG.find((s) => s.id === id)
}
