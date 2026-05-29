import { Link, NavLink, Outlet, useLocation, useMatch } from 'react-router-dom'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { ChevronUp, Home, Leaf, ShoppingBag, ClipboardList, User } from 'lucide-react'

import type { RootState } from '@/app/store'
import { clearStoredAuthSession, getStoredAuthSession } from '@/modules/auth/utils/auth-storage'

function NavItem({
  to,
  end,
  badge,
  children,
}: {
  to: string
  end?: boolean
  badge?: number
  children: ReactNode
}) {
  const match = useMatch({ path: to, end: end ?? false })
  const isActive = !!match
  return (
    <div className='relative'>
      <Link
        to={to}
        className={`relative rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors lg:px-4 lg:py-2 lg:text-sm ${
          isActive ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {isActive && (
          <motion.div
            layoutId='nav-active-pill'
            className='absolute inset-0 rounded-full bg-primary'
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          />
        )}
        <span className='relative z-10'>{children}</span>
      </Link>
      {badge != null && badge > 0 && (
        <span className='pointer-events-none absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold leading-none text-background'>
          {badge}
        </span>
      )}
    </div>
  )
}

export function CustomerLayout() {
  const itemsByPlantId = useSelector((state: RootState) => state.cart.itemsByPlantId)
  const authSession = getStoredAuthSession()
  const location = useLocation()

  const cartItemCount = useMemo(
    () => Object.values(itemsByPlantId).reduce<number>((acc, qty) => acc + qty, 0),
    [itemsByPlantId],
  )

  const isLanding = location.pathname === '/'

  const [showScrollTop, setShowScrollTop] = useState(false)
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 380)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className='min-h-svh bg-background text-foreground'>
      {/* ── Top header ──────────────────────────────────────────── */}
      <header className='hidden sticky top-0 z-40 border-b border-border bg-card/85 backdrop-blur-md lg:block'>
        <div className='mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 lg:px-8'>
          <Link to='/' className='shrink-0 font-heading text-lg text-foreground'>
            Patio Sarduy
          </Link>

          {/* Nav desktop — oculto en mobile */}
          <nav className='ml-2 flex items-center gap-1 lg:gap-2'>
            <NavItem to='/plantas'>Plantas</NavItem>
            <NavItem to='/checkout' badge={cartItemCount}>Carrito</NavItem>
            <NavItem to='/pedidos'>Pedidos</NavItem>
          </nav>

          {/* Spacer */}
          <div className='flex-1' />

          {/* Auth */}
          {authSession ? (
            <div className='flex shrink-0 items-center gap-2'>
              <span className='hidden text-xs font-semibold text-muted-foreground lg:block'>
                {authSession.user.name}
              </span>
              <button
                type='button'
                onClick={() => {
                  clearStoredAuthSession()
                  window.location.href = '/plantas'
                }}
                className='rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary'
              >
                Salir
              </button>
            </div>
          ) : (
            <NavLink
              to='/acceso'
              className='shrink-0 rounded-full border border-border px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-secondary lg:px-4 lg:py-1.5 lg:text-sm'
            >
              Acceder
            </NavLink>
          )}
        </div>

      </header>

      {/* ── Main ────────────────────────────────────────────────── */}
      <main
        className={
          isLanding ? 'w-full' : 'mx-auto max-w-6xl px-4 pb-24 pt-8 lg:px-8 lg:pb-8'
        }
      >
        <Outlet />
      </main>

      {/* ── Scroll to top ───────────────────────────────────────── */}
      <motion.button
        type='button'
        aria-label='Volver arriba'
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        initial={false}
        animate={{ opacity: showScrollTop ? 1 : 0, y: showScrollTop ? 0 : 12, pointerEvents: showScrollTop ? 'auto' : 'none' }}
        transition={{ duration: 0.22 }}
        className='fixed bottom-[68px] right-4 z-40 flex size-10 items-center justify-center rounded-full shadow-[var(--shadow-float)] lg:bottom-8 lg:right-8'
        style={{ backgroundColor: 'var(--bg-deep-forest)', color: 'var(--text-on-dark)' }}
      >
        <ChevronUp className='size-5' />
      </motion.button>

      {/* ── Menú flotante — solo mobile ─────────────────────────── */}
      <nav className='fixed bottom-4 left-1/2 z-50 -translate-x-1/2 lg:hidden'>
        <div
          className='flex items-center rounded-full border border-white/15 px-1.5 py-1 shadow-[var(--shadow-float)] backdrop-blur-xl'
          style={{ backgroundColor: 'rgba(8,39,21,0.88)' }}
        >
          <NavLink
            to='/'
            end
            className={({ isActive }) =>
              `flex items-center justify-center rounded-full p-2.5 transition-colors ${isActive ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white/85'}`
            }
          >
            <Home className='size-5' />
          </NavLink>

          <NavLink
            to='/plantas'
            className={({ isActive }) =>
              `flex items-center justify-center rounded-full p-2.5 transition-colors ${isActive ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white/85'}`
            }
          >
            <Leaf className='size-5' />
          </NavLink>

          <div className='relative'>
            <NavLink
              to='/checkout'
              className={({ isActive }) =>
                `flex items-center justify-center rounded-full p-2.5 transition-colors ${isActive ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white/85'}`
              }
            >
              <ShoppingBag className='size-5' />
            </NavLink>
            {cartItemCount > 0 && (
              <span
                className='pointer-events-none absolute -right-0.5 -top-0.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full px-1 text-[9px] font-bold'
                style={{
                  backgroundColor: 'var(--brand-primary)',
                  color: 'var(--bg-deep-forest)',
                }}
              >
                {cartItemCount}
              </span>
            )}
          </div>

          <NavLink
            to='/pedidos'
            className={({ isActive }) =>
              `flex items-center justify-center rounded-full p-2.5 transition-colors ${isActive ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white/85'}`
            }
          >
            <ClipboardList className='size-5' />
          </NavLink>

          {authSession ? (
            <button
              type='button'
              onClick={() => {
                clearStoredAuthSession()
                window.location.href = '/plantas'
              }}
              className='flex items-center justify-center rounded-full p-2.5 text-white/55 transition-colors hover:text-white/85'
            >
              <User className='size-5' />
            </button>
          ) : (
            <NavLink
              to='/acceso'
              className={({ isActive }) =>
                `flex items-center justify-center rounded-full p-2.5 transition-colors ${isActive ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white/85'}`
              }
            >
              <User className='size-5' />
            </NavLink>
          )}
        </div>
      </nav>
    </div>
  )
}
