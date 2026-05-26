import { Link, NavLink, Outlet } from 'react-router-dom'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import type { RootState } from '@/app/store'
import { Button } from '@/components/ui/button'
import { clearStoredAuthSession, getStoredAuthSession } from '@/modules/auth/utils/auth-storage'

const links = [
  { to: '/plantas', label: 'Plantas' },
  { to: '/pedidos', label: 'Mis pedidos' },
  { to: '/checkout', label: 'Checkout' },
]

export function CustomerLayout() {
  const itemsByPlantId = useSelector((state: RootState) => state.cart.itemsByPlantId)
  const authSession = getStoredAuthSession()
  const cartItemCount = useMemo(() => {
    return Object.values(itemsByPlantId).reduce<number>((acc, quantity) => acc + quantity, 0)
  }, [itemsByPlantId])

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-8">
          <Link to="/" className="font-heading text-xl text-foreground">
            Patio Sarduy
          </Link>

          <nav className="flex items-center gap-2">
            {links.map((link) => (
              <div key={link.to} className="relative">
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    [
                      'rounded-[var(--radius-pill)] px-4 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-secondary',
                    ].join(' ')
                  }
                >
                  {link.label}
                </NavLink>

                {link.to === '/checkout' && cartItemCount > 0 ? (
                  <span className="absolute -right-2 -top-2 inline-flex min-w-6 items-center justify-center rounded-[var(--radius-pill)] bg-[color:var(--bg-deep-forest)] px-1.5 py-0.5 text-xs font-semibold text-[color:var(--text-on-dark)]">
                    {cartItemCount}
                  </span>
                ) : null}
              </div>
            ))}

            {authSession ? (
              <div className="ml-2 flex items-center gap-2">
                <span className="hidden rounded-[var(--radius-pill)] border border-border bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground sm:inline-flex">
                  {authSession.user.name}
                </span>
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    clearStoredAuthSession()
                    window.location.href = '/plantas'
                  }}
                >
                  Salir
                </Button>
              </div>
            ) : (
              <NavLink
                to="/acceso"
                className={({ isActive }) =>
                  [
                    'ml-2 rounded-[var(--radius-pill)] px-4 py-2 text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border bg-background text-foreground hover:bg-secondary',
                  ].join(' ')
                }
              >
                Acceder / Registrarme
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}
