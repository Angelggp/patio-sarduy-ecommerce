import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  X,
} from 'lucide-react'

import { clearAuthSession, type AppDispatch, type RootState } from '@/app/store'
import { type UserRole } from '@/modules/auth/types/auth.types'
import { clearStoredAuthSession } from '@/modules/auth/utils/auth-storage'
import { useOrdersQuery } from '@/modules/orders/hooks/useOrdersQuery'

type NavigationItem = {
  label: string
  to: string
  roles: UserRole[]
  icon: React.ElementType
  badge?: number
}

const primaryNavigation: NavigationItem[] = [
  { label: 'Inventario', to: '/admin/inventario', roles: ['ADMIN', 'ASSISTANT', 'STUDENT'], icon: Archive },
  { label: 'Pedidos', to: '/admin/pedidos', roles: ['ADMIN', 'ASSISTANT'], icon: Package },
  { label: 'Historial', to: '/admin/historial', roles: ['ADMIN', 'ASSISTANT'], icon: ClipboardList },
  { label: 'Pagos', to: '/admin/pagos', roles: ['ADMIN', 'ASSISTANT'], icon: CreditCard },
]

const accessNavigation: NavigationItem = {
  label: 'Usuarios y Permisos',
  to: '/admin/usuarios-permisos',
  roles: ['ADMIN'],
  icon: ShieldCheck,
}

const roleLabelMap: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  ASSISTANT: 'Trabajador',
  STUDENT: 'Estudiante',
  CLIENT: 'Cliente',
}

function NavItem({
  item,
  collapsed,
  onClick,
}: {
  item: NavigationItem
  collapsed: boolean
  onClick?: () => void
}) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition-colors',
          collapsed ? 'justify-center px-2' : '',
          isActive
            ? 'bg-[color:var(--brand-primary)] text-[color:var(--bg-deep-forest)] font-semibold'
            : 'text-[color:var(--text-body)] hover:bg-[color:var(--bg-soft-mint)] hover:text-[color:var(--text-strong)]',
        ].join(' ')
      }
    >
      <span className="relative shrink-0">
        <Icon className="size-4" />
        {!!item.badge && collapsed && (
          <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[color:var(--status-danger)] text-[9px] font-bold text-white">
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
      </span>
      {!collapsed && <span className="flex-1">{item.label}</span>}
      {!collapsed && !!item.badge && (
        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--status-danger)] px-1 text-[11px] font-bold text-white">
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </NavLink>
  )
}

function SidebarContent({
  visibleNav,
  canAccessUsers,
  authUser,
  collapsed,
  onLogout,
  onNavClick,
}: {
  visibleNav: NavigationItem[]
  canAccessUsers: boolean
  authUser: { name: string; role: UserRole } | null
  collapsed: boolean
  onLogout: () => void
  onNavClick?: () => void
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Logo */}
      <div className={`mb-6 min-h-[40px] ${collapsed ? 'flex items-center justify-center' : 'px-1'}`}>
        {collapsed ? (
          <LayoutGrid className="size-5 text-[color:var(--brand-primary)]" />
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">Patio Sarduy</p>
            <p className="mt-0.5 text-base font-semibold text-[color:var(--text-strong)]">Panel Admin</p>
          </>
        )}
      </div>

      {/* Usuario */}
      {authUser && !collapsed && (
        <div className="mb-4 rounded-[var(--radius-sm)] border border-[color:var(--border-soft)] bg-[color:var(--bg-canvas)] px-3 py-2.5">
          <p className="truncate text-sm font-semibold text-[color:var(--text-strong)]">{authUser.name}</p>
          <p className="text-xs text-[color:var(--text-muted)]">{roleLabelMap[authUser.role]}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1">
        {visibleNav.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} onClick={onNavClick} />
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-4 space-y-1 border-t border-[color:var(--border-soft)] pt-4">
        {canAccessUsers && (
          <NavItem item={accessNavigation} collapsed={collapsed} onClick={onNavClick} />
        )}
        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? 'Cerrar sesion' : undefined}
          className={`flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium text-[color:var(--text-body)] transition-colors hover:bg-[color:var(--bg-soft-mint)] hover:text-[color:var(--text-strong)] ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && <span>Cerrar sesion</span>}
        </button>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const dispatch = useDispatch<AppDispatch>()
  const authUser = useSelector((state: RootState) => state.auth.user)
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const canSeeOrders = authUser?.role === 'ADMIN' || authUser?.role === 'ASSISTANT'
  const activeOrdersQuery = useOrdersQuery(
    { page: 1, pageSize: 1, statuses: ['PENDING', 'IN_PROGRESS', 'READY'] },
  )
  const activeOrdersCount = canSeeOrders ? (activeOrdersQuery.data?.meta.total ?? 0) : 0

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  const visibleNav = primaryNavigation
    .filter((item) => authUser ? item.roles.includes(authUser.role) : false)
    .map((item) => item.to === '/admin/pedidos' && activeOrdersCount > 0
      ? { ...item, badge: activeOrdersCount }
      : item
    )
  const canAccessUsers = authUser ? accessNavigation.roles.includes(authUser.role) : false

  function handleLogout() {
    clearStoredAuthSession()
    dispatch(clearAuthSession())
  }

  const sidebarProps = {
    visibleNav,
    canAccessUsers,
    authUser: authUser ? { name: authUser.name, role: authUser.role } : null,
    onLogout: handleLogout,
  }

  return (
    <div className="min-h-svh bg-[color:var(--bg-canvas)] text-[color:var(--text-strong)]">
      {/* ── Mobile header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[color:var(--border-soft)] bg-[color:var(--bg-surface)] px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <LayoutGrid className="size-5 text-[color:var(--brand-primary)]" />
          <span className="font-semibold text-[color:var(--text-strong)]">Patio Sarduy</span>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="rounded-[var(--radius-sm)] p-1.5 text-[color:var(--text-body)] transition hover:bg-[color:var(--bg-soft-mint)]"
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* ── Mobile drawer ─────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-200 ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-[color:var(--border-soft)] bg-[color:var(--bg-surface)] p-5 shadow-[var(--shadow-float)] transition-transform duration-200 ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-[color:var(--text-muted)]">Menu</span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-[var(--radius-sm)] p-1.5 text-[color:var(--text-body)] transition hover:bg-[color:var(--bg-soft-mint)]"
                  aria-label="Cerrar menu"
                >
                  <X className="size-5" />
                </button>
              </div>
              <SidebarContent {...sidebarProps} collapsed={false} onNavClick={() => setDrawerOpen(false)} />
        </aside>
      </div>

      {/* ── Desktop layout ────────────────────────────────────── */}
      <div className="hidden lg:flex lg:min-h-svh">
        {/* Sidebar fijo */}
        <aside
          className={`sticky top-0 flex h-svh shrink-0 flex-col border-r border-[color:var(--border-soft)] bg-[color:var(--bg-surface)] transition-[width] duration-200 ${collapsed ? 'w-16' : 'w-60 xl:w-64'}`}
        >
          <div className="flex flex-1 flex-col overflow-y-auto p-3">
            <SidebarContent {...sidebarProps} collapsed={collapsed} />
          </div>
          {/* Toggle collapse */}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            title={collapsed ? 'Expandir menu' : 'Colapsar menu'}
            className="flex items-center justify-center border-t border-[color:var(--border-soft)] py-3 text-[color:var(--text-muted)] transition-colors hover:bg-[color:var(--bg-soft-mint)] hover:text-[color:var(--text-strong)]"
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 overflow-y-auto p-6 xl:p-8">
          <Outlet />
        </main>
      </div>

      {/* ── Mobile main ───────────────────────────────────────── */}
      <main className="p-4 lg:hidden">
        <Outlet />
      </main>
    </div>
  )
}


