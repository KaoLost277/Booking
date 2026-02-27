import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createClient } from '../lib/client'
import type { CustomerMaster, LocationMaster, JobTypeMaster, SelectOption } from '../types/booking'

const supabase = createClient()

type MasterDataState = {
    jobTypes: JobTypeMaster[]
    customers: CustomerMaster[]
    locations: LocationMaster[]
    statusOptions: SelectOption[]
    loading: boolean
    error: string | null
}

const initialState: MasterDataState = {
    jobTypes: [],
    customers: [],
    locations: [],
    statusOptions: [
        { id: 'Booking', label: 'Booking' },
        { id: 'Inprogress', label: 'Inprogress' },
        { id: 'Completed', label: 'Completed' },
        { id: 'Canceled', label: 'Canceled' }
    ],
    loading: false,
    error: null
}

// ดึงข้อมูล Master Data ทั้งหมดจาก Supabase
export const fetchMasterData = createAsyncThunk(
    'masterData/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const [jobsRes, custRes, locRes] = await Promise.all([
                supabase.from('JobTypeMaster').select('ID, TypeName, MinTimeMinutes, PriceUnitMinutes').eq('ActiveStatus', true),
                supabase.from('CustomerMaster').select('ID, CustomerName, FacebookIink').eq('ActiveStatus', true),
                supabase.from('LocationMaster').select('ID, LocationName, Locationlink').eq('ActiveStatus', true)
            ])

            if (jobsRes.error) throw jobsRes.error
            if (custRes.error) throw custRes.error
            if (locRes.error) throw locRes.error

            return {
                jobTypes: jobsRes.data as JobTypeMaster[],
                customers: custRes.data as CustomerMaster[],
                locations: locRes.data as LocationMaster[]
            }
        } catch (error: unknown) {
            return rejectWithValue(error instanceof Error ? error.message : String(error))
        }
    }
)

const masterDataSlice = createSlice({
    name: 'masterData',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchMasterData.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchMasterData.fulfilled, (state, action) => {
                state.loading = false
                state.jobTypes = action.payload.jobTypes
                state.customers = action.payload.customers
                state.locations = action.payload.locations
            })
            .addCase(fetchMasterData.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    }
})

export default masterDataSlice.reducer