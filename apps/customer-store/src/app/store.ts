import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit'

type CartState = {
  itemsByPlantId: Record<string, number>
}

const CART_STORAGE_KEY = 'patio-sarduy:cart'

function loadCartState(): CartState {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return { itemsByPlantId: {} }
    return JSON.parse(raw) as CartState
  } catch {
    return { itemsByPlantId: {} }
  }
}

function saveCartState(state: CartState) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // cuota de almacenamiento llena — se ignora
  }
}

const initialCartState: CartState = loadCartState()

const appSlice = createSlice({
  name: 'app',
  initialState: {
    bootstrapped: true,
  },
  reducers: {},
})

const cartSlice = createSlice({
  name: 'cart',
  initialState: initialCartState,
  reducers: {
    incrementPlantQty: (state, action: PayloadAction<string>) => {
      const plantId = action.payload
      state.itemsByPlantId[plantId] = (state.itemsByPlantId[plantId] ?? 0) + 1
    },
    decrementPlantQty: (state, action: PayloadAction<string>) => {
      const plantId = action.payload
      const currentQty = state.itemsByPlantId[plantId] ?? 0

      if (currentQty <= 1) {
        delete state.itemsByPlantId[plantId]
        return
      }

      state.itemsByPlantId[plantId] = currentQty - 1
    },
    setPlantQty: (state, action: PayloadAction<{ plantId: string; quantity: number }>) => {
      const { plantId, quantity } = action.payload
      if (quantity <= 0) {
        delete state.itemsByPlantId[plantId]
        return
      }

      state.itemsByPlantId[plantId] = quantity
    },
    clearCartState: (state) => {
      state.itemsByPlantId = {}
    },
  },
})

export const { incrementPlantQty, decrementPlantQty, setPlantQty, clearCartState } =
  cartSlice.actions

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    cart: cartSlice.reducer,
  },
})

store.subscribe(() => {
  saveCartState(store.getState().cart)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
