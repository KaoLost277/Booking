import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createClient } from '../lib/client'
import type { CustomerMaster } from '../types/booking'

const supabase = createClient()

type CustomerState = {
    data: CustomerMaster[]
    loading: boolean
    error: string | null
}

const initialState: CustomerState = {
    data: [],
    loading: false,
    error: null
}

// Fetch all active customers
export const fetchCustomers = createAsyncThunk(
    'customer/fetchAll',
    async (_, { rejectWithValue }) => {
        const { data, error } = await supabase
            .from('CustomerMaster')
            .select('*')
            .eq('ActiveStatus', true)
            .order('ID', { ascending: false })

        if (error) return rejectWithValue(error.message)
        return data as CustomerMaster[]
    }
)

// Add new customer
export const addCustomer = createAsyncThunk(
    'customer/add',
    async (newCustomer: Partial<CustomerMaster>, { rejectWithValue }) => {
        const { data, error } = await supabase
            .from('CustomerMaster')
            .insert([newCustomer])
            .select()

        if (error) return rejectWithValue(error.message)
        return data[0] as CustomerMaster
    }
)

// Update customer
export const updateCustomer = createAsyncThunk(
    'customer/update',
    async ({ id, updates }: { id: number; updates: Partial<CustomerMaster> }, { rejectWithValue }) => {
        const { data, error } = await supabase
            .from('CustomerMaster')
            .update(updates)
            .eq('ID', id)
            .select()

        if (error) return rejectWithValue(error.message)
        return data[0] as CustomerMaster
    }
)

// Soft delete customer (set ActiveStatus to false)
export const deleteCustomer = createAsyncThunk(
    'customer/delete',
    async (id: number, { rejectWithValue }) => {
        const { error } = await supabase
            .from('CustomerMaster')
            .update({ ActiveStatus: false })
            .eq('ID', id)

        if (error) return rejectWithValue(error.message)
        return id
    }
)

const customerSlice = createSlice({
    name: 'customer',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchCustomers.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.loading = false
                state.data = action.payload
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            // Add
            .addCase(addCustomer.fulfilled, (state, action) => {
                state.data.unshift(action.payload)
            })
            // Update
            .addCase(updateCustomer.fulfilled, (state, action) => {
                const index = state.data.findIndex(c => c.ID === action.payload.ID)
                if (index !== -1) {
                    state.data[index] = action.payload
                }
            })
            // Delete
            .addCase(deleteCustomer.fulfilled, (state, action) => {
                state.data = state.data.filter(c => c.ID !== action.payload)
            })
    }
})

export default customerSlice.reducer
