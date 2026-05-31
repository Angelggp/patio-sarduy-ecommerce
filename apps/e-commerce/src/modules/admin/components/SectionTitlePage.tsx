type SectionTitlePageProps = {
  title: string
}

export function SectionTitlePage({ title }: SectionTitlePageProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-[color:var(--text-strong)] sm:text-3xl">{title}</h1>
    </div>
  )
}

