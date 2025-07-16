// store/slices/userContextSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type UserContext = {
  profileId: string | null
  schoolId: string | null
  role: string | null
}

const initialState: UserContext = {
  profileId: null,
  schoolId: null,
  role: null,
}

const userContextSlice = createSlice({
  name: 'userContext',
  initialState,
  reducers: {
    setUserContext(state, action: PayloadAction<UserContext>) {
      state.profileId = action.payload.profileId
      state.schoolId = action.payload.schoolId
      state.role = action.payload.role
    },
    clearUserContext(state) {
      state.profileId = null
      state.schoolId = null
      state.role = null
    },
  },
})

export const { setUserContext, clearUserContext } = userContextSlice.actions
export default userContextSlice.reducer
