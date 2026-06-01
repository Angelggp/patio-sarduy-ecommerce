import axios from 'axios'
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AlertTriangle, KeyRound, Loader2, PencilLine, ShieldCheck, UserPlus } from 'lucide-react'
import { useSelector } from 'react-redux'

import { type RootState } from '@/app/store'
import { Button } from '@/components/ui/button'
import { type UserRole, userRoleValues } from '@/modules/auth/types/auth.types'
import {
  useChangePanelUserPasswordMutation,
  useCreatePanelUserMutation,
  useUpdatePanelUserMutation,
} from '@/modules/users-permissions/hooks/useUsersPermissionsMutations'
import { useUsersPermissionsQuery } from '@/modules/users-permissions/hooks/useUsersPermissionsQuery'
import { type PanelUser } from '@/modules/users-permissions/types/users-permissions.types'

type EditFormState = {
  username: string
  name: string
  phone: string
  role: UserRole
  isActive: boolean
}

type CreateFormState = {
  username: string
  name: string
  phone: string
  password: string
  role: UserRole
  isActive: boolean
}

type PasswordFormState = {
  password: string
  confirmPassword: string
}

type UserMenuState = {
  userId: number
  top: number
  left: number
}

const roleLabelMap: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  ASSISTANT: 'Trabajador',
  STUDENT: 'Estudiante',
  CLIENT: 'Cliente',
}

const roleBadgeMap: Record<UserRole, string> = {
  ADMIN: 'bg-(--status-success)/20 text-(--text-strong)',
  ASSISTANT: 'bg-(--brand-primary-soft) text-(--bg-deep-forest)',
  STUDENT: 'bg-(--bg-canvas) text-(--text-body)',
  CLIENT: 'bg-(--bg-canvas) text-(--text-body)',
}

function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat('es-CU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { message?: string | string[] } | undefined

    if (Array.isArray(payload?.message) && payload.message.length > 0) {
      return payload.message.join(', ')
    }

    if (typeof payload?.message === 'string' && payload.message.trim().length > 0) {
      return payload.message
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return fallback
}

function initialCreateForm(): CreateFormState {
  return {
    username: '',
    name: '',
    phone: '',
    password: '',
    role: 'STUDENT',
    isActive: true,
  }
}

function initialPasswordForm(): PasswordFormState {
  return {
    password: '',
    confirmPassword: '',
  }
}

function toEditForm(user: PanelUser): EditFormState {
  return {
    username: user.username,
    name: user.name,
    phone: user.phone ?? '',
    role: user.role,
    isActive: user.isActive,
  }
}

function ModalShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]'>
      <div className='w-full max-w-xl overflow-hidden rounded-(--radius-lg) border border-(--border-soft) bg-(--bg-surface) shadow-(--shadow-soft)'>
        <div className='h-1 bg-[linear-gradient(90deg,var(--brand-primary),transparent)]' />
        <div className='p-5'>
        <h3 className='text-lg font-semibold text-(--text-strong)'>{title}</h3>
        <p className='mt-1 text-sm text-(--text-body)'>{description}</p>
        {children}
        </div>
      </div>
    </div>
  )
}

export function UsersPermissionsPage() {
  const authUser = useSelector((state: RootState) => state.auth.user)
  const usersQuery = useUsersPermissionsQuery()
  const createMutation = useCreatePanelUserMutation()
  const updateMutation = useUpdatePanelUserMutation()
  const passwordMutation = useChangePanelUserPasswordMutation()

  const isAdmin = authUser?.role === 'ADMIN'
  const canCreateUsers = isAdmin
  const canEditRoles = isAdmin

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState<CreateFormState>(initialCreateForm)
  const [editingUser, setEditingUser] = useState<PanelUser | null>(null)
  const [editForm, setEditForm] = useState<EditFormState | null>(null)
  const [passwordUser, setPasswordUser] = useState<PanelUser | null>(null)
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(initialPasswordForm)
  const [menuState, setMenuState] = useState<UserMenuState | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const sortedUsers = useMemo(() => usersQuery.data ?? [], [usersQuery.data])
  const usersStats = useMemo(() => {
    const users = sortedUsers
    const total = users.length
    const active = users.filter((user) => user.isActive).length
    const inactive = total - active
    const admins = users.filter((user) => user.role === 'ADMIN').length

    return { total, active, inactive, admins }
  }, [sortedUsers])

  const errorMessage = usersQuery.isError
    ? getApiErrorMessage(usersQuery.error, 'No se pudo cargar la lista de usuarios.')
    : createMutation.isError
      ? getApiErrorMessage(createMutation.error, 'No se pudo crear el usuario.')
      : updateMutation.isError
        ? getApiErrorMessage(updateMutation.error, 'No se pudo actualizar el usuario.')
        : passwordMutation.isError
          ? getApiErrorMessage(passwordMutation.error, 'No se pudo cambiar la contrasena.')
          : null

  const isBusy = createMutation.isPending || updateMutation.isPending || passwordMutation.isPending

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const createdUser = await createMutation.mutateAsync({
      username: createForm.username.trim(),
      name: createForm.name.trim(),
      phone: createForm.phone.trim() || undefined,
      password: createForm.password,
      role: createForm.role,
    })

    if (!createForm.isActive) {
      await updateMutation.mutateAsync({
        id: createdUser.id,
        payload: { isActive: false },
      })
    }

    setCreateForm(initialCreateForm())
    setIsCreateModalOpen(false)
  }

  async function handleSaveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editingUser || !editForm) {
      return
    }

    await updateMutation.mutateAsync({
      id: editingUser.id,
      payload: {
        username: editForm.username.trim(),
        name: editForm.name.trim(),
        phone: editForm.phone.trim() || undefined,
        role: canEditRoles ? editForm.role : undefined,
        isActive: editForm.isActive,
      },
    })

    setEditingUser(null)
    setEditForm(null)
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!passwordUser || passwordForm.password !== passwordForm.confirmPassword) {
      return
    }

    await passwordMutation.mutateAsync({
      id: passwordUser.id,
      payload: { password: passwordForm.password },
    })

    setPasswordUser(null)
    setPasswordForm(initialPasswordForm())
  }

  function toggleUserMenu(userId: number, trigger: HTMLButtonElement) {
    if (menuState?.userId === userId) {
      setMenuState(null)
      return
    }

    const rect = trigger.getBoundingClientRect()
    const menuWidth = 208
    const menuHeight = 96
    const gutter = 8
    const openUp = window.innerHeight - rect.bottom < menuHeight + gutter

    const top = openUp ? rect.top - menuHeight - gutter : rect.bottom + gutter
    const maxLeft = window.innerWidth - menuWidth - gutter
    const left = Math.max(gutter, Math.min(rect.right - menuWidth, maxLeft))

    setMenuState({ userId, top, left })
  }

  useEffect(() => {
    if (!menuState) {
      return
    }

    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null

      if (!target) {
        setMenuState(null)
        return
      }

      if (target.closest('[data-user-menu-trigger="true"]')) {
        return
      }

      if (menuRef.current?.contains(target)) {
        return
      }

      setMenuState(null)
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuState(null)
      }
    }

    function handleViewportChange() {
      setMenuState(null)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)
    window.addEventListener('scroll', handleViewportChange, true)
    window.addEventListener('resize', handleViewportChange)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
      window.removeEventListener('scroll', handleViewportChange, true)
      window.removeEventListener('resize', handleViewportChange)
    }
  }, [menuState])

  return (
    <section className='space-y-5'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h1 className='text-2xl font-semibold text-[color:var(--text-strong)] sm:text-3xl'>Usuarios y Permisos</h1>
          <p className='mt-0.5 text-sm text-[color:var(--text-body)]'>
            Gestiona usuarios del panel, edita datos y cambia contrasenas.
          </p>
        </div>
        {canCreateUsers ? (
          <button
            type='button'
            onClick={() => {
              setCreateForm(initialCreateForm())
              setIsCreateModalOpen(true)
            }}
            className='inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[color:var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[color:var(--bg-deep-forest)] transition hover:bg-[color:var(--brand-primary-hover)]'
          >
            <UserPlus size={15} />
            Agregar usuario
          </button>
        ) : null}
      </div>

      {!canCreateUsers ? (
        <div className='rounded-(--radius-sm) border border-(--border-subtle) bg-(--bg-canvas) px-4 py-3 text-sm text-(--text-body)'>
          Como asistente puedes editar datos y cambiar contrasenas, pero no crear nuevos usuarios.
        </div>
      ) : null}

      {errorMessage ? (
        <div className='flex items-center gap-2 rounded-(--radius-sm) border border-(--status-danger)/30 bg-(--status-danger)/10 px-4 py-3 text-sm text-(--text-strong)'>
          <AlertTriangle size={16} />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <section className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
        <article className='rounded-(--radius-md) border border-(--border-subtle) bg-(--bg-surface) p-4'>
          <p className='text-xs uppercase tracking-[0.12em] text-(--text-muted)'>Total usuarios</p>
          <p className='mt-1 text-2xl font-semibold text-(--text-strong)'>{usersStats.total}</p>
        </article>
        <article className='rounded-(--radius-md) border border-(--border-subtle) bg-(--bg-surface) p-4'>
          <p className='text-xs uppercase tracking-[0.12em] text-(--text-muted)'>Activos</p>
          <p className='mt-1 text-2xl font-semibold text-(--text-strong)'>{usersStats.active}</p>
        </article>
        <article className='rounded-(--radius-md) border border-(--border-subtle) bg-(--bg-surface) p-4'>
          <p className='text-xs uppercase tracking-[0.12em] text-(--text-muted)'>Inactivos</p>
          <p className='mt-1 text-2xl font-semibold text-(--text-strong)'>{usersStats.inactive}</p>
        </article>
        <article className='rounded-(--radius-md) border border-(--border-subtle) bg-(--bg-surface) p-4'>
          <p className='text-xs uppercase tracking-[0.12em] text-(--text-muted)'>Administradores</p>
          <p className='mt-1 text-2xl font-semibold text-(--text-strong)'>{usersStats.admins}</p>
        </article>
      </section>

      <div className='overflow-x-auto rounded-(--radius-md) border border-(--border-subtle) bg-(--bg-surface) shadow-(--shadow-soft)'>
        <table className='min-w-full text-sm'>
          <thead className='sticky top-0 bg-(--bg-canvas) text-left text-xs uppercase tracking-[0.08em] text-(--text-muted)'>
            <tr>
              <th className='px-4 py-3'>ID</th>
              <th className='px-4 py-3'>Usuario</th>
              <th className='px-4 py-3'>Nombre</th>
              <th className='px-4 py-3'>Telefono</th>
              <th className='px-4 py-3'>Rol</th>
              <th className='px-4 py-3'>Estado</th>
              <th className='px-4 py-3'>Creado</th>
              <th className='px-4 py-3 text-right'>Opciones</th>
            </tr>
          </thead>
          <tbody>
            {usersQuery.isLoading ? (
              <tr>
                <td colSpan={8} className='px-4 py-6 text-center text-(--text-muted)'>
                  Cargando usuarios...
                </td>
              </tr>
            ) : null}

            {!usersQuery.isLoading && sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className='px-4 py-6 text-center text-(--text-muted)'>
                  No hay usuarios para mostrar.
                </td>
              </tr>
            ) : null}

            {!usersQuery.isLoading
              ? sortedUsers.map((user) => (
                  <tr key={user.id} className='border-t border-(--border-soft) text-(--text-body) odd:bg-(--bg-surface) even:bg-(--bg-canvas)/55 hover:bg-(--bg-soft-mint)/40'>
                    <td className='px-4 py-3 font-semibold text-(--text-strong)'>{user.id}</td>
                    <td className='px-4 py-3 font-medium text-(--text-strong)'>{user.username}</td>
                    <td className='px-4 py-3'>{user.name}</td>
                    <td className='px-4 py-3'>{user.phone ?? '-'}</td>
                    <td className='px-4 py-3'>
                      <span className={[
                        'rounded-(--radius-pill) px-3 py-1 text-xs font-semibold',
                        roleBadgeMap[user.role],
                      ].join(' ')}>
                        {roleLabelMap[user.role]}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={[
                          'rounded-(--radius-pill) px-3 py-1 text-xs font-semibold',
                          user.isActive ? 'bg-(--status-success)/15 text-(--text-strong)' : 'bg-(--status-danger)/15 text-(--text-strong)',
                        ].join(' ')}
                      >
                        {user.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className='px-4 py-3'>{formatDate(user.createdAt)}</td>
                    <td className='relative px-4 py-3 text-right'>
                      <Button
                        variant='outline'
                        size='sm'
                        data-user-menu-trigger='true'
                        className='hover:border-(--brand-primary) hover:text-(--text-strong)'
                        onClick={(event) => {
                          toggleUserMenu(user.id, event.currentTarget)
                        }}
                      >
                        Opciones
                      </Button>

                      {menuState?.userId === user.id ? (
                        <div
                          ref={menuRef}
                          className='fixed z-20 w-52 rounded-(--radius-sm) border border-(--border-soft) bg-(--bg-surface) p-1 shadow-(--shadow-soft) backdrop-blur-[2px]'
                          style={{ top: `${menuState.top}px`, left: `${menuState.left}px` }}
                        >
                          <button
                            type='button'
                            className='flex w-full items-center gap-2 rounded-(--radius-sm) px-3 py-2 text-left text-sm text-(--text-strong) hover:bg-(--bg-canvas)'
                            onClick={() => {
                              setEditingUser(user)
                              setEditForm(toEditForm(user))
                              setMenuState(null)
                            }}
                          >
                            <PencilLine size={14} />
                            Editar
                          </button>
                          <button
                            type='button'
                            className='flex w-full items-center gap-2 rounded-(--radius-sm) px-3 py-2 text-left text-sm text-(--text-strong) hover:bg-(--bg-canvas)'
                            onClick={() => {
                              setPasswordUser(user)
                              setPasswordForm(initialPasswordForm())
                              setMenuState(null)
                            }}
                          >
                            <KeyRound size={14} />
                            Cambiar contrasena
                          </button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen ? (
        <ModalShell title='Agregar nuevo usuario' description='Completa los campos disponibles del modelo de usuario.'>
          <form onSubmit={handleCreateUser} className='mt-4'>
            <div className='grid gap-3 md:grid-cols-2'>
              <input
                required
                minLength={3}
                placeholder='Username'
                value={createForm.username}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, username: event.target.value }))}
                className='rounded-(--radius-sm) border border-(--border-subtle) px-3 py-2 text-sm outline-none focus:border-(--brand-primary)'
              />
              <input
                required
                minLength={2}
                placeholder='Nombre'
                value={createForm.name}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, name: event.target.value }))}
                className='rounded-(--radius-sm) border border-(--border-subtle) px-3 py-2 text-sm outline-none focus:border-(--brand-primary)'
              />
              <input
                minLength={6}
                maxLength={20}
                placeholder='Telefono (opcional)'
                value={createForm.phone}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, phone: event.target.value }))}
                className='rounded-(--radius-sm) border border-(--border-subtle) px-3 py-2 text-sm outline-none focus:border-(--brand-primary)'
              />
              <select
                value={createForm.role}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, role: event.target.value as UserRole }))}
                className='rounded-(--radius-sm) border border-(--border-subtle) px-3 py-2 text-sm outline-none focus:border-(--brand-primary)'
              >
                {userRoleValues.filter((role) => role !== 'CLIENT').map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <input
                required
                minLength={4}
                type='password'
                placeholder='Contrasena'
                value={createForm.password}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
                className='rounded-(--radius-sm) border border-(--border-subtle) px-3 py-2 text-sm outline-none focus:border-(--brand-primary) md:col-span-2'
              />
            </div>

            <label className='mt-3 inline-flex items-center gap-2 text-sm text-(--text-body)'>
              <input
                type='checkbox'
                checked={createForm.isActive}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, isActive: event.target.checked }))}
              />
              Usuario activo
            </label>

            <div className='mt-5 flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                disabled={isBusy}
                onClick={() => {
                  setIsCreateModalOpen(false)
                  setCreateForm(initialCreateForm())
                }}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isBusy} className='inline-flex items-center gap-2'>
                {createMutation.isPending ? <><Loader2 size={14} className='animate-spin' /> Creando...</> : 'Crear usuario'}
              </Button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {editingUser && editForm ? (
        <ModalShell title={`Editar usuario #${editingUser.id}`} description='Modifica los datos del usuario. La contrasena se gestiona aparte.'>
          <form onSubmit={handleSaveUser} className='mt-4'>
            <div className='grid gap-3 md:grid-cols-2'>
              <input
                required
                minLength={3}
                value={editForm.username}
                onChange={(event) => setEditForm((prev) => (prev ? { ...prev, username: event.target.value } : prev))}
                className='rounded-(--radius-sm) border border-(--border-subtle) px-3 py-2 text-sm outline-none focus:border-(--brand-primary)'
              />
              <input
                required
                minLength={2}
                value={editForm.name}
                onChange={(event) => setEditForm((prev) => (prev ? { ...prev, name: event.target.value } : prev))}
                className='rounded-(--radius-sm) border border-(--border-subtle) px-3 py-2 text-sm outline-none focus:border-(--brand-primary)'
              />
              <input
                minLength={6}
                maxLength={20}
                placeholder='Telefono (opcional)'
                value={editForm.phone}
                onChange={(event) => setEditForm((prev) => (prev ? { ...prev, phone: event.target.value } : prev))}
                className='rounded-(--radius-sm) border border-(--border-subtle) px-3 py-2 text-sm outline-none focus:border-(--brand-primary)'
              />
              <select
                value={editForm.role}
                disabled={!canEditRoles}
                onChange={(event) => setEditForm((prev) => (prev ? { ...prev, role: event.target.value as UserRole } : prev))}
                className='rounded-(--radius-sm) border border-(--border-subtle) px-3 py-2 text-sm outline-none focus:border-(--brand-primary) disabled:opacity-60'
              >
                {userRoleValues.filter((role) => role !== 'CLIENT').map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <label className='mt-3 inline-flex items-center gap-2 text-sm text-(--text-body)'>
              <input
                type='checkbox'
                checked={editForm.isActive}
                onChange={(event) => setEditForm((prev) => (prev ? { ...prev, isActive: event.target.checked } : prev))}
              />
              Usuario activo
            </label>

            <div className='mt-5 flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                disabled={isBusy}
                onClick={() => {
                  setEditingUser(null)
                  setEditForm(null)
                }}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isBusy} className='inline-flex items-center gap-2'>
                {updateMutation.isPending ? <><Loader2 size={14} className='animate-spin' /> Guardando...</> : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {passwordUser ? (
        <ModalShell title='Cambiar contrasena' description={`Usuario: ${passwordUser.username}`}>
          <form onSubmit={handleChangePassword} className='mt-4'>
            <div className='space-y-3'>
              <input
                required
                minLength={4}
                type='password'
                placeholder='Nueva contrasena'
                value={passwordForm.password}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, password: event.target.value }))}
                className='w-full rounded-(--radius-sm) border border-(--border-subtle) px-3 py-2 text-sm outline-none focus:border-(--brand-primary)'
              />
              <input
                required
                minLength={4}
                type='password'
                placeholder='Confirmar contrasena'
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                className='w-full rounded-(--radius-sm) border border-(--border-subtle) px-3 py-2 text-sm outline-none focus:border-(--brand-primary)'
              />
            </div>

            {passwordForm.confirmPassword.length > 0 && passwordForm.password !== passwordForm.confirmPassword ? (
              <p className='mt-2 text-xs text-(--status-danger)'>Las contrasenas no coinciden.</p>
            ) : null}

            <div className='mt-5 flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                disabled={isBusy}
                onClick={() => {
                  setPasswordUser(null)
                  setPasswordForm(initialPasswordForm())
                }}
              >
                Cancelar
              </Button>
              <Button type='submit' disabled={isBusy || passwordForm.password !== passwordForm.confirmPassword} className='inline-flex items-center gap-2'>
                {passwordMutation.isPending ? <><Loader2 size={14} className='animate-spin' /> Actualizando...</> : 'Cambiar contrasena'}
              </Button>
            </div>
          </form>
        </ModalShell>
      ) : null}
    </section>
  )
}
