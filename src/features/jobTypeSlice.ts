import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createClient } from '../lib/client'
import type { JobTypeMaster } from '../types/booking'

const supabase = createClient()

type JobTypeState = {
    data: JobTypeMaster[]
    loading: boolean
    error: string | null
}

const initialState: JobTypeState = {
    data: [],
    loading: false,
    error: null
}

export const fetchJobTypes = createAsyncThunk(
    'jobType/fetchAll',
    async (_, { rejectWithValue }) => {
        const { data, error } = await supabase
            .from('JobTypeMaster')
            .select('*')
            .eq('ActiveStatus', true)
            .order('ID', { ascending: false })

        if (error) return rejectWithValue(error.message)
        return data as JobTypeMaster[]
    }
)

export const addJobType = createAsyncThunk(
    'jobType/add',
    async (newJobType: Partial<JobTypeMaster>, { rejectWithValue }) => {
        const { data, error } = await supabase
            .from('JobTypeMaster')
            .insert([newJobType])
            .select()

        if (error) return rejectWithValue(error.message)
        return data[0] as JobTypeMaster
    }
)

export const updateJobType = createAsyncThunk(
    'jobType/update',
    async ({ id, updates }: { id: number; updates: Partial<JobTypeMaster> }, { rejectWithValue }) => {
        const { data, error } = await supabase
            .from('JobTypeMaster')
            .update(updates)
            .eq('ID', id)
            .select()

        if (error) return rejectWithValue(error.message)
        return data[0] as JobTypeMaster
    }
)

export const deleteJobType = createAsyncThunk(
    'jobType/delete',
    async (id: number, { rejectWithValue }) => {
        const { error } = await supabase
            .from('JobTypeMaster')
            .update({ ActiveStatus: false })
            .eq('ID', id)

        if (error) return rejectWithValue(error.message)
        return id
    }
)

const jobTypeSlice = createSlice({
    name: 'jobType',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchJobTypes.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchJobTypes.fulfilled, (state, action) => {
                state.loading = false
                state.data = action.payload
            })
            .addCase(fetchJobTypes.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(addJobType.fulfilled, (state, action) => {
                state.data.unshift(action.payload)
            })
            .addCase(updateJobType.fulfilled, (state, action) => {
                const index = state.data.findIndex(c => c.ID === action.payload.ID)
                if (index !== -1) {
                    state.data[index] = action.payload
                }
            })
            .addCase(deleteJobType.fulfilled, (state, action) => {
                state.data = state.data.filter(c => c.ID !== action.payload)
            })
    }
})

export default jobTypeSlice.reducer
