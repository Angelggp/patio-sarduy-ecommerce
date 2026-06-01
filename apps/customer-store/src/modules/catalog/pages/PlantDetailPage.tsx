import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, FlaskConical, Leaf, MapPin, Share2, Sprout, X, ZoomIn } from 'lucide-react'
import { type ElementType, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { toast } from 'sonner'

import { usePlantByIdQuery } from '@/modules/catalog/hooks/use-plant-by-id-query'
import type { ThreatCategoryKey } from '@/modules/catalog/types/plant'

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
    <div className="flex flex-col gap-0.5 border-b border-border py-2.5 last:border-b-0 sm:flex-row sm:gap-3">
      <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground sm:w-44">
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

function SkeletonRow() {
  return (
    <div className="flex gap-3 border-b border-border py-2.5 last:border-b-0">
      <div className="h-3 w-36 animate-pulse rounded-full bg-secondary" />
      <div className="h-3 flex-1 animate-pulse rounded-full bg-secondary" />
    </div>
  )
}

export function PlantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: plant, isLoading, error } = usePlantByIdQuery(id)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const handleShare = async () => {
    const url = window.location.href

    try {
      await navigator.clipboard.writeText(url)
      toast.success('URL copiada para compartir')
    } catch {
      // fallback para navegadores sin Clipboard API
      try {
        const ta = document.createElement('textarea')
        ta.value = url
        ta.style.position = 'fixed'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.focus()
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        toast.success('URL copiada para compartir')
      } catch {
        toast.error('No se pudo copiar la URL')
      }
    }
  }

  const threat = plant?.threatCategory ? THREAT_CONFIG[plant.threatCategory] : null

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return null
    const d = new Date(iso)
    return isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString('es-CU', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Volver + Compartir */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/plantas"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver al catálogo
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Share2 className="size-4" />
          Compartir
        </button>
      </div>

      {error && (
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--status-danger)]/40 bg-card px-5 py-4 text-sm text-[color:var(--status-danger)]">
          No se pudo cargar la información de esta planta.
        </div>
      )}

      <div className="mb-3 space-y-2">
        <h1 className="m-0 text-2xl leading-tight text-foreground sm:text-3xl lg:text-4xl">
          {plant?.nameCommon ?? ''}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {plant?.growthFormLabel ? (
            <span className="inline-flex rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
              {plant.growthFormLabel}
            </span>
          ) : null}
          {plant?.scientificName ? (
            <span className="inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs italic text-muted-foreground">
              {plant.scientificName}
            </span>
          ) : null}
        </div>
      </div>

      {/* Hero imagen */}
      <div className="relative mb-8 aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-xl)] sm:aspect-[16/7]">
        {isLoading ? (
          <div className="h-full w-full animate-pulse bg-secondary" />
        ) : (
          <>
            <img
              src={plant?.imageUrl}
              alt={plant?.nameCommon}
              className="h-full w-full object-cover"
            />

            {/* Botón ampliar */}
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/60"
              aria-label="Ver imagen ampliada"
            >
              <ZoomIn className="size-3.5" />
              <span className="hidden sm:inline">Ampliar</span>
            </button>
          </>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && plant?.imageUrl && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Cerrar"
            >
              <X className="size-5" />
            </button>
            <motion.img
              src={plant.imageUrl}
              alt={plant.nameCommon}
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              transition={{ duration: 0.2 }}
              className="max-h-[90vh] max-w-full rounded-[var(--radius-lg)] object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-white/60">
              {plant.nameCommon}{plant.scientificName ? ` — ${plant.scientificName}` : ''}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {/* Usos populares */}
        <div>
          <SectionHeading icon={Leaf} title="Usos populares" />
          {isLoading ? (
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-7 w-20 animate-pulse rounded-full bg-secondary" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {plant?.uses.map((use) => (
                <span
                  key={use}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium ${
                    USE_COLORS[use] ?? 'border-border bg-secondary text-foreground'
                  }`}
                >
                  {use}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Clasificación botánica */}
        <div>
          <SectionHeading icon={BookOpen} title="Clasificación botánica" />
          <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-card px-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            ) : (
              <>
                <InfoRow label="Nombre científico" value={plant?.scientificName} />
                <InfoRow label="Género" value={plant?.genus} />
                <InfoRow label="Familia" value={plant?.family} />
                <InfoRow label="Porte" value={plant?.growthFormLabel} />
              </>
            )}
          </div>
        </div>

        {/* Distribución */}
        {(isLoading || plant?.origin || plant?.provenance || plant?.isEndemic !== null) && (
          <div>
            <SectionHeading icon={MapPin} title="Distribución geográfica" />
            <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-card px-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
              ) : (
                <>
                  <InfoRow label="Origen" value={plant?.origin} />
                  <InfoRow label="Procedencia" value={plant?.provenance} />
                  {plant?.isEndemic !== null && (
                    <InfoRow label="Endémica" value={plant?.isEndemic ? 'Sí' : 'No'} />
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Estado de conservación */}
        {(isLoading || threat) && (
          <div>
            <SectionHeading icon={FlaskConical} title="Estado de conservación" />
            {isLoading ? (
              <div className="h-9 w-60 animate-pulse rounded-full bg-secondary" />
            ) : threat ? (
              <span
                className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${threat.color}`}
              >
                {threat.label}
              </span>
            ) : null}
          </div>
        )}

        {/* Datos de colección */}
        {(isLoading || plant?.collector || plant?.plantNumber !== null || plant?.registrationDate) && (
          <div>
            <SectionHeading icon={Sprout} title="Datos de colección" />
            <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-card px-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
              ) : (
                <>
                  <InfoRow label="N.° de planta" value={plant?.plantNumber !== null && plant?.plantNumber !== null ? String(plant.plantNumber) : String(plant?.id)} />
                   <InfoRow label="Cantidad de Individuos" value={String(plant.stock)} />
                  <InfoRow label="Colector" value={plant?.collector} />
                  <InfoRow label="Fecha de alta" value={formatDate(plant?.registrationDate)} />
                  <InfoRow label="Fecha de Muerte" value={formatDate(plant?.deathDate)} />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
