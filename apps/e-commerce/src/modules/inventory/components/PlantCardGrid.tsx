import { Camera, Check, Loader2, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useSelector } from 'react-redux'

import { type RootState } from '@/app/store'
import { Button } from '@/components/ui/button'
import { useDeletePlantMutation } from '@/modules/inventory/hooks/useDeletePlantMutation'
import { useUpdatePlantMutation } from '@/modules/inventory/hooks/useUpdatePlantMutation'
import { useUploadPlantImageMutation } from '@/modules/inventory/hooks/useUploadPlantImageMutation'
import { type InventoryPlant, type UpdatePlantPayload } from '@/modules/inventory/types/inventory.types'
import {
  fallbackPlantImage,
  growthFormLabelMap,
  threatCategoryLabelMap,
} from '@/modules/inventory/utils/inventory.constants'

type EditableFieldKey =
  | 'commonName'
  | 'scientificName'
  | 'genus'
  | 'family'
  | 'growthForm'
  | 'threatCategory'
  | 'population'
  | 'price'
  | 'origin'
  | 'provenance'
  | 'collector'
  | 'isEndemic'
  | 'mainPopularUse.culinary'
  | 'mainPopularUse.medicinal'
  | 'mainPopularUse.aromatic'

function EditableFieldRow({
  label,
  value,
  isEditing,
  onStartEdit,
  onCancel,
  onSave,
  children,
  disabled,
  readOnly,
}: {
  label: string
  value: string
  isEditing: boolean
  onStartEdit: () => void
  onCancel: () => void
  onSave: () => void
  children: ReactNode
  disabled?: boolean
  readOnly?: boolean
}) {
  return (
    <div className='group rounded-md border border-transparent px-2 py-1.5 transition hover:border-(--border-subtle) hover:bg-(--bg-surface)'>
      <div className='flex items-start justify-between gap-2'>
        <div className='min-w-0'>
          <p className='text-xs font-semibold uppercase tracking-wide text-(--text-muted)'>{label}</p>
          {isEditing ? children : <p className='text-sm text-(--text-strong)'>{value}</p>}
        </div>

        <div className='mt-0.5 shrink-0'>
          {isEditing ? (
            <div className='flex items-center gap-1'>
              <button
                type='button'
                className='rounded-sm border border-(--border-subtle) p-1 text-(--text-body) transition hover:bg-(--bg-soft-mint) disabled:opacity-50'
                onClick={onSave}
                disabled={disabled}
                aria-label={`Guardar ${label}`}
              >
                {disabled ? <Loader2 size={14} className='animate-spin' /> : <Check size={14} />}
              </button>
              <button
                type='button'
                className='rounded-sm border border-(--border-subtle) p-1 text-(--text-body) transition hover:bg-(--bg-soft-mint) disabled:opacity-50'
                onClick={onCancel}
                disabled={disabled}
                aria-label={`Cancelar edicion de ${label}`}
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            !readOnly ? (
              <button
                type='button'
                className='rounded-sm border border-(--border-subtle) p-1 text-(--text-muted) opacity-0 transition group-hover:opacity-100 hover:bg-(--bg-soft-mint)'
                onClick={onStartEdit}
                aria-label={`Editar ${label}`}
              >
                <Pencil size={14} />
              </button>
            ) : null
          )}
        </div>
      </div>
    </div>
  )
}

type PlantCardGridProps = {
  plants: InventoryPlant[]
  isLoading: boolean
  page: number
  totalPage: number
  onPageChange: (nextPage: number) => void
}

function PlantDetailsModal({
  plant,
  isOpen,
  onClose,
  onPlantUpdated,
  onPlantDeleted,
}: {
  plant: InventoryPlant | null
  isOpen: boolean
  onClose: () => void
  onPlantUpdated: (plant: InventoryPlant) => void
  onPlantDeleted: () => void
}) {
  const authUserRole = useSelector((state: RootState) => state.auth.user?.role)
  const canManage = authUserRole === 'ADMIN'
  const updateMutation = useUpdatePlantMutation()
  const deleteMutation = useDeletePlantMutation()
  const imageMutation = useUploadPlantImageMutation()
  const [editingField, setEditingField] = useState<EditableFieldKey | null>(null)
  const [draftValue, setDraftValue] = useState<string>('')
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditingField(null)
    setDraftValue('')
    setPendingImageFile(null)
    setImagePreviewUrl(null)
    setConfirmingDelete(false)
  }, [plant?.id])

  useEffect(() => {
    if (!pendingImageFile) {
      setImagePreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(pendingImageFile)
    setImagePreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pendingImageFile])

  if (!isOpen || !plant) {
    return null
  }

  const plantId = plant.id
  const plantName = plant.commonName
  const registrationDate = new Date(plant.registrationDate).toLocaleDateString('es-CU')
  const isBusy = updateMutation.isPending || deleteMutation.isPending || imageMutation.isPending

  const updateErrorMessage =
    updateMutation.error && typeof updateMutation.error === 'object' && 'message' in updateMutation.error
      ? String((updateMutation.error as { message?: unknown }).message ?? 'No se pudo actualizar la planta')
      : null

  const deleteErrorMessage =
    deleteMutation.error && typeof deleteMutation.error === 'object' && 'message' in deleteMutation.error
      ? String((deleteMutation.error as { message?: unknown }).message ?? 'No se pudo eliminar la planta')
      : null

  function startEditing(field: EditableFieldKey, value: string) {
    setEditingField(field)
    setDraftValue(value)
  }

  function cancelEditing() {
    setEditingField(null)
    setDraftValue('')
  }

  async function saveEditing() {
    if (!editingField) {
      return
    }

    const normalizedDraftValue = draftValue.trim()
    let payload: UpdatePlantPayload

    switch (editingField) {
      case 'mainPopularUse.culinary':
        payload = { mainPopularUse: { culinary: draftValue === 'true' } }
        break
      case 'mainPopularUse.medicinal':
        payload = { mainPopularUse: { medicinal: draftValue === 'true' } }
        break
      case 'mainPopularUse.aromatic':
        payload = { mainPopularUse: { aromatic: draftValue === 'true' } }
        break
      case 'isEndemic':
        payload = { isEndemic: draftValue === 'true' }
        break
      case 'population':
        payload = { population: Number(draftValue) }
        break
      case 'price':
        payload = { price: Number(draftValue) }
        break
      case 'commonName':
        payload = { commonName: normalizedDraftValue }
        break
      case 'scientificName':
        payload = { scientificName: normalizedDraftValue }
        break
      case 'genus':
        payload = { genus: normalizedDraftValue }
        break
      case 'family':
        payload = { family: normalizedDraftValue }
        break
      case 'growthForm':
        payload = { growthForm: normalizedDraftValue as UpdatePlantPayload['growthForm'] }
        break
      case 'threatCategory':
        payload = { threatCategory: normalizedDraftValue as UpdatePlantPayload['threatCategory'] }
        break
      case 'origin':
        payload = { origin: normalizedDraftValue }
        break
      case 'provenance':
        payload = { provenance: normalizedDraftValue }
        break
      case 'collector':
        payload = { collector: normalizedDraftValue }
        break
      default:
        return
    }

    const updated = await updateMutation.mutateAsync({
      id: plantId,
      payload,
    })

    onPlantUpdated(updated)
    cancelEditing()
  }

  async function handleDelete() {
    await deleteMutation.mutateAsync(plantId)
    onPlantDeleted()
  }

  async function saveImage() {
    if (!pendingImageFile) return
    const updated = await imageMutation.mutateAsync({ id: plantId, file: pendingImageFile })
    setPendingImageFile(null)
    setImagePreviewUrl(null)
    if (imageInputRef.current) imageInputRef.current.value = ''
    onPlantUpdated(updated)
  }

  function cancelImage() {
    setPendingImageFile(null)
    setImagePreviewUrl(null)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const usesLabel = [
    plant.mainPopularUse.culinary ? 'Culinario' : null,
    plant.mainPopularUse.medicinal ? 'Medicinal' : null,
    plant.mainPopularUse.aromatic ? 'Aromatico' : null,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className='fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4'>
      <div className='max-h-[90svh] w-full max-w-3xl overflow-y-auto rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-5 shadow-(--shadow-float)'>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='font-heading text-2xl text-(--text-strong)'>{plant.commonName}</h2>
          <button
            type='button'
            className='rounded-full border border-(--border-subtle) px-3 py-1 text-sm'
            onClick={onClose}
            disabled={isBusy}
          >
            Cerrar
          </button>
        </div>

        <img
          src={plant.imagePath || fallbackPlantImage}
          alt={plant.commonName}
          className='mb-4 h-56 w-full rounded-md object-cover'
        />

        {/* Sección de imagen editable */}
        {canManage ? (
        <div className='mb-4 space-y-2'>
          {pendingImageFile && imagePreviewUrl ? (
            <div className='overflow-hidden rounded-md border border-(--border-soft)'>
              <img src={imagePreviewUrl} alt='Vista previa' className='h-48 w-full object-cover' />
            </div>
          ) : null}

          <div className='flex flex-wrap items-center gap-2'>
            <label className='inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-(--border-subtle) px-3 py-1.5 text-sm font-medium text-(--text-body) transition hover:bg-(--bg-soft-mint)'>
              <Camera size={14} />
              {pendingImageFile ? 'Cambiar seleccion' : 'Cambiar imagen'}
              <input
                ref={imageInputRef}
                type='file'
                accept='image/png,image/jpeg,image/webp'
                className='hidden'
                disabled={isBusy}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null
                  setPendingImageFile(file)
                }}
              />
            </label>

            {pendingImageFile ? (
              <>
                <button
                  type='button'
                  onClick={saveImage}
                  disabled={isBusy}
                  className='inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[color:var(--brand-primary)] px-3 py-1.5 text-sm font-semibold text-(--bg-deep-forest) transition hover:opacity-90 disabled:opacity-50'
                >
                  {imageMutation.isPending ? (
                    <><Loader2 size={13} className='animate-spin' /> Subiendo...</>
                  ) : (
                    <><Check size={13} /> Guardar imagen</>
                  )}
                </button>
                <button
                  type='button'
                  onClick={cancelImage}
                  disabled={isBusy}
                  className='inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-(--border-subtle) px-3 py-1.5 text-sm font-medium text-(--text-body) transition hover:bg-(--bg-soft-mint) disabled:opacity-50'
                >
                  <X size={13} />
                  Cancelar
                </button>
              </>
            ) : null}
          </div>

          {imageMutation.error ? (
            <p className='rounded-sm bg-[color-mix(in_oklab,var(--status-danger)_15%,white)] px-3 py-2 text-sm text-(--status-danger)'>
              {String((imageMutation.error as { message?: unknown }).message ?? 'No se pudo subir la imagen')}
            </p>
          ) : null}
        </div>
        ) : null}

        <div className='grid gap-3 rounded-md border border-(--border-soft) bg-(--bg-canvas) p-4 md:grid-cols-2'>
          <EditableFieldRow
            label='Nombre comun'
            value={plant.commonName}
            isEditing={editingField === 'commonName'}
            onStartEdit={() => startEditing('commonName', plant.commonName)}
            onCancel={cancelEditing}
            onSave={saveEditing}
            disabled={isBusy}
            readOnly={!canManage}
          >
            <input
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              className='mt-1 w-full rounded-sm border border-(--border-subtle) px-2 py-1 text-sm'
            />
          </EditableFieldRow>

          <EditableFieldRow
            label='Nombre cientifico'
            value={plant.scientificName}
            isEditing={editingField === 'scientificName'}
            onStartEdit={() => startEditing('scientificName', plant.scientificName)}
            onCancel={cancelEditing}
            onSave={saveEditing}
            disabled={isBusy}
            readOnly={!canManage}
          >
            <input
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              className='mt-1 w-full rounded-sm border border-(--border-subtle) px-2 py-1 text-sm'
            />
          </EditableFieldRow>

          <EditableFieldRow
            label='Genero'
            value={plant.genus}
            isEditing={editingField === 'genus'}
            onStartEdit={() => startEditing('genus', plant.genus)}
            onCancel={cancelEditing}
            onSave={saveEditing}
            disabled={isBusy}
            readOnly={!canManage}
          >
            <input
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              className='mt-1 w-full rounded-sm border border-(--border-subtle) px-2 py-1 text-sm'
            />
          </EditableFieldRow>

          <EditableFieldRow
            label='Familia'
            value={plant.family}
            isEditing={editingField === 'family'}
            onStartEdit={() => startEditing('family', plant.family)}
            onCancel={cancelEditing}
            onSave={saveEditing}
            disabled={isBusy}
            readOnly={!canManage}
          >
            <input
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              className='mt-1 w-full rounded-sm border border-(--border-subtle) px-2 py-1 text-sm'
            />
          </EditableFieldRow>

          <EditableFieldRow
            label='Forma'
            value={growthFormLabelMap[plant.growthForm]}
            isEditing={editingField === 'growthForm'}
            onStartEdit={() => startEditing('growthForm', plant.growthForm)}
            onCancel={cancelEditing}
            onSave={saveEditing}
            disabled={isBusy}
            readOnly={!canManage}
          >
            <select
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              className='mt-1 w-full rounded-sm border border-(--border-subtle) px-2 py-1 text-sm'
            >
              {Object.entries(growthFormLabelMap).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </EditableFieldRow>

          <EditableFieldRow
            label='Amenaza'
            value={threatCategoryLabelMap[plant.threatCategory]}
            isEditing={editingField === 'threatCategory'}
            onStartEdit={() => startEditing('threatCategory', plant.threatCategory)}
            onCancel={cancelEditing}
            onSave={saveEditing}
            disabled={isBusy}
            readOnly={!canManage}
          >
            <select
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              className='mt-1 w-full rounded-sm border border-(--border-subtle) px-2 py-1 text-sm'
            >
              {Object.entries(threatCategoryLabelMap).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </EditableFieldRow>

          <EditableFieldRow
            label='Stock (cant. individuos)'
            value={typeof plant.population === 'number' ? plant.population.toLocaleString('es-CU') : '0'}
            isEditing={editingField === 'population'}
            onStartEdit={() => startEditing('population', String(plant.population ?? 0))}
            onCancel={cancelEditing}
            onSave={saveEditing}
            disabled={isBusy}
            readOnly={!canManage}
          >
            <input
              type='number'
              min={0}
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              className='mt-1 w-full rounded-sm border border-(--border-subtle) px-2 py-1 text-sm'
            />
          </EditableFieldRow>

          <EditableFieldRow
            label='Precio'
            value={plant.price ? `$${Number(plant.price).toFixed(2)}` : 'Sin precio'}
            isEditing={editingField === 'price'}
            onStartEdit={() => startEditing('price', String(plant.price ?? 0))}
            onCancel={cancelEditing}
            onSave={saveEditing}
            disabled={isBusy}
            readOnly={!canManage}
          >
            <input
              type='number'
              min={0}
              step='0.01'
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              className='mt-1 w-full rounded-sm border border-(--border-subtle) px-2 py-1 text-sm'
            />
          </EditableFieldRow>

          <EditableFieldRow
            label='Origen'
            value={plant.origin}
            isEditing={editingField === 'origin'}
            onStartEdit={() => startEditing('origin', plant.origin)}
            onCancel={cancelEditing}
            onSave={saveEditing}
            disabled={isBusy}
            readOnly={!canManage}
          >
            <input
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              className='mt-1 w-full rounded-sm border border-(--border-subtle) px-2 py-1 text-sm'
            />
          </EditableFieldRow>

          <EditableFieldRow
            label='Procedencia'
            value={plant.provenance}
            isEditing={editingField === 'provenance'}
            onStartEdit={() => startEditing('provenance', plant.provenance)}
            onCancel={cancelEditing}
            onSave={saveEditing}
            disabled={isBusy}
            readOnly={!canManage}
          >
            <input
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              className='mt-1 w-full rounded-sm border border-(--border-subtle) px-2 py-1 text-sm'
            />
          </EditableFieldRow>

          <EditableFieldRow
            label='Recolector'
            value={plant.collector}
            isEditing={editingField === 'collector'}
            onStartEdit={() => startEditing('collector', plant.collector)}
            onCancel={cancelEditing}
            onSave={saveEditing}
            disabled={isBusy}
            readOnly={!canManage}
          >
            <input
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              className='mt-1 w-full rounded-sm border border-(--border-subtle) px-2 py-1 text-sm'
            />
          </EditableFieldRow>

          <EditableFieldRow
            label='Endemica'
            value={plant.isEndemic ? 'Si' : 'No'}
            isEditing={editingField === 'isEndemic'}
            onStartEdit={() => startEditing('isEndemic', plant.isEndemic ? 'true' : 'false')}
            onCancel={cancelEditing}
            onSave={saveEditing}
            disabled={isBusy}
            readOnly={!canManage}
          >
            <select
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              className='mt-1 w-full rounded-sm border border-(--border-subtle) px-2 py-1 text-sm'
            >
              <option value='true'>Si</option>
              <option value='false'>No</option>
            </select>
          </EditableFieldRow>

          <div className='rounded-md border border-transparent px-2 py-1.5'>
            <p className='text-xs font-semibold uppercase tracking-wide text-(--text-muted)'>Registro</p>
            <p className='text-sm text-(--text-strong)'>{registrationDate}</p>
          </div>

          <EditableFieldRow
            label='Uso culinario'
            value={plant.mainPopularUse.culinary ? 'Si' : 'No'}
            isEditing={editingField === 'mainPopularUse.culinary'}
            onStartEdit={() =>
              startEditing('mainPopularUse.culinary', plant.mainPopularUse.culinary ? 'true' : 'false')
            }
            onCancel={cancelEditing}
            onSave={saveEditing}
            disabled={isBusy}
            readOnly={!canManage}
          >
            <select
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              className='mt-1 w-full rounded-sm border border-(--border-subtle) px-2 py-1 text-sm'
            >
              <option value='true'>Si</option>
              <option value='false'>No</option>
            </select>
          </EditableFieldRow>

          <EditableFieldRow
            label='Uso medicinal'
            value={plant.mainPopularUse.medicinal ? 'Si' : 'No'}
            isEditing={editingField === 'mainPopularUse.medicinal'}
            onStartEdit={() =>
              startEditing('mainPopularUse.medicinal', plant.mainPopularUse.medicinal ? 'true' : 'false')
            }
            onCancel={cancelEditing}
            onSave={saveEditing}
            disabled={isBusy}
            readOnly={!canManage}
          >
            <select
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              className='mt-1 w-full rounded-sm border border-(--border-subtle) px-2 py-1 text-sm'
            >
              <option value='true'>Si</option>
              <option value='false'>No</option>
            </select>
          </EditableFieldRow>

          <EditableFieldRow
            label='Uso aromatico'
            value={plant.mainPopularUse.aromatic ? 'Si' : 'No'}
            isEditing={editingField === 'mainPopularUse.aromatic'}
            onStartEdit={() =>
              startEditing('mainPopularUse.aromatic', plant.mainPopularUse.aromatic ? 'true' : 'false')
            }
            onCancel={cancelEditing}
            onSave={saveEditing}
            disabled={isBusy}
            readOnly={!canManage}
          >
            <select
              value={draftValue}
              onChange={(event) => setDraftValue(event.target.value)}
              className='mt-1 w-full rounded-sm border border-(--border-subtle) px-2 py-1 text-sm'
            >
              <option value='true'>Si</option>
              <option value='false'>No</option>
            </select>
          </EditableFieldRow>

          <div className='rounded-md border border-transparent px-2 py-1.5 md:col-span-2'>
            <p className='text-xs font-semibold uppercase tracking-wide text-(--text-muted)'>Usos activos</p>
            <p className='text-sm text-(--text-strong)'>
              {usesLabel || 'Sin uso principal declarado'}
            </p>
          </div>
        </div>

        {updateErrorMessage ? (
          <p className='mt-4 rounded-sm bg-[color-mix(in_oklab,var(--status-danger)_15%,white)] px-3 py-2 text-sm text-(--status-danger)'>
            {updateErrorMessage}
          </p>
        ) : null}

        {deleteErrorMessage ? (
          <p className='mt-4 rounded-sm bg-[color-mix(in_oklab,var(--status-danger)_15%,white)] px-3 py-2 text-sm text-(--status-danger)'>
            {deleteErrorMessage}
          </p>
        ) : null}

        <div className='mt-5 flex items-center justify-end'>
          {canManage && (confirmingDelete ? (
            <div className='flex items-center gap-3 rounded-md border border-(--status-danger)/30 bg-[color-mix(in_oklab,var(--status-danger)_8%,white)] px-4 py-3 w-full'>
              <p className='mr-auto text-sm text-(--text-strong)'>
                ¿Eliminar <span className='font-semibold'>{plantName}</span>? Esta accion no se puede deshacer.
              </p>
              <Button
                type='button'
                variant='destructive'
                onClick={handleDelete}
                disabled={isBusy}
                className='inline-flex items-center gap-2'
              >
                {deleteMutation.isPending ? (
                  <><Loader2 size={14} className='animate-spin' /> Eliminando...</>
                ) : (
                  'Confirmar'
                )}
              </Button>
              <Button
                type='button'
                variant='secondary'
                onClick={() => setConfirmingDelete(false)}
                disabled={isBusy}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              type='button'
              variant='destructive'
              onClick={() => setConfirmingDelete(true)}
              disabled={isBusy}
              className='inline-flex items-center gap-2'
            >
              <Trash2 size={16} />
              Eliminar planta
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

function PlantTableRow({ plant, onOpen }: { plant: InventoryPlant; onOpen: (plant: InventoryPlant) => void }) {
  const uses = [
    plant.mainPopularUse.culinary ? 'Culin.' : null,
    plant.mainPopularUse.medicinal ? 'Med.' : null,
    plant.mainPopularUse.aromatic ? 'Arom.' : null,
  ].filter(Boolean).join(' · ')

  return (
    <tr
      className="cursor-pointer border-t border-[color:var(--border-soft)] text-[color:var(--text-body)] transition-colors hover:bg-[color:var(--bg-soft-mint)]/40"
      onClick={() => onOpen(plant)}
    >
      <td className="px-3 py-2.5 font-semibold text-[color:var(--text-strong)]">{plant.id}</td>
      <td className="px-3 py-2.5">
        <img
          src={plant.imagePath || fallbackPlantImage}
          alt={plant.commonName}
          className="size-9 rounded-md object-cover"
        />
      </td>
      <td className="px-3 py-2.5">
        <p className="whitespace-nowrap font-medium text-[color:var(--text-strong)]">{plant.commonName}</p>
        <p className="whitespace-nowrap text-xs italic text-[color:var(--text-muted)]">{plant.scientificName}</p>
      </td>
      <td className="whitespace-nowrap px-3 py-2.5">{plant.family}</td>
      <td className="whitespace-nowrap px-3 py-2.5">{growthFormLabelMap[plant.growthForm] ?? '-'}</td>
      <td className="whitespace-nowrap px-3 py-2.5">{threatCategoryLabelMap[plant.threatCategory]?.split(' ')[0] ?? '-'}</td>
      <td className="whitespace-nowrap px-3 py-2.5">{plant.population ?? 0}</td>
      <td className="whitespace-nowrap px-3 py-2.5 font-semibold text-[color:var(--text-strong)]">
        {plant.price ? `$${Number(plant.price).toFixed(2)}` : '—'}
      </td>
      <td className="px-3 py-2.5">
        {uses ? (
          <span className="rounded-full bg-[color:var(--bg-soft-mint)] px-2 py-0.5 text-[11px] font-medium">{uses}</span>
        ) : <span className="text-xs text-[color:var(--text-muted)]">—</span>}
      </td>
    </tr>
  )
}

export function PlantCardGrid({
  plants,
  isLoading,
  page,
  totalPage,
  onPageChange,
}: PlantCardGridProps) {
  const [selectedPlant, setSelectedPlant] = useState<InventoryPlant | null>(null)

  const isEmpty = !isLoading && plants.length === 0
  const canGoBack = page > 1
  const canGoNext = page < totalPage

  const pageLabel = useMemo(() => `Pagina ${page} de ${Math.max(totalPage, 1)}`, [page, totalPage])

  return (
    <>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-[var(--radius-sm)] bg-[color:var(--bg-soft-mint)]" />
          ))}
        </div>
      ) : null}

      {isEmpty ? (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[color:var(--border-subtle)] p-10 text-center text-sm text-[color:var(--text-muted)]">
          No hay plantas para mostrar con los filtros actuales.
        </div>
      ) : null}

      {!isLoading && !isEmpty ? (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] shadow-[var(--shadow-soft)]">
            <table className="min-w-full text-sm">
              <thead className="bg-[color:var(--bg-canvas)] text-left text-xs font-semibold uppercase tracking-[0.08em] text-[color:var(--text-muted)]">
                <tr>
                  <th className="px-3 py-3">#</th>
                  <th className="px-3 py-3">Foto</th>
                  <th className="px-3 py-3">Nombre</th>
                  <th className="px-3 py-3">Familia</th>
                  <th className="px-3 py-3">Forma</th>
                  <th className="px-3 py-3">Amenaza</th>
                  <th className="px-3 py-3">Stock</th>
                  <th className="px-3 py-3">Precio</th>
                  <th className="px-3 py-3">Usos</th>
                </tr>
              </thead>
              <tbody>
                {plants.map((plant) => (
                  <PlantTableRow key={plant.id} plant={plant} onOpen={setSelectedPlant} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2">
            <p className="mr-auto text-sm text-[color:var(--text-muted)]">{pageLabel}</p>
            <button
              type="button"
              disabled={!canGoBack}
              onClick={() => onPageChange(page - 1)}
              className="rounded-[var(--radius-sm)] border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] px-3 py-1.5 text-sm font-medium text-[color:var(--text-body)] transition-colors hover:bg-[color:var(--bg-soft-mint)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => onPageChange(page + 1)}
              className="rounded-[var(--radius-sm)] border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] px-3 py-1.5 text-sm font-medium text-[color:var(--text-body)] transition-colors hover:bg-[color:var(--bg-soft-mint)] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      ) : null}

      <PlantDetailsModal
        plant={selectedPlant}
        isOpen={selectedPlant !== null}
        onClose={() => setSelectedPlant(null)}
        onPlantUpdated={(nextPlant) => setSelectedPlant(nextPlant)}
        onPlantDeleted={() => setSelectedPlant(null)}
      />
    </>
  )
}

