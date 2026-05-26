import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { type RootState } from '@/app/store'
import { type UserRole } from '@/modules/auth/types/auth.types'
import { getDefaultRouteByRole } from '@/modules/auth/utils/auth-storage'

export function RequireRole({
  roles,
  children,
}: {
  roles: UserRole[]
  children: ReactNode
}) {
  const authUser = useSelector((state: RootState) => state.auth.user)

  if (!authUser) {
    return <Navigate to='/login' replace />
  }

  if (!roles.includes(authUser.role)) {
    return <Navigate to={getDefaultRouteByRole(authUser.role)} replace />
  }

  return <>{children}</>
}
