import { NavLink, Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { Button } from '@/components/ui/button'
import { clearAuthSession, type AppDispatch, type RootState } from '@/app/store'
import { type UserRole } from '@/modules/auth/types/auth.types'
import { clearStoredAuthSession } from '@/modules/auth/utils/auth-storage'

type NavigationItem = {
  label: string
  to: string
  roles: UserRole[]
}

const primaryNavigation: NavigationItem[] = [
  { label: 'Inventario', to: '/admin/inventario', roles: ['ADMIN', 'ASSISTANT', 'STUDENT'] },
  { label: 'Pedidos', to: '/admin/pedidos', roles: ['ADMIN', 'ASSISTANT'] },
  { label: 'Historial', to: '/admin/historial', roles: ['ADMIN', 'ASSISTANT'] },
  { label: 'Pagos', to: '/admin/pagos', roles: ['ADMIN', 'ASSISTANT'] },
]

const accessNavigation: NavigationItem = {
  label: 'Usuarios y Permisos',
  to: '/admin/usuarios-permisos',
  roles: ['ADMIN', 'ASSISTANT'],
}

const roleLabelMap: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  ASSISTANT: 'Asistente',
  STUDENT: 'Estudiante',
  CLIENT: 'Cliente',
}

function SidebarLink({ item }: { item: NavigationItem }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        [
          'block rounded-[var(--radius-pill)] px-4 py-3 text-sm font-semibold tracking-[0.02em] transition-colors duration-200',
          isActive
            ? 'bg-[color:var(--brand-primary)] text-[color:var(--bg-deep-forest)]'
            : 'text-[color:var(--text-muted)] hover:bg-[color:var(--bg-soft-mint)] hover:text-[color:var(--text-strong)]',
        ].join(' ')
      }
    >
      {item.label}
    </NavLink>
  )
}

export function AdminLayout() {
  const dispatch = useDispatch<AppDispatch>()
  const authUser = useSelector((state: RootState) => state.auth.user)

  const visiblePrimaryNavigation = primaryNavigation.filter((item) =>
    authUser ? item.roles.includes(authUser.role) : false,
  )
  const canAccessUsersPermissions = authUser ? accessNavigation.roles.includes(authUser.role) : false

  function handleLogout() {
    clearStoredAuthSession()
    dispatch(clearAuthSession())
  }

  return (
    <div className='min-h-svh bg-[color:var(--bg-canvas)] text-[color:var(--text-strong)]'>
      <div className='mx-auto flex min-h-svh max-w-[1360px] flex-col gap-6 p-4 md:p-6 lg:flex-row lg:gap-8 lg:p-8'>
        <aside className='relative flex w-full shrink-0 flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] p-4 shadow-[var(--shadow-soft)] lg:w-[300px]'>
          <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,95,0.20),_transparent_55%)]' />

          <div className='relative mb-8'>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]'>
              Patio Sarduy
            </p>
            <h1 className='mt-2 font-heading text-[28px] font-semibold leading-[1.1] text-[color:var(--text-strong)]'>
              Panel de Administracion
            </h1>
            {authUser ? (
              <div className='mt-2 rounded-(--radius-sm) border border-(--border-soft) bg-(--bg-canvas) px-3 py-2'>
                <p className='text-sm font-semibold text-(--text-strong)'>{authUser.name}</p>
                <p className='text-xs uppercase tracking-[0.12em] text-(--text-muted)'>
                  {roleLabelMap[authUser.role]}
                </p>
              </div>
            ) : null}
          </div>

          <nav className='relative flex flex-col gap-2'>
            {visiblePrimaryNavigation.map((item) => (
              <SidebarLink key={item.to} item={item} />
            ))}
          </nav>

          <div className='relative mt-auto space-y-3 border-t border-[color:var(--border-soft)] pt-4'>
            {canAccessUsersPermissions ? <SidebarLink item={accessNavigation} /> : null}
            <Button variant='outline' className='w-full' onClick={handleLogout}>
              Cerrar sesion
            </Button>
          </div>
        </aside>

        <main className='relative flex-1 overflow-hidden rounded-[var(--radius-xl)] border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] shadow-[var(--shadow-soft)]'>
          <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(155deg,_rgba(34,211,95,0.12)_0%,_rgba(255,255,255,0)_45%)]' />
          <div className='relative h-full p-6 md:p-8'>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
