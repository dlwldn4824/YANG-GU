export function PageHeader({ kicker, title, desc }: { kicker: string; title: string; desc?: string }) {
  return (
    <section
      className="relative overflow-hidden bg-[#eef6e7]"
      style={{ backgroundImage: 'url(/assets/ui/hero.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-[#ecf2e8]/85" />
      <div className="relative mx-auto max-w-6xl px-4 py-8 lg:py-10">
        <p className="text-[11px] font-bold tracking-[0.2em] text-sub">{kicker}</p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink lg:text-3xl">{title}</h1>
        {desc ? <p className="mt-2 text-sm text-gray-600 lg:text-base">{desc}</p> : null}
      </div>
    </section>
  )
}
