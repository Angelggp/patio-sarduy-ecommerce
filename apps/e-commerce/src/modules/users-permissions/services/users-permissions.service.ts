import { apiClient } from '@/app/api-client'
import {
  type ChangePanelUserPasswordInput,
  type CreatePanelUserInput,
  type PanelUser,
  type UpdatePanelUserInput,
  changePanelUserPasswordSchema,
  createPanelUserSchema,
  panelUserSchema,
  updatePanelUserSchema,
} from '@/modules/users-permissions/types/users-permissions.types'

export const usersPermissionsService = {
  async findMany(): Promise<PanelUser[]> {
    const response = await apiClient.get('/users')
    return panelUserSchema.array().parse(response.data)
  },

  async createOne(payload: CreatePanelUserInput): Promise<PanelUser> {
    const normalizedPayload = createPanelUserSchema.parse(payload)
    const response = await apiClient.post('/users', normalizedPayload)
    return panelUserSchema.parse(response.data)
  },

  async updateOne(id: number, payload: UpdatePanelUserInput): Promise<PanelUser> {
    const normalizedPayload = updatePanelUserSchema.parse(payload)
    const response = await apiClient.patch(`/users/${id}`, normalizedPayload)
    return panelUserSchema.parse(response.data)
  },

  async changePassword(id: number, payload: ChangePanelUserPasswordInput): Promise<PanelUser> {
    const normalizedPayload = changePanelUserPasswordSchema.parse(payload)
    const response = await apiClient.patch(`/users/${id}`, normalizedPayload)
    return panelUserSchema.parse(response.data)
  },
}
