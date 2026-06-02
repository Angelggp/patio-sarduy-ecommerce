import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { authService } from '@/modules/auth/services/auth.service'
import { getAuthErrorMessage } from '@/modules/auth/utils/get-auth-error-message'
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
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border shadow-[var(--shadow-soft)] lg:grid lg:min-h-[72svh] lg:grid-cols-2">
      {/* ── Panel izquierdo — info, solo desktop ── */}
      <div
        className="hidden flex-col justify-between p-10 lg:flex"
        style={{ backgroundColor: 'var(--bg-deep-forest)' }}
      >
        <p className="font-heading text-xl" style={{ color: 'var(--text-on-dark)' }}>
          Patio Sarduy
        </p>

        <div className="space-y-4">
          <h2 className="mb-0 text-[2.1rem] leading-[1.1]" style={{ color: 'var(--text-on-dark)' }}>
            Tu jardín<br />también tiene<br />historial
          </h2>
          <p className="max-w-xs text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Inicia sesión o crea tu cuenta en segundos. Si antes hiciste pedidos como invitado,
            tu historial se une automáticamente cuando los datos coinciden.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Proceso', value: 'Rápido y seguro' },
            { label: 'Historial', value: 'Se mantiene intacto' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[var(--radius-md)] px-4 py-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
            >
              <p className="text-xs uppercase tracking-[0.1em]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {item.label}
              </p>
              <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--text-on-dark)' }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div className="flex flex-col justify-center bg-card p-6 lg:p-10">
        {/* Logo visible solo en mobile */}
        <div className="mb-8 lg:hidden">
          <p className="font-heading text-xl text-foreground">Patio Sarduy</p>
          <p className="text-xs text-muted-foreground">Acceso de clientes</p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-1 text-2xl">
              {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {mode === 'login'
                ? 'Entra a tu panel y consulta el historial de pedidos.'
                : 'Regístrate para llevar el control de tus compras.'}
            </p>
          </div>

          {/* Tabs login / registro */}
          <div className="grid grid-cols-2 rounded-full bg-secondary p-1">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                mode === 'login'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-secondary-foreground hover:text-foreground'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                mode === 'register'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-secondary-foreground hover:text-foreground'
              }`}
            >
              Registrarme
            </button>
          </div>

          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault()
              currentMutation.mutate()
            }}
          >
            {mode === 'register' ? (
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Nombre completo</span>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Ana Pérez"
                  className="h-11 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                />
              </label>
            ) : null}

            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Usuario</span>
              <input
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="tu_usuario"
                className="h-11 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
              />
            </label>

            {mode === 'register' ? (
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Teléfono</span>
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="56 20 95 52"
                  className="h-11 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                />
              </label>
            ) : null}

            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Contraseña</span>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
              />
            </label>

            {currentMutation.error ? (
              <p className="text-sm font-medium leading-relaxed text-[color:var(--status-danger)]">
                {getAuthErrorMessage(currentMutation.error)}
              </p>
            ) : null}

            <div className="pt-1">
              <button
                type="submit"
                disabled={currentMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                style={{ backgroundColor: 'var(--bg-deep-forest)', color: 'var(--text-on-dark)' }}
              >
                {currentMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Procesando...
                  </>
                ) : mode === 'login' ? (
                  'Entrar a mi cuenta'
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </div>

            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              Los pedidos previos como invitado se enlazan automáticamente si los datos coinciden.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
