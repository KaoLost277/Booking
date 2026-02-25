import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {createClient} from  '../lib/client'

const supabase = createClient()

interface BookingTable {
  ID: number;
  created_at: string; // timestamptz
  StartTime: string | null; // time
  EndTime: string | null;   // time
  Date: string | null;      // date
  Price: number | null;
  Tax: number | null;
  Summary: number | null;
  Status: string | null;
  Notes: string | null;
  CustomerID: number | null;
  CustomerMaster?: { CustomerName: string }[];
  CreatedID: string | null; // uuid
  LocationMaster?: { LocationName: string }[];
}



type BookState = {
  data: BookingTable[]
  loading: boolean
  error: string | null
}

const initialState:BookState = {
  data: [],
  loading: false,
  error: null as string | null
}

export const bookGet = createAsyncThunk(
  'book/select',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('BookingTable')
      .select('ID,created_at,StartTime,EndTime,Date,Price,Tax,Summary,Status,Notes,CustomerID,CustomerMaster(CustomerName),CreatedID,LocationMaster(LocationName)')

    if (error) return rejectWithValue(error.message)

    return data 
  }
)

const bookSlice = createSlice({
  name: 'book',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(bookGet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(bookGet.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload  
      })
      .addCase(bookGet.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export default bookSlice.reducer