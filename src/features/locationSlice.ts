import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createClient } from '../lib/client'
import type { LocationMaster } from '../types/booking'

const supabase = createClient()

type LocationState = {
    data: LocationMaster[]
    loading: boolean
    error: string | null
}

const initialState: LocationState = {
    data: [],
    loading: false,
    error: null
}

export const fetchLocations = createAsyncThunk(
    'location/fetchAll',
    async (_, { rejectWithValue }) => {
        const { data, error } = await supabase
            .from('LocationMaster')
            .select('*')
            .eq('ActiveStatus', true)
            .order('ID', { ascending: false })

        if (error) return rejectWithValue(error.message)
        return data as LocationMaster[]
    }
)

export const addLocation = createAsyncThunk(
    'location/add',
    async (newLocation: Partial<LocationMaster>, { rejectWithValue }) => {
        const { data, error } = await supabase
            .from('LocationMaster')
            .insert([newLocation])
            .select()

        if (error) return rejectWithValue(error.message)
        return data[0] as LocationMaster
    }
)

export const updateLocation = createAsyncThunk(
    'location/update',
    async ({ id, updates }: { id: number; updates: Partial<LocationMaster> }, { rejectWithValue }) => {
        const { data, error } = await supabase
            .from('LocationMaster')
            .update(updates)
            .eq('ID', id)
            .select()

        if (error) return rejectWithValue(error.message)
        return data[0] as LocationMaster
    }
)

export const deleteLocation = createAsyncThunk(
    'location/delete',
    async (id: number, { rejectWithValue }) => {
        const { error } = await supabase
            .from('LocationMaster')
            .update({ ActiveStatus: false })
            .eq('ID', id)

        if (error) return rejectWithValue(error.message)
        return id
    }
)

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchLocations.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchLocations.fulfilled, (state, action) => {
                state.loading = false
                state.data = action.payload
            })
            .addCase(fetchLocations.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            .addCase(addLocation.fulfilled, (state, action) => {
                state.data.unshift(action.payload)
            })
            .addCase(updateLocation.fulfilled, (state, action) => {
                const index = state.data.findIndex(c => c.ID === action.payload.ID)
                if (index !== -1) {
                    state.data[index] = action.payload
                }
            })
            .addCase(deleteLocation.fulfilled, (state, action) => {
                state.data = state.data.filter(c => c.ID !== action.payload)
            })
    }
})

export default locationSlice.reducer
