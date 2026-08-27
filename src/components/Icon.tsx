type IconName =
  | 'leaf'
  | 'percent'
  | 'id'
  | 'add'
  | 'question'
  | 'group'
  | 'search'
  | 'pin'
  | 'down'
  | 'up'
  | 'right'
  | 'download'
  | 'printer'
  | 'scan'
  | 'scissors'
  | 'gate'
  | 'store'
  | 'message'
  | 'bag'
  | 'walk'
  | 'clock'
  | 'gift'
  | 'truck'
  | 'check'
  | 'user'

const PATHS: Record<IconName, string | string[]> = {
  leaf: 'M12 3c4 2 7 6 7 11a7 7 0 0 1-14 0c0-2 3-7 7-11Zm0 6v8',
  percent: 'M19 5 5 19M8.5 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm7 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  id: 'M4 6h16v12H4zM8 10h5M8 14h8M17 10.5v.5',
  add: 'M12 5v14M5 12h14',
  question: 'M9 9a3 3 0 1 1 4.2 2.75C12.5 12.4 12 13 12 14.2M12 18h.01',
  group: 'M16 11a3 3 0 1 0-6 0 3 3 0 0 0 6 0ZM8 19a4 4 0 0 1 8 0M18 11a2.5 2.5 0 1 0-1-4.8M20 19a3.5 3.5 0 0 0-3-3.4',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3',
  pin: 'M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  down: 'M6 9l6 6 6-6',
  up: 'M6 15l6-6 6 6',
  right: 'M9 6l6 6-6 6',
  download: 'M12 4v10m0 0 4-4m-4 4-4-4M5 18h14',
  printer: 'M7 8V4h10v4M6 17H5a2 2 0 0 1-2-2v-5h18v5a2 2 0 0 1-2 2h-1M7 13h10v7H7z',
  scan: 'M4 8V5h3M20 8V5h-3M4 16v3h3M20 16v3h-3M8 12h8',
  scissors: 'M8 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm0 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM20 5 8.5 14.5M20 19 8.5 9.5',
  gate: 'M4 20V8l8-4 8 4v12M4 12h16M12 8v12',
  store: 'M4 10 6 5h12l2 5v9H4v-9Zm2 0h12M9 19v-5h6v5',
  message: 'M5 6h14v10H8l-3 3V6Z',
  bag: 'M6 8h12l1 13H5L6 8Zm3 0V6a3 3 0 0 1 6 0v2',
  walk: 'M13 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM10 22l2-7 2 3 3 1M8 12l4-1 3 4',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3 2',
  gift: 'M20 12v8H4v-8m16 0H4m16 0V8H4v4M12 8v12M12 8H8.5A2.5 2.5 0 1 1 8.5 3C11 3 12 8 12 8Zm0 0h3.5A2.5 2.5 0 1 0 15.5 3C13 3 12 8 12 8Z',
  truck: 'M3 7h11v10H3V7Zm11 3h4l3 3v4h-7V10ZM7 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  check: 'M5 12l5 5L20 7',
  user: ['M16 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z', 'M5.2 20.5a6.8 6.8 0 0 0 13.6 0'],
}

export function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  const d = PATHS[name]
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {paths.map((item) => (
        <path key={item} d={item} />
      ))}
    </svg>
  )
}
