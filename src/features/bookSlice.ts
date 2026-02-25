import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { createClient } from '../lib/client'
import type { Booking } from '../types/booking'

const supabase = createClient()

type BookState = {
  data: Booking[]
  loading: boolean
  error: string | null
}

const initialState: BookState = {
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


export const InsertBook = createAsyncThunk(
  'book/insert',
  async (newBooking: Partial<Booking> & Record<string, any>, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('BookingTable')
      .insert([newBooking])
      .select()

    if (error) return rejectWithValue(error.message)

    return data
  }
)

// ตรวจสอบการจองซ้ำซ้อน: ดึงเฉพาะรายการที่วันที่ตรงกันและเวลาทับซ้อนจาก Database โดยตรง
export const checkBookingOverlap = createAsyncThunk(
  'book/checkOverlap',
  async (
    params: { date: string, startTime: string, endTime: string },
    { rejectWithValue }
  ) => {
    const { date, startTime, endTime } = params

    // Query ที่ Database level เพื่อประสิทธิภาพ:
    // หา booking ที่วันตรงกัน และ เวลาทับซ้อน (StartTime < endTime AND EndTime > startTime)
    const { data, error } = await supabase
      .from('BookingTable')
      .select('ID, StartTime, EndTime, Date, Status')
      .eq('Date', date)
      .lt('StartTime', endTime)   // booking เริ่มก่อนเวลาสิ้นสุดที่เราจะจอง
      .gt('EndTime', startTime)   // booking จบหลังเวลาเริ่มที่เราจะจอง
      .neq('Status', 'Canceled')  // ไม่นับรายการที่ยกเลิกแล้ว

    if (error) return rejectWithValue(error.message)

    return data || []
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