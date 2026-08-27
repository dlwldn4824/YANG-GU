import { useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Icon } from '../components/Icon'
import { FAQS } from '../data'

export function FaqPage() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <>
      <PageHeader kicker="FAQ" title="자주 묻는 질문" desc={`총 ${FAQS.length}건`} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <ul className="space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i
            return (
              <li key={item.q} className="overflow-hidden rounded-2xl border border-gray-100">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-start gap-3 px-4 py-4 text-left"
                >
                  <span className="font-extrabold text-main">Q.</span>
                  <span className="flex-1 font-bold">{item.q}</span>
                  <Icon name={isOpen ? 'up' : 'down'} className="h-5 w-5 text-gray-400" />
                </button>
                {isOpen ? (
                  <div className="border-t border-gray-50 bg-gray-50 px-4 py-4 text-sm leading-7 text-gray-600">
                    <b className="text-sub">A. </b>
                    {item.a}
                  </div>
                ) : null}
              </li>
            )
          })}
        </ul>
      </main>
    </>
  )
}
