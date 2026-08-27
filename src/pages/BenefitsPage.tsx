import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { BenefitCard } from '../components/BenefitCard'
import { Icon } from '../components/Icon'
import { BENEFITS, CATEGORIES } from '../data'
import type { Category } from '../types'

export function BenefitsPage() {
  const [category, setCategory] = useState<Category>('전체')
  const [query, setQuery] = useState('')
  const location = useLocation()

  useEffect(() => {
    const id = location.hash.replace('#', '')
    if (!id) return
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  const list = useMemo(() => {
    const q = query.trim()
    return BENEFITS.filter((item) => {
      const matchCat = category === '전체' || item.category === category
      const matchQ =
        !q ||
        item.title.includes(q) ||
        item.location.includes(q) ||
        item.discount.includes(q) ||
        item.item.includes(q)
      return matchCat && matchQ
    })
  }, [category, query])

  return (
    <>
      <PageHeader kicker="BENEFIT" title="양구사랑 사이버 군민증 혜택" desc="다양한 할인 혜택을 확인해보세요!" />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <Link
            to="/nearby"
            className="flex items-center justify-between rounded-2xl bg-main-50 px-4 py-3 text-sm font-bold text-main"
          >
            내 주변 혜택 지도
            <Icon name="right" className="h-4 w-4" />
          </Link>
          <Link
            to="/comma"
            className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3 text-sm font-bold text-gray-700"
          >
            오래 머물기 좋은 쉼표
            <Icon name="right" className="h-4 w-4" />
          </Link>
        </div>
        <div className="sticky top-16 z-30 bg-white/95 py-3 backdrop-blur">
          <div className="relative mb-3">
            <Icon name="search" className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="가맹점, 주소, 할인으로 검색"
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-sm outline-none focus:border-main"
            />
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
                  category === cat ? 'bg-main text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-500">총 {list.length}건</p>
        {list.length === 0 ? (
          <p className="py-16 text-center text-gray-500">조건에 맞는 혜택이 없습니다.</p>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((item) => (
              <BenefitCard key={item.id} benefit={item} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
