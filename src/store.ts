import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/authSlice'
import bookReducer from './features/bookSlice'
import masterDataReducer from './features/masterDataSlice'
import customerReducer from './features/customerSlice'
import locationReducer from './features/locationSlice'
import jobTypeReducer from './features/jobTypeSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    book: bookReducer,
    masterData: masterDataReducer,
    customer: customerReducer,
    location: locationReducer,
    jobType: jobTypeReducer,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch