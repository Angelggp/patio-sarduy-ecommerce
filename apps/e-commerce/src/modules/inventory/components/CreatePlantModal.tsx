import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { useCreatePlantMutation } from '@/modules/inventory/hooks/useCreatePlantMutation'
import {
  createPlantPayloadSchema,
  growthFormValues,
  threatCategoryValues,
  type CreatePlantPayload,
} from '@/modules/inventory/types/inventory.types'
import {
  fallbackPlantImage,
  growthFormLabelMap,
  threatCategoryLabelMap,
} from '@/modules/inventory/utils/inventory.constants'

type CreatePlantModalProps = {
  triggerLabel?: string
}

const createPlantDefaultValues: CreatePlantPayload = {
  commonName: '',
  scientificName: '',
  genus: '',
  family: '',
  growthForm: 'TREE',
  origin: '',
  provenance: '',
  collector: '',
  threatCategory: 'LC',
  isEndemic: false,
  price: undefined,
  population: 0,
  imagePath: '',
  mainPopularUse: {
    culinary: false,
    medicinal: false,
    aromatic: false,
  },
}

export function CreatePlantModal({ triggerLabel = 'Nueva planta' }: CreatePlantModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [localImagePreviewUrl, setLocalImagePreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mutation = useCreatePlantMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePlantPayload>({
    resolver: zodResolver(createPlantPayloadSchema),
    defaultValues: createPlantDefaultValues,
    mode: 'onBlur',
  })

  useEffect(() => {
    if (!selectedImageFile) {
      setLocalImagePreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(selectedImageFile)
    setLocalImagePreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [selectedImageFile])

  const createErrorMessage = useMemo(() => {
    if (!mutation.error || typeof mutation.error !== 'object' || !('message' in mutation.error)) {
      return null
    }

    const message = (mutation.error as { message?: unknown }).message
    return typeof message === 'string' ? message : 'No se pudo crear la planta'
  }, [mutation.error])

  const closeModal = () => {
    setSelectedImageFile(null)
    setLocalImagePreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setIsOpen(false)
  }

  const onSubmit = handleSubmit(async (values) => {
    const normalizedPayload: CreatePlantPayload = {
      ...values,
      imagePath: values.imagePath?.trim() ? values.imagePath.trim() : undefined,
      registrationDate: new Date().toISOString(),
      deathDate: undefined,
    }

    await mutation.mutateAsync({
      ...normalizedPayload,
      imageFile: selectedImageFile ?? undefined,
    })
    reset(createPlantDefaultValues)
    setSelectedImageFile(null)
    setLocalImagePreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    closeModal()
  })

  return (
    <>
      <Button type='button' onClick={() => setIsOpen(true)}>
        {triggerLabel}
      </Button>

      {isOpen ? (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4'>
          <div className='max-h-[90svh] w-full max-w-3xl overflow-y-auto rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-5 shadow-(--shadow-float)'>
            <div className='mb-5 flex items-start justify-between gap-3'>
              <div>
                <h2 className='font-heading text-2xl text-(--text-strong)'>Nueva planta</h2>
                <p className='text-sm text-(--text-muted)'>
                  Completa los datos principales para agregarla al inventario.
                </p>
              </div>
              <button
                type='button'
                className='rounded-full border border-(--border-subtle) px-3 py-1 text-sm font-medium text-(--text-body) transition hover:bg-(--bg-soft-mint)'
                onClick={closeModal}
              >
                Cerrar
              </button>
            </div>

            <form className='space-y-4' onSubmit={onSubmit}>
              <div className='grid gap-4 md:grid-cols-2'>
                <label className='space-y-1'>
                  <span className='text-sm font-semibold text-(--text-strong)'>Nombre comun</span>
                  <input
                    className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm outline-none transition focus:border-(--brand-primary)'
                    {...register('commonName')}
                  />
                  {errors.commonName ? (
                    <p className='text-xs text-(--status-danger)'>{errors.commonName.message}</p>
                  ) : null}
                </label>

                <label className='space-y-1'>
                  <span className='text-sm font-semibold text-(--text-strong)'>Nombre cientifico</span>
                  <input
                    className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm outline-none transition focus:border-(--brand-primary)'
                    {...register('scientificName')}
                  />
                  {errors.scientificName ? (
                    <p className='text-xs text-(--status-danger)'>{errors.scientificName.message}</p>
                  ) : null}
                </label>

                <label className='space-y-1'>
                  <span className='text-sm font-semibold text-(--text-strong)'>Genero</span>
                  <input
                    className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm outline-none transition focus:border-(--brand-primary)'
                    {...register('genus')}
                  />
                </label>

                <label className='space-y-1'>
                  <span className='text-sm font-semibold text-(--text-strong)'>Familia</span>
                  <input
                    className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm outline-none transition focus:border-(--brand-primary)'
                    {...register('family')}
                  />
                </label>

                <label className='space-y-1'>
                  <span className='text-sm font-semibold text-(--text-strong)'>Forma de crecimiento</span>
                  <select
                    className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm outline-none transition focus:border-(--brand-primary)'
                    {...register('growthForm')}
                  >
                    {growthFormValues.map((value) => (
                      <option key={value} value={value}>
                        {growthFormLabelMap[value]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className='space-y-1'>
                  <span className='text-sm font-semibold text-(--text-strong)'>Categoria de amenaza</span>
                  <select
                    className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm outline-none transition focus:border-(--brand-primary)'
                    {...register('threatCategory')}
                  >
                    {threatCategoryValues.map((value) => (
                      <option key={value} value={value}>
                        {threatCategoryLabelMap[value]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className='space-y-1'>
                  <span className='text-sm font-semibold text-(--text-strong)'>Origen</span>
                  <input
                    className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm outline-none transition focus:border-(--brand-primary)'
                    {...register('origin')}
                  />
                </label>

                <label className='space-y-1'>
                  <span className='text-sm font-semibold text-(--text-strong)'>Procedencia</span>
                  <input
                    className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm outline-none transition focus:border-(--brand-primary)'
                    {...register('provenance')}
                  />
                </label>

                <label className='space-y-1'>
                  <span className='text-sm font-semibold text-(--text-strong)'>Recolector</span>
                  <input
                    className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm outline-none transition focus:border-(--brand-primary)'
                    {...register('collector')}
                  />
                </label>

                <label className='space-y-1'>
                  <span className='text-sm font-semibold text-(--text-strong)'>Poblacion</span>
                  <input
                    type='number'
                    min={0}
                    className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm outline-none transition focus:border-(--brand-primary)'
                    {...register('population', {
                      setValueAs: (value) => Number(value),
                    })}
                  />
                </label>

                <label className='space-y-1'>
                  <span className='text-sm font-semibold text-(--text-strong)'>Precio</span>
                  <input
                    type='number'
                    min={0}
                    step='0.01'
                    className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm outline-none transition focus:border-(--brand-primary)'
                    {...register('price', {
                      setValueAs: (value) => (value === '' ? undefined : Number(value)),
                    })}
                  />
                </label>

                <label className='space-y-1 md:col-span-2'>
                  <span className='text-sm font-semibold text-(--text-strong)'>Imagen de planta</span>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/png,image/jpeg,image/webp'
                    className='w-full rounded-sm border border-(--border-subtle) px-3 py-2 text-sm outline-none transition focus:border-(--brand-primary)'
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null
                      setSelectedImageFile(file)
                    }}
                  />
                  <p className='text-xs text-(--text-muted)'>
                    Formatos permitidos: PNG, JPG, WEBP. Maximo 5MB.
                  </p>
                </label>
              </div>

              <div className='grid gap-4 md:grid-cols-3'>
                <label className='flex items-center gap-2 text-sm font-medium'>
                  <input type='checkbox' {...register('isEndemic')} />
                  Endemica
                </label>
                <label className='flex items-center gap-2 text-sm font-medium'>
                  <input type='checkbox' {...register('mainPopularUse.culinary')} />
                  Uso culinario
                </label>
                <label className='flex items-center gap-2 text-sm font-medium'>
                  <input type='checkbox' {...register('mainPopularUse.medicinal')} />
                  Uso medicinal
                </label>
                <label className='flex items-center gap-2 text-sm font-medium'>
                  <input type='checkbox' {...register('mainPopularUse.aromatic')} />
                  Uso aromatico
                </label>
              </div>

              <div className='overflow-hidden rounded-md border border-(--border-soft)'>
                <img
                  src={localImagePreviewUrl || fallbackPlantImage}
                  alt='Vista previa de planta'
                  className='h-40 w-full object-cover'
                />
              </div>

              {createErrorMessage ? (
                <p className='rounded-sm bg-[color-mix(in_oklab,var(--status-danger)_15%,white)] px-3 py-2 text-sm text-(--status-danger)'>
                  {createErrorMessage}
                </p>
              ) : null}

              <div className='flex justify-end gap-2'>
                <Button
                  type='button'
                  variant='secondary'
                  onClick={() => {
                    reset(createPlantDefaultValues)
                    closeModal()
                  }}
                >
                  Cancelar
                </Button>
                <Button type='submit' disabled={mutation.isPending}>
                  {mutation.isPending ? 'Guardando...' : 'Crear planta'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}

