import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { type AuthSession, type AuthUser } from '@/modules/auth/types/auth.types'
import { getStoredAuthSession } from '@/modules/auth/utils/auth-storage'

const storedSession = getStoredAuthSession()

const appSlice = createSlice({
  name: 'app',
  initialState: {
    bootstrapped: true,
  },
  reducers: {},
})

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    accessToken: storedSession?.accessToken ?? null,
    refreshToken: storedSession?.refreshToken ?? null,
    user: storedSession?.user ?? null,
  } satisfies AuthState,
  reducers: {
    setAuthSession: (state, action: PayloadAction<AuthSession>) => {
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.user = action.payload.user
    },
    clearAuthSession: (state) => {
      state.accessToken = null
      state.refreshToken = null
      state.user = null
    },
  },
})

export const { setAuthSession, clearAuthSession } = authSlice.actions

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    auth: authSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
