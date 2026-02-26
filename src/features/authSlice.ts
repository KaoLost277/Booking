import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { Session, User } from '@supabase/supabase-js'
import { createClient, setRememberMe, clearRememberMe } from '../lib/client'

type AuthState = {
  user: User | null
  session: Session | null
  status: 'idle' | 'loading' | 'failed'
  error: string | null
}

const initialState: AuthState = {
  user: null,
  session: null,
  status: 'idle',
  error: null,
}

const supabase = createClient()

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/protected` },
    })
    if (error) return rejectWithValue(error.message)
    return data
  }
)

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (
    { email, password, rememberMe = false }: { email: string; password: string; rememberMe?: boolean },
    { rejectWithValue }
  ) => {
    // Set storage preference BEFORE sign-in so the session is stored correctly
    setRememberMe(rememberMe)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      // Revert remember-me flag on failure
      clearRememberMe()
      return rejectWithValue(error.message)
    }
    return data
  }
)

export const signOut = createAsyncThunk('auth/signOut', async (_, { rejectWithValue }) => {
  const { error } = await supabase.auth.signOut()
  if (error) return rejectWithValue(error.message)
  // Clear remember-me preference on explicit sign-out
  clearRememberMe()
  return true
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
    setSession(state, action: { payload: Session | null }) {
      state.session = action.payload
      state.user = action.payload?.user ?? null
    },
  },
  extraReducers(builder) {
    builder
      .addCase(signUp.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      .addCase(signUp.fulfilled, (s) => {
        s.status = 'idle'
      })
      .addCase(signUp.rejected, (s, a) => {
        s.status = 'failed'
        s.error = (a.payload as string) ?? 'Sign up failed'
      })
      .addCase(signIn.pending, (s) => {
        s.status = 'loading'
        s.error = null
      })
      .addCase(signIn.fulfilled, (s, a) => {
        s.status = 'idle'
        s.session = a.payload.session
        s.user = a.payload.user
      })
      .addCase(signIn.rejected, (s, a) => {
        s.status = 'failed'
        s.error = (a.payload as string) ?? 'Sign in failed'
      })
      .addCase(signOut.fulfilled, (s) => {
        s.user = null
        s.session = null
        s.status = 'idle'
        s.error = null
      })
  },
})

export const { clearError, setSession } = authSlice.actions
export default authSlice.reducer
