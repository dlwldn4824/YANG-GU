import { useState } from 'react'
import type { Benefit } from '../types'
import { linkLabel, mapUrl, usageBadge } from '../utils'
import { Icon } from './Icon'

export function BenefitCard({ benefit }: { benefit: Benefit }) {
  const [open, setOpen] = useState(false)
  const label = linkLabel(benefit.link)

  return (
    <article
      id={benefit.id}
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_8px_24px_rgba(34,70,16,0.06)]"
    >
      <div className="relative aspect-[16/10] bg-main-50">
        {benefit.image ? (
          <img src={benefit.image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-main">
            <Icon name="scissors" className="h-10 w-10" />
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-main">
          {benefit.category}
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-point px-2.5 py-1 text-[11px] font-bold text-white">
          {usageBadge(benefit)}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-extrabold leading-snug">{benefit.title}</h3>
        <p className="mt-2 text-base font-bold text-main">{benefit.discount}</p>
        <p className="mt-1 text-sm text-gray-500">{benefit.item}</p>
        <p className="mt-3 flex items-start gap-1.5 text-sm text-gray-600">
          <Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0 text-main" />
          <span>{benefit.location}</span>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {label && benefit.link ? (
            <a
              href={benefit.link}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-main-100 px-3 py-1.5 text-xs font-semibold text-main hover:bg-main-50"
            >
              {label}
            </a>
          ) : null}
          <a
            href={mapUrl(benefit.location)}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
          >
            길찾기
          </a>
          {benefit.phone ? (
            <a
              href={`tel:${benefit.phone}`}
              className="rounded-full bg-main px-3 py-1.5 text-xs font-semibold text-white"
            >
              {benefit.phone}
            </a>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-3 flex w-full items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5 text-left text-sm font-medium text-gray-700"
        >
          사용방법
          <Icon name={open ? 'up' : 'down'} className="h-4 w-4" />
        </button>
        {open ? <p className="mt-2 text-sm leading-relaxed text-gray-600">{benefit.howto}</p> : null}
      </div>
    </article>
  )
}
