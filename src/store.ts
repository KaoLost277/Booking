import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './features/counterSlice'
import { todosApi } from "./features/todo/todoSlice"
export const store = configureStore({
  reducer: {
    counter: counterReducer,
    [todosApi.reducerPath]: todosApi.reducer, // <-- ใส่ api reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(todosApi.middleware), // <-- ใส่ api middleware
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch