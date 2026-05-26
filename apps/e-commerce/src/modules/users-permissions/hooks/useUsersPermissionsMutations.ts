import { useMutation, useQueryClient } from '@tanstack/react-query'

import { usersPermissionsService } from '@/modules/users-permissions/services/users-permissions.service'
import {
  type ChangePanelUserPasswordInput,
  type CreatePanelUserInput,
  type UpdatePanelUserInput,
} from '@/modules/users-permissions/types/users-permissions.types'

export function useCreatePanelUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePanelUserInput) => usersPermissionsService.createOne(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users-permissions', 'find-many'] })
    },
  })
}

export function useUpdatePanelUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePanelUserInput }) =>
      usersPermissionsService.updateOne(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users-permissions', 'find-many'] })
    },
  })
}

export function useChangePanelUserPasswordMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ChangePanelUserPasswordInput }) =>
      usersPermissionsService.changePassword(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users-permissions', 'find-many'] })
    },
  })
}
