// store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import { useDispatch } from 'react-redux'
import userContextReducer from './slices/userContextSlice'

export const store = configureStore({
  reducer: {
    userContext: userContextReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()