import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { type RootState } from '@/app/store'
import { getDefaultRouteByRole } from '@/modules/auth/utils/auth-storage'

export function RootRedirect() {
  const authUser = useSelector((state: RootState) => state.auth.user)

  if (!authUser) {
    return <Navigate to='/login' replace />
  }

  return <Navigate to={getDefaultRouteByRole(authUser.role)} replace />
}
