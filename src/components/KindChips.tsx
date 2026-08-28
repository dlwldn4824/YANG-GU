import { uniqueKinds } from '../journal'
import { kindEmoji } from '../kinds'
import type { YangguFragment } from '../types'

export function KindChips({ items }: { items: YangguFragment[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {uniqueKinds(items).map((item) => (
        <li key={item.kind} className="rounded-full bg-main-50 px-3 py-1.5 text-sm font-bold text-main">
          {kindEmoji(item.kind)} {item.label}
        </li>
      ))}
    </ul>
  )
}
