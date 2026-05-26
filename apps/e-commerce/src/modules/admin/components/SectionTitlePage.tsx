type SectionTitlePageProps = {
  title: string
}

export function SectionTitlePage({ title }: SectionTitlePageProps) {
  return (
    <section className='flex min-h-[320px] items-center justify-center rounded-[var(--radius-lg)] border border-[color:var(--border-soft)] bg-[color:var(--bg-canvas)] p-6'>
      <h2 className='font-heading text-4xl font-semibold text-[color:var(--text-strong)] md:text-5xl'>
        {title}
      </h2>
    </section>
  )
}
