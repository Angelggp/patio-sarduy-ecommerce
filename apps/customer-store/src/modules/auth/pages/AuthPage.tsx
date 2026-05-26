import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { KeyRound, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { authService } from '@/modules/auth/services/auth.service'
import { setStoredAuthSession } from '@/modules/auth/utils/auth-storage'

type AuthMode = 'login' | 'register'

export function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>('login')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const loginMutation = useMutation({
    mutationFn: () => authService.login(username, password),
    onSuccess: (session) => {
      setStoredAuthSession(session)
      navigate('/pedidos')
    },
  })

  const registerMutation = useMutation({
    mutationFn: () => authService.register({ username, password, name, phone }),
    onSuccess: (session) => {
      setStoredAuthSession(session)
      navigate('/pedidos')
    },
  })

  const currentMutation = mode === 'login' ? loginMutation : registerMutation

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-[var(--radius-xl)] border border-border bg-[linear-gradient(125deg,#fffdf6_0%,#f2efe1_48%,#e8e8dc_100%)] px-6 py-7 shadow-[var(--shadow-soft)] lg:px-9 lg:py-10">
        <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(8,39,21,0.18)_0%,rgba(8,39,21,0)_72%)]" />
        <div className="pointer-events-none absolute -bottom-20 left-12 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(130,116,83,0.24)_0%,rgba(130,116,83,0)_72%)]" />

        <div className="relative grid gap-7 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              Acceso de clientes
            </p>
            <h1 className="mb-0">Tu jardin tambien tiene historial</h1>
            <p className="max-w-2xl text-sm text-muted-foreground lg:text-base">
              Inicia sesion o crea tu cuenta en segundos. Si antes hiciste pedidos como invitado,
              tu historial se conserva automaticamente cuando nombre y telefono coinciden.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[var(--radius-md)] border border-border bg-card px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Proceso</p>
              <p className="mt-1 text-sm font-semibold text-foreground">Rapido y seguro</p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-border bg-card px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Historial</p>
              <p className="mt-1 text-sm font-semibold text-foreground">Se mantiene intacto</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl rounded-[var(--radius-lg)] border border-border bg-card p-5 shadow-[var(--shadow-soft)] lg:p-7">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="mb-1">Accede a tu panel de pedidos</h2>
            <p className="text-sm text-muted-foreground">
              Usa tus datos de cuenta o registrate para enlazar compras anteriores.
            </p>
          </div>

          <div className="grid grid-cols-2 rounded-[var(--radius-pill)] bg-secondary p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={[
                'rounded-[var(--radius-pill)] px-5 py-2 text-sm font-semibold transition-colors',
                mode === 'login' ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground',
              ].join(' ')}
            >
              Iniciar sesion
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={[
                'rounded-[var(--radius-pill)] px-5 py-2 text-sm font-semibold transition-colors',
                mode === 'register' ? 'bg-primary text-primary-foreground' : 'text-secondary-foreground',
              ].join(' ')}
            >
              Registrarme
            </button>
          </div>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (mode === 'login') {
              loginMutation.mutate()
              return
            }

            registerMutation.mutate()
          }}
        >
          {mode === 'register' ? (
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-foreground">Nombre completo</span>
              <div className="flex h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-input bg-background px-4">
                <UserRound className="size-4 text-muted-foreground" />
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-full w-full border-none bg-transparent outline-none"
                  placeholder="Ej. Ana Perez"
                />
              </div>
            </label>
          ) : null}

          <label className="block space-y-2 text-sm">
            <span className="font-medium text-foreground">Usuario</span>
            <div className="flex h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-input bg-background px-4">
              <UserRound className="size-4 text-muted-foreground" />
              <input
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="h-full w-full border-none bg-transparent outline-none"
                placeholder="tu_usuario"
              />
            </div>
          </label>

          {mode === 'register' ? (
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-foreground">Telefono</span>
              <div className="flex h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-input bg-background px-4">
                <KeyRound className="size-4 text-muted-foreground" />
                <input
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="h-full w-full border-none bg-transparent outline-none"
                  placeholder="56 20 95 52"
                />
              </div>
            </label>
          ) : null}

          <label className="block space-y-2 text-sm">
            <span className="font-medium text-foreground">Contrasena</span>
            <div className="flex h-11 items-center gap-2 rounded-[var(--radius-pill)] border border-input bg-background px-4">
              <KeyRound className="size-4 text-muted-foreground" />
              <input
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-full w-full border-none bg-transparent outline-none"
                placeholder="********"
              />
            </div>
          </label>

          {currentMutation.error ? (
            <p className="text-sm font-medium text-[color:var(--status-danger)]">
              No se pudo completar la operacion. Verifica los datos e intenta de nuevo.
            </p>
          ) : null}

          <div className="rounded-[var(--radius-md)] border border-dashed border-border bg-background px-4 py-3 text-xs text-muted-foreground">
            <p className="inline-flex items-center gap-1.5 font-semibold text-foreground">
              <ShieldCheck className="size-3.5 text-primary" /> Verificacion de historial guest
            </p>
            <p className="mt-1">
              Si los datos personales coinciden con pedidos previos de invitado, el sistema une ese
              historial automaticamente a tu nueva cuenta.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={currentMutation.isPending}>
            {currentMutation.isPending
              ? 'Procesando...'
              : mode === 'login'
                ? 'Entrar a mi cuenta'
                : 'Crear cuenta'}
          </Button>
        </form>
      </div>
    </section>
  )
}
