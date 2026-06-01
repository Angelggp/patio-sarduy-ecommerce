import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useImportCsvMutation } from '@/modules/inventory/hooks/useImportCsvMutation'
import { type ImportCsvResult } from '@/modules/inventory/types/inventory.types'

export function ImportCsvModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportCsvResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mutation = useImportCsvMutation()

  function handleClose() {
    setIsOpen(false)
    setSelectedFile(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    mutation.reset()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setSelectedFile(file)
    setResult(null)
    mutation.reset()
  }

  async function handleImport() {
    if (!selectedFile) return

    try {
      const data = await mutation.mutateAsync(selectedFile)
      setResult(data)
    } catch {
      // El mensaje se muestra desde la mutacion; evitamos una promesa rechazada sin manejar.
    }
  }

  const errorMessage =
    mutation.error && typeof mutation.error === 'object' && 'message' in mutation.error
      ? (mutation.error as { message: string }).message
      : null

  return (
    <>
      <Button variant='outline' onClick={() => setIsOpen(true)}>
        Importar CSV
      </Button>

      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
          <div className='w-full max-w-lg rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-6 shadow-lg'>
            <h2 className='mb-1 text-lg font-semibold text-(--text-primary)'>Importar plantas desde CSV</h2>
            <p className='mb-5 text-sm text-(--text-muted)'>
              Selecciona el archivo CSV exportado del catalogo. Las plantas se agregan sin borrar las existentes.
            </p>

            {/* Resultado */}
            {result ? (
              <div className='space-y-4'>
                <div className='rounded-md border border-(--border-subtle) p-4 text-sm'>
                  <p className='font-medium text-(--text-primary)'>
                    Importacion completada
                  </p>
                  <p className='mt-1 text-(--text-secondary)'>
                    Plantas insertadas: <span className='font-semibold'>{result.inserted}</span>
                                    {result.skipped > 0 && (
                                      <p className='mt-1 text-(--text-secondary)'>
                                        Omitidas (ya existian): <span className='font-semibold'>{result.skipped}</span>
                                      </p>
                                    )}
                  </p>
                  {result.errors.length > 0 && (
                    <div className='mt-3'>
                      <p className='font-medium text-red-600'>
                        Errores ({result.errors.length}):
                      </p>
                      <ul className='mt-1 max-h-40 space-y-1 overflow-y-auto text-red-600'>
                        {result.errors.map((e, i) => (
                          <li key={i} className='text-xs'>
                            <span className='font-medium'>{e.commonName}</span>: {e.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className='flex justify-end'>
                  <Button onClick={handleClose}>Cerrar</Button>
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                {/* Selector de archivo */}
                <label className='flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-(--border-subtle) p-8 text-center transition hover:border-(--brand-primary)'>
                  <p className='text-sm text-(--text-secondary)'>
                    {selectedFile ? selectedFile.name : 'Haz clic para seleccionar un archivo .csv'}
                  </p>
                  {selectedFile && (
                    <p className='mt-1 text-xs text-(--text-muted)'>
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='.csv'
                    className='hidden'
                    onChange={handleFileChange}
                  />
                </label>

                {errorMessage && (
                  <p className='text-sm text-red-600'>{errorMessage}</p>
                )}

                <div className='flex justify-end gap-2'>
                  <Button type='button' variant='outline' onClick={handleClose} disabled={mutation.isPending}>
                    Cancelar
                  </Button>
                  <Button
                    type='button'
                    onClick={handleImport}
                    disabled={!selectedFile || mutation.isPending}
                  >
                    {mutation.isPending ? 'Importando...' : 'Importar'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
