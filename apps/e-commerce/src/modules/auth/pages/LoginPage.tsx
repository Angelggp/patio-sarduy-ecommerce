import { useState, type FormEvent } from 'react'
import { Loader2, LogIn } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { setAuthSession } from '@/app/store'
import { type AppDispatch, type RootState } from '@/app/store'
import { authService } from '@/modules/auth/services/auth.service'
import { getAuthErrorMessage } from '@/modules/auth/utils/get-auth-error-message'
import { getDefaultRouteByRole, setStoredAuthSession } from '@/modules/auth/utils/auth-storage'

export function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const authUser = useSelector((state: RootState) => state.auth.user)

  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (authUser) {
    return <Navigate to={getDefaultRouteByRole(authUser.role)} replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const session = await authService.login(username.trim(), password)
      setStoredAuthSession(session)
      dispatch(setAuthSession(session))
      navigate(getDefaultRouteByRole(session.user.role), { replace: true })
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className='relative flex min-h-svh items-center justify-center overflow-hidden bg-(--bg-canvas) p-6'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(34,211,95,0.2),_transparent_40%),radial-gradient(circle_at_80%_80%,_rgba(8,39,21,0.15),_transparent_45%)]' />

      <div className='relative w-full max-w-md rounded-(--radius-xl) border border-(--border-subtle) bg-(--bg-surface) p-6 shadow-(--shadow-card)'>
        <p className='text-xs font-semibold uppercase tracking-[0.2em] text-(--text-muted)'>El Patio</p>
        <h1 className='mt-2 text-3xl font-semibold text-(--text-strong)'>Iniciar Sesion</h1>
        <p className='mt-1 text-sm text-(--text-body)'>Accede con tu usuario para entrar al panel.</p>

        <form className='mt-6 space-y-4' onSubmit={handleSubmit}>
          <label className='block space-y-1'>
            <span className='text-sm font-medium text-(--text-strong)'>Usuario</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className='w-full rounded-(--radius-sm) border border-(--border-subtle) bg-white px-3 py-2 text-sm outline-none transition focus:border-(--brand-primary)'
              placeholder='admin'
              autoComplete='username'
            />
          </label>

          <label className='block space-y-1'>
            <span className='text-sm font-medium text-(--text-strong)'>Contrasena</span>
            <input
              type='password'
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className='w-full rounded-(--radius-sm) border border-(--border-subtle) bg-white px-3 py-2 text-sm outline-none transition focus:border-(--brand-primary)'
              placeholder='********'
              autoComplete='current-password'
            />
          </label>

          {errorMessage ? (
            <p className='rounded-(--radius-sm) border border-(--status-danger)/35 bg-(--status-danger)/10 px-3 py-2 text-sm text-(--text-strong)'>
              {errorMessage}
            </p>
          ) : null}

          <Button type='submit' className='w-full' disabled={isSubmitting}>
            {isSubmitting ? (
              <><Loader2 size={16} className='animate-spin' /> Entrando...</>
            ) : (
              <><LogIn size={16} /> Entrar</>
            )}
          </Button>
        </form>
      </div>
    </section>
  )
}
