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

// ดึงข้อมูลรายการจองทั้งหมด (Read)
export const bookGet = createAsyncThunk(
  'book/select',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('BookingTable')
      .select('ID,created_at,StartTime,EndTime,Date,Price,Tax,Summary,Status,Notes,CustomerID,LocationID,JobType,CustomerMaster(CustomerName),CreatedID,LocationMaster(LocationName),JobTypeMaster(ID,TypeName)')

    if (error) return rejectWithValue(error.message)

    return data as unknown as Booking[]
  }
)

// เพิ่มรายการจองใหม่ (Create)
export const InsertBook = createAsyncThunk(
  'book/insert',
  async (newBooking: Partial<Booking> & Record<string, unknown>, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('BookingTable')
      .insert([newBooking])
      .select()

    if (error) return rejectWithValue(error.message)

    return data
  }
)

// แก้ไขรายการจอง (Update)
export const UpdateBook = createAsyncThunk(
  'book/update',
  async ({ id, updates }: { id: number; updates: Partial<Booking> & Record<string, unknown> }, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('BookingTable')
      .update(updates)
      .eq('ID', id)
      .select()

    if (error) return rejectWithValue(error.message)

    return data
  }
)

// ลบรายการจอง (Delete)
export const DeleteBook = createAsyncThunk(
  'book/delete',
  async (id: number, { rejectWithValue }) => {
    const { error } = await supabase
      .from('BookingTable')
      .delete()
      .eq('ID', id)

    if (error) return rejectWithValue(error.message)

    return id // คืน ID ที่ลบ เพื่อลบออกจาก state
  }
)

// ตรวจสอบการจองซ้ำซ้อน: ดึงเฉพาะรายการที่วันที่ตรงกันและเวลาทับซ้อนจาก Database โดยตรง
export const checkBookingOverlap = createAsyncThunk(
  'book/checkOverlap',
  async (
    params: { date: string, startTime: string, endTime: string, excludeId?: number },
    { rejectWithValue }
  ) => {
    const { date, startTime, endTime, excludeId } = params

    // Query ที่ Database level เพื่อประสิทธิภาพ:
    // หา booking ที่วันตรงกัน และ เวลาทับซ้อน (StartTime < endTime AND EndTime > startTime)
    let query = supabase
      .from('BookingTable')
      .select('ID, StartTime, EndTime, Date, Status')
      .eq('Date', date)
      .lt('StartTime', endTime)   // booking เริ่มก่อนเวลาสิ้นสุดที่เราจะจอง
      .gt('EndTime', startTime)   // booking จบหลังเวลาเริ่มที่เราจะจอง
      .neq('Status', 'Canceled')  // ไม่นับรายการที่ยกเลิกแล้ว

    // ถ้าเป็นโหมดแก้ไข ให้ไม่นับรายการตัวเองเข้าไปด้วย
    if (excludeId) {
      query = query.neq('ID', excludeId)
    }

    const { data, error } = await query

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
      // --- bookGet ---
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

      // --- DeleteBook: ลบออกจาก state โดยตรง ---
      .addCase(DeleteBook.fulfilled, (state, action) => {
        state.data = state.data.filter((item) => item.ID !== action.payload)
      })
  }
})

export default bookSlice.reducer