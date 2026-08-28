export const AWARD_LABEL = 'Pintime 일상뒤집기 우수상'

export function AwardBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-point/30 bg-white/90 px-3 py-1 text-[11px] font-bold text-point ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
        <path d="M12 2.8 14.6 8l5.8.8-4.2 4.1 1 5.8L12 16.2 6.8 18.7l1-5.8L3.6 8.8 9.4 8 12 2.8Z" />
      </svg>
      {AWARD_LABEL}
    </span>
  )
}
