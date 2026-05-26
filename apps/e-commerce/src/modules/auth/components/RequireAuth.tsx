import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { type RootState } from '@/app/store'

export function RequireAuth({ children }: { children: ReactNode }) {
  const authUser = useSelector((state: RootState) => state.auth.user)

  if (!authUser) {
    return <Navigate to='/login' replace />
  }

  return <>{children}</>
}
