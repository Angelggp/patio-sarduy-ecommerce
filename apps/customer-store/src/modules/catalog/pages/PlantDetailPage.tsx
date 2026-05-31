import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Check, Copy, FlaskConical, Leaf, MapPin, Share2, Sprout } from 'lucide-react'
import { type ElementType, useState } from 'react'

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
    <div className="flex gap-3 border-b border-border py-2.5 last:border-b-0">
      <span className="w-44 shrink-0 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
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
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    const title = plant?.nameCommon ?? 'Planta'
    const text = plant?.scientificName ? `${title} (${plant.scientificName})` : title

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch {
        // usuario canceló — no hacer nada
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // fallback para navegadores sin Clipboard API
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
          {copied ? (
            <>
              <Check className="size-4 text-[color:var(--status-success)]" />
              <span className="text-[color:var(--status-success)]">Enlace copiado</span>
            </>
          ) : (
            <>
              <Share2 className="size-4" />
              Compartir
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--status-danger)]/40 bg-card px-5 py-4 text-sm text-[color:var(--status-danger)]">
          No se pudo cargar la información de esta planta.
        </div>
      )}

      {/* Hero imagen */}
      <div className="relative mb-8 aspect-[16/7] w-full overflow-hidden rounded-[var(--radius-xl)]">
        {isLoading ? (
          <div className="h-full w-full animate-pulse bg-secondary" />
        ) : (
          <>
            <img
              src={plant?.imageUrl}
              alt={plant?.nameCommon}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              {plant?.growthFormLabel && (
                <span className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {plant.growthFormLabel}
                </span>
              )}
              <h1 className="m-0 text-3xl leading-tight text-white lg:text-4xl">
                {plant?.nameCommon ?? ''}
              </h1>
              <p className="mt-1 text-base italic text-white/75">{plant?.scientificName}</p>
            </div>
          </>
        )}
      </div>

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
                <InfoRow label="Forma de crecimiento" value={plant?.growthFormLabel} />
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
                  {plant?.plantNumber !== null && plant?.plantNumber !== undefined && (
                    <InfoRow label="N.° de planta" value={String(plant.plantNumber)} />
                  )}
                  <InfoRow label="Colector" value={plant?.collector} />
                  <InfoRow label="Fecha de registro" value={formatDate(plant?.registrationDate)} />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
