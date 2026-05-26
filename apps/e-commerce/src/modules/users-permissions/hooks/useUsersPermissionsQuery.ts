import { useQuery } from '@tanstack/react-query'

import { usersPermissionsService } from '@/modules/users-permissions/services/users-permissions.service'

export function useUsersPermissionsQuery() {
  return useQuery({
    queryKey: ['users-permissions', 'find-many'],
    queryFn: () => usersPermissionsService.findMany(),
  })
}
