import { useEffect } from 'react'
import type { ElementType } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, FlaskConical, Leaf, MapPin, X } from 'lucide-react'

import type { Plant, ThreatCategoryKey } from '@/modules/catalog/types/plant'

const USE_COLORS: Record<string, string> = {
  Culinaria: 'bg-amber-100 text-amber-800 border-amber-200',
  Medicinal: 'bg-rose-100 text-rose-800 border-rose-200',
  Aromática: 'bg-violet-100 text-violet-800 border-violet-200',
  Ornamental: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

const THREAT_CONFIG: Record<ThreatCategoryKey, { label: string; color: string }> = {
  LC: { label: 'LC — Preocupación menor', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  NT: { label: 'NT — Casi amenazada', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  VU: { label: 'VU — Vulnerable', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  EN: { label: 'EN — En peligro', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  CR: { label: 'CR — En peligro crítico', color: 'bg-red-100 text-red-800 border-red-300' },
  EW: { label: 'EW — Extinta en estado silvestre', color: 'bg-red-200 text-red-900 border-red-400' },
  EX: { label: 'EX — Extinta', color: 'bg-gray-200 text-gray-800 border-gray-400' },
  DD: { label: 'DD — Datos insuficientes', color: 'bg-gray-100 text-gray-600 border-gray-300' },
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null

  return (
    <div className="flex gap-3 border-b border-border py-2.5 last:border-b-0">
      <span className="w-40 shrink-0 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}

function SectionHeading({ icon: Icon, title }: { icon: ElementType; title: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <Icon className="size-4 text-muted-foreground" />
      <h3 className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {title}
      </h3>
    </div>
  )
}

type Props = {
  plant: Plant | null
  onClose: () => void
}

export function PlantDetailModal({ plant, onClose }: Props) {
  useEffect(() => {
    if (!plant) return

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [plant, onClose])

  useEffect(() => {
    document.body.style.overflow = plant ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [plant])

  const threat = plant?.threatCategory ? THREAT_CONFIG[plant.threatCategory] : null
  const majorPopularUseLabel = plant?.majorPopularUse ? 'Sí' : plant?.majorPopularUse === false ? 'No' : null

  const formatDate = (iso: string | null) => {
    if (!iso) return null

    const date = new Date(iso)
    return Number.isNaN(date.getTime())
      ? iso
      : date.toLocaleDateString('es-CU', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <AnimatePresence>
      {plant && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="plant-modal-title"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-x-4 bottom-4 top-[4vh] z-50 mx-auto flex max-w-2xl flex-col overflow-hidden rounded-[var(--radius-xl)] bg-card shadow-[var(--shadow-float)] lg:inset-x-auto lg:left-1/2 lg:w-full lg:-translate-x-1/2"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65"
            >
              <X className="size-4" />
            </button>

            <div className="flex-1 overflow-y-auto">
              <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden">
                <img src={plant.imageUrl} alt={plant.nameCommon} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="mb-2 inline-block rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                    {plant.growthFormLabel}
                  </span>
                  <h2 id="plant-modal-title" className="m-0 text-2xl leading-tight text-white lg:text-[28px]">
                    {plant.nameCommon}
                  </h2>
                  <p className="mt-1 text-sm italic text-white/75">{plant.scientificName}</p>
                </div>
              </div>

              <div className="space-y-7 px-5 py-6 pb-10">
                <div>
                  <SectionHeading icon={BookOpen} title="Datos de la planta" />
                  <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-background px-4">
                    <InfoRow label="N.° de planta" value={plant.plantNumber !== null ? String(plant.plantNumber) : null} />
                    <InfoRow label="Nombre común" value={plant.nameCommon} />
                    <InfoRow label="Nombre científico" value={plant.scientificName} />
                    <InfoRow label="Género" value={plant.genus} />
                    <InfoRow label="Familia" value={plant.family} />
                    <InfoRow label="Porte" value={plant.growthFormLabel} />
                    <InfoRow label="Origen" value={plant.origin} />
                    <InfoRow label="Procedencia" value={plant.provenance} />
                    <InfoRow label="Colector" value={plant.collector} />
                    <InfoRow label="Categoría de amenaza" value={threat?.label ?? null} />
                    <InfoRow label="Endemismo" value={plant.isEndemic !== null ? (plant.isEndemic ? 'Sí' : 'No') : null} />
                    <InfoRow label="Cantidad de individuos" value={plant.stock !== null ? String(plant.stock) : null} />
                    <InfoRow label="Fecha de alta" value={formatDate(plant.registrationDate)} />
                    <InfoRow label="Fecha de muerte" value={formatDate(plant.deathDate)} />
                    <InfoRow label="Mayor uso popular" value={majorPopularUseLabel} />
                  </div>
                </div>

                <div>
                  <SectionHeading icon={Leaf} title="Usos populares" />
                  <div className="flex flex-wrap gap-2">
                    {plant.uses.map((use) => (
                      <span
                        key={use}
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${
                          USE_COLORS[use] ?? 'border-border bg-secondary text-foreground'
                        }`}
                      >
                        {use}
                      </span>
                    ))}
                  </div>
                </div>

                {threat && (
                  <div>
                    <SectionHeading icon={FlaskConical} title="Estado de conservación" />
                    <span className={`inline-flex rounded-full border px-3.5 py-1.5 text-sm font-semibold ${threat.color}`}>
                      {threat.label}
                    </span>
                  </div>
                )}

                <div>
                  <SectionHeading icon={MapPin} title="Clasificación botánica" />
                  <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-background px-4">
                    <InfoRow label="Género" value={plant.genus} />
                    <InfoRow label="Familia" value={plant.family} />
                    <InfoRow label="Porte" value={plant.growthFormLabel} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}