import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
    X, Calendar, Clock, MapPin, User, Briefcase, Activity
} from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { parse, format } from 'date-fns'
import CustomButton from './CustomButton'
import CustomInput from './CustomInput'
import SearchableSelect from './SearchableSelect'
import { useAppSelector, useAppDispatch } from '../hooks'
import { checkBookingOverlap, InsertBook, UpdateBook, bookGet } from '../features/bookSlice'
import type { Booking } from '../types/booking'

// ฟังก์ชันคำนวณคณิตศาสตร์อย่างปลอดภัย (ไม่ใช้ eval)
const safeMathEval = (expr: string): number | null => {
    try {
        // ลบ comma ออกก่อน แล้วเอาเฉพาะตัวเลข, ตัวดำเนินการ, จุดทศนิยม, วงเล็บ
        const sanitized = expr.replace(/,/g, '').replace(/[^0-9+\-*/(). ]/g, '').trim()
        if (!sanitized) return null

        // ใช้ Function constructor แทน eval เพื่อจำกัดขอบเขต (ไม่สามารถเข้าถึงตัวแปรภายนอกได้)
        // eslint-disable-next-line no-new-func
        const fn = new Function(`"use strict"; return (${sanitized})`)
        const result = fn()

        if (typeof result !== 'number' || !isFinite(result)) return null
        return result
    } catch {
        return null
    }
}

// จัดรูปแบบตัวเลขเป็นเงิน เช่น 10,000.00
const formatCurrency = (val: number): string =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingBooking?: Booking | null; // ถ้าส่งมา = โหมดแก้ไข, ไม่ส่ง = โหมดเพิ่มใหม่
}

interface FormValues {
    jobType: string | number;
    customer: string | number;
    location: string | number;
    date: string;
    startHour: string;
    startMinute: string;
    endHour: string;
    endMinute: string;
    price: string | number;
    tax: string | number;
    summary: string | number;
    status: string | number;
    notes: string;
}

const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    id: i.toString().padStart(2, '0'),
    label: i.toString().padStart(2, '0')
}));

const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    id: i.toString().padStart(2, '0'),
    label: i.toString().padStart(2, '0')
}));

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, editingBooking }) => {
    const { customers, locations, statusOptions, jobTypes } = useAppSelector((state) => state.masterData)
    const user = useAppSelector((state) => state.auth.user)
    const dispatch = useAppDispatch()

    const isEditMode = !!editingBooking
    const [submitting, setSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<FormValues>({
        defaultValues: {
            jobType: '',
            customer: '',
            location: '',
            date: '',
            startHour: '',
            startMinute: '',
            endHour: '',
            endMinute: '',
            price: '',
            tax: '',
            summary: '',
            status: 'Booking',
            notes: ''
        }
    });

    // Pre-fill form เมื่อเปิด Modal ในโหมดแก้ไข
    useEffect(() => {
        if (isOpen && editingBooking) {
            const startParts = editingBooking.StartTime?.split(':') || []
            const endParts = editingBooking.EndTime?.split(':') || []

            reset({
                jobType: editingBooking.JobType || '',
                customer: editingBooking.CustomerID || '',
                location: editingBooking.LocationID || '',
                date: editingBooking.Date || '',
                startHour: startParts[0] || '',
                startMinute: startParts[1] || '',
                endHour: endParts[0] || '',
                endMinute: endParts[1] || '',
                price: editingBooking.Price != null ? formatCurrency(editingBooking.Price) : '',
                tax: editingBooking.Tax != null ? formatCurrency(editingBooking.Tax) : '',
                summary: editingBooking.Summary != null ? formatCurrency(editingBooking.Summary) : '',
                status: editingBooking.Status || 'Booking',
                notes: editingBooking.Notes || ''
            })
        } else if (isOpen && !editingBooking) {
            reset({
                jobType: '',
                customer: '',
                location: '',
                date: '',
                startHour: '',
                startMinute: '',
                endHour: '',
                endMinute: '',
                price: '',
                tax: '',
                summary: '',
                status: 'Booking',
                notes: ''
            })
        }
    }, [isOpen, editingBooking, reset])

    const [timeError, setTimeError] = useState<string>('')
    const [overlapError, setOverlapError] = useState<string>('')
    const [checkingOverlap, setCheckingOverlap] = useState(false)
    const overlapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const watchedPrice = watch("price")
    const watchedJobType = watch("jobType")
    const watchedDate = watch("date")
    const watchedStartHour = watch("startHour")
    const watchedStartMinute = watch("startMinute")
    const watchedEndHour = watch("endHour")
    const watchedEndMinute = watch("endMinute")

    // หา JobType ที่เลือกอยู่ เพื่อดึง PriceUnitMinutes และ MinTimeMinutes
    const selectedJobType = useMemo(() => {
        if (!watchedJobType || !jobTypes) return null
        return (jobTypes || []).find(j => j.ID === watchedJobType) || null
    }, [watchedJobType, jobTypes])

    // คำนวณราคาอัตโนมัติจากเวลา * PriceUnitMinutes
    useEffect(() => {
        setTimeError('')

        // ตรวจว่าเลือกครบทั้งหมดแล้วหรือยัง
        if (!watchedStartHour || !watchedStartMinute || !watchedEndHour || !watchedEndMinute) {
            return
        }

        const startTotal = parseInt(watchedStartHour) * 60 + parseInt(watchedStartMinute)
        const endTotal = parseInt(watchedEndHour) * 60 + parseInt(watchedEndMinute)
        const diffMinutes = endTotal - startTotal

        // Validate: เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม
        if (diffMinutes <= 0) {
            setTimeError('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม')
            setValue("price", '', { shouldDirty: true })
            return
        }

        // Validate: เวลาต้องไม่น้อยกว่า MinTimeMinutes ของประเภทงาน
        if (selectedJobType && diffMinutes < selectedJobType.MinTimeMinutes) {
            setTimeError(`ประเภทงานนี้ต้องจองอย่างน้อย ${selectedJobType.MinTimeMinutes} นาที (ตอนนี้ ${diffMinutes} นาที)`)
            setValue("price", '', { shouldDirty: true })
            return
        }

        // คำนวณราคา: Diff time * PriceUnitMinutes
        if (selectedJobType) {
            const calculatedPrice = diffMinutes * selectedJobType.PriceUnitMinutes
            setValue("price", formatCurrency(calculatedPrice), { shouldValidate: true, shouldDirty: true })
        }
    }, [watchedStartHour, watchedStartMinute, watchedEndHour, watchedEndMinute, selectedJobType, setValue])

    // ตรวจสอบการจองซ้ำซ้อน (เวลาทับซ้อนกันในวันเดียวกัน) - debounce 500ms
    useEffect(() => {
        setOverlapError('')

        if (!watchedDate || !watchedStartHour || !watchedStartMinute || !watchedEndHour || !watchedEndMinute) {
            return
        }

        const startTime = `${watchedStartHour}:${watchedStartMinute}:00`
        const endTime = `${watchedEndHour}:${watchedEndMinute}:00`

        // Debounce: รอให้ผู้ใช้เลือกเสร็จก่อนค่อยส่ง Query
        if (overlapTimerRef.current) clearTimeout(overlapTimerRef.current)

        overlapTimerRef.current = setTimeout(async () => {
            setCheckingOverlap(true)
            try {
                const result = await dispatch(
                    checkBookingOverlap({
                        date: watchedDate,
                        startTime,
                        endTime,
                        excludeId: editingBooking?.ID // แก้ไข: ไม่นับรายการตัวเอง
                    })
                ).unwrap()

                if (result && result.length > 0) {
                    const conflicting = result[0]
                    setOverlapError(
                        `ช่วงเวลานี้มีการจองแล้ว (${conflicting.StartTime?.slice(0, 5)} - ${conflicting.EndTime?.slice(0, 5)}) กรุณาเลือกเวลาอื่น`
                    )
                }
            } catch (err) {
                console.warn('ตรวจสอบการจองซ้ำซ้อนไม่สำเร็จ:', err)
            } finally {
                setCheckingOverlap(false)
            }
        }, 500)

        return () => {
            if (overlapTimerRef.current) clearTimeout(overlapTimerRef.current)
        }
    }, [watchedDate, watchedStartHour, watchedStartMinute, watchedEndHour, watchedEndMinute, dispatch, editingBooking])

    // คำนวณราคารวม (Summary) และ หักภาษี (Tax) อัตโนมัติเมื่อราคา (Price) มีการเปลี่ยนแปลง
    useEffect(() => {
        const priceStr = String(watchedPrice)
        if (priceStr === '') {
            setValue("tax", '', { shouldValidate: true, shouldDirty: true })
            setValue("summary", '', { shouldValidate: true, shouldDirty: true })
            return
        }

        const pVal = safeMathEval(priceStr) ?? (parseFloat(priceStr.replace(/,/g, '')) || 0)

        // Calculate 3% Tax
        const calculatedTax = pVal * 0.03
        const total = pVal - calculatedTax

        setValue("tax", formatCurrency(calculatedTax), { shouldValidate: true, shouldDirty: true })
        setValue("summary", formatCurrency(total), { shouldValidate: true, shouldDirty: true })
    }, [watchedPrice, setValue])


    const jobOptions = (jobTypes || []).map((j) => ({
        id: j.ID,
        label: j.TypeName
    }));
    const customerOptions = (customers || []).map((c) => ({
        id: c.ID,
        label: c.CustomerName
    }));
    const locationOptions = (locations || []).map((l) => ({
        id: l.ID,
        label: l.LocationName
    }));

    // ฟังก์ชัน Submit: รองรับทั้งเพิ่มใหม่ (Insert) และแก้ไข (Update)
    const onSubmit = async (data: FormValues) => {
        setSubmitting(true)
        try {
            const priceVal = (safeMathEval(String(data.price)) ?? parseFloat(String(data.price).replace(/,/g, ''))) || 0
            const taxVal = (safeMathEval(String(data.tax)) ?? parseFloat(String(data.tax).replace(/,/g, ''))) || 0
            const summaryVal = (safeMathEval(String(data.summary)) ?? parseFloat(String(data.summary).replace(/,/g, ''))) || 0

            const bookingData = {
                JobType: data.jobType ? Number(data.jobType) : null,
                CustomerID: data.customer ? Number(data.customer) : null,
                LocationID: data.location ? Number(data.location) : null,
                Date: data.date || null,
                StartTime: `${data.startHour}:${data.startMinute}:00`,
                EndTime: `${data.endHour}:${data.endMinute}:00`,
                Price: priceVal,
                Tax: taxVal,
                Summary: summaryVal,
                Status: String(data.status) || 'Booking',
                Notes: data.notes || null,
            }

            if (isEditMode && editingBooking) {
                // แก้ไขรายการจอง
                await dispatch(UpdateBook({ id: editingBooking.ID, updates: bookingData })).unwrap()
            } else {
                // เพิ่มรายการจองใหม่ — ใส่ CreatedID เป็น user ID ตอน Login
                await dispatch(InsertBook({ ...bookingData, CreatedID: user?.id || null })).unwrap()
            }

            // โหลดข้อมูลใหม่
            await dispatch(bookGet())

            reset()
            onClose()
        } catch (err) {
            console.error('บันทึกรายการจองไม่สำเร็จ:', err)
            alert(`เกิดข้อผิดพลาด: ${err}`)
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="relative w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] flex flex-col my-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
                    <div>
                        <h2 className="text-lg font-semibold text-[#0d0d0d] dark:text-[#ececf1]">
                            {isEditMode ? 'แก้ไขรายการจอง (Edit Booking)' : 'เพิ่มรายการจอง (New Booking)'}
                        </h2>
                        <p className="text-sm text-[#6e6e80] dark:text-[#8e8ea0] mt-1">
                            {isEditMode ? 'แก้ไขข้อมูลรายละเอียดการจอง' : 'กรอกข้อมูลรายละเอียดการจองด้านล่าง'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-2 rounded-full text-[#6e6e80] dark:text-[#8e8ea0] hover:bg-[#f7f7f8] dark:hover:bg-[#2a2a2a] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body / Scrollable Content */}
                <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Row 1 */}
                        <div className="md:col-span-2">
                            <Controller
                                name="jobType"
                                control={control}
                                rules={{ required: "กรุณาเลือกประเภทงาน" }}
                                render={({ field }) => (
                                    <>
                                        <SearchableSelect
                                            label="ประเภทงาน"
                                            icon={<Briefcase className="w-4 h-4" />}
                                            options={jobOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="ค้นหาและเลือกประเภทงาน..."
                                            error={!!errors.jobType}
                                        />
                                        {errors.jobType && <p className="text-xs text-red-500 font-medium mt-1">{errors.jobType.message}</p>}
                                    </>
                                )}
                            />
                        </div>

                        {/* Row 2 */}
                        <div className="col-span-1">
                            <Controller
                                name="customer"
                                control={control}
                                rules={{ required: "กรุณาเลือกลูกค้า" }}
                                render={({ field }) => (
                                    <>
                                        <SearchableSelect
                                            label="ลูกค้า"
                                            icon={<User className="w-4 h-4" />}
                                            options={customerOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="ค้นหาและเลือกชื่อลูกค้า..."
                                            error={!!errors.customer}
                                        />
                                        {errors.customer && <p className="text-xs text-red-500 font-medium mt-1">{errors.customer.message}</p>}
                                    </>
                                )}
                            />
                        </div>
                        <div className="col-span-1">
                            <Controller
                                name="location"
                                control={control}
                                rules={{ required: "กรุณาเลือกสถานที่" }}
                                render={({ field }) => (
                                    <>
                                        <SearchableSelect
                                            label="สถานที่"
                                            icon={<MapPin className="w-4 h-4" />}
                                            options={locationOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="ค้นหาและเลือกสถานที่..."
                                            error={!!errors.location}
                                        />
                                        {errors.location && <p className="text-xs text-red-500 font-medium mt-1">{errors.location.message}</p>}
                                    </>
                                )}
                            />
                        </div>

                        {/* Row 3 - Dates and Times */}
                        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="w-full">
                                <label className="block text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0] mb-1.5">
                                    วันที่
                                </label>
                                <Controller
                                    name="date"
                                    control={control}
                                    rules={{ required: "กรุณาระบุวันที่" }}
                                    render={({ field }) => {
                                        // แปลง yyyy-mm-dd (ค่าภายใน) → Date object (สำหรับ DatePicker)
                                        const selectedDate = field.value && /^\d{4}-\d{2}-\d{2}$/.test(field.value)
                                            ? parse(field.value, 'yyyy-MM-dd', new Date())
                                            : null

                                        return (
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                                    <Calendar className="h-4 w-4 text-[#acacbe] dark:text-[#6e6e80]" />
                                                </div>
                                                <DatePicker
                                                    selected={selectedDate}
                                                    onChange={(date: Date | null) => {
                                                        if (date) {
                                                            field.onChange(format(date, 'yyyy-MM-dd'))
                                                        } else {
                                                            field.onChange('')
                                                        }
                                                    }}
                                                    dateFormat="dd/MM/yyyy"
                                                    placeholderText="dd/mm/yyyy"
                                                    className={`block w-full h-[42px] pl-10 pr-3 rounded-lg border bg-white dark:bg-[#1a1a1a] text-sm text-[#0d0d0d] dark:text-[#ececf1] outline-none transition-all ${errors.date ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/10' : 'border-[#e5e5e5] dark:border-[#2a2a2a] hover:border-[#c5c5d2] dark:hover:border-[#444654] focus:border-[#0d0d0d] dark:focus:border-[#ececf1] focus:ring-1 focus:ring-[#0d0d0d]/10 dark:focus:ring-[#ececf1]/10'}`}
                                                    autoComplete="off"
                                                />
                                            </div>
                                        )
                                    }}
                                />
                                {errors.date && <p className="text-xs text-red-500 font-medium mt-1">{errors.date.message}</p>}
                            </div>

                            <div className="w-full">
                                <label className="block text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0] mb-1.5 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> เวลาเริ่ม
                                </label>
                                <div className="flex items-center gap-1.5">
                                    <div className="flex-1">
                                        <Controller
                                            name="startHour"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <SearchableSelect
                                                    label=""
                                                    options={hourOptions}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="HH"
                                                    error={!!errors.startHour}
                                                />
                                            )}
                                        />
                                    </div>
                                    <span className="text-[#0d0d0d] dark:text-[#ececf1] font-bold pb-1">:</span>
                                    <div className="flex-1">
                                        <Controller
                                            name="startMinute"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <SearchableSelect
                                                    label=""
                                                    options={minuteOptions}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="mm"
                                                    error={!!errors.startMinute}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                                {(errors.startHour || errors.startMinute) && <p className="text-xs text-red-500 font-medium mt-1">กรุณาระบุเวลาเริ่ม</p>}
                            </div>

                            <div className="w-full">
                                <label className="block text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0] mb-1.5 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> สิ้นสุดเวลา
                                </label>
                                <div className="flex items-center gap-1.5">
                                    <div className="flex-1">
                                        <Controller
                                            name="endHour"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <SearchableSelect
                                                    label=""
                                                    options={hourOptions}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="HH"
                                                    error={!!errors.endHour}
                                                />
                                            )}
                                        />
                                    </div>
                                    <span className="text-[#0d0d0d] dark:text-[#ececf1] font-bold pb-1">:</span>
                                    <div className="flex-1">
                                        <Controller
                                            name="endMinute"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <SearchableSelect
                                                    label=""
                                                    options={minuteOptions}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="mm"
                                                    error={!!errors.endMinute}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                                {(errors.endHour || errors.endMinute) && <p className="text-xs text-red-500 font-medium mt-1">กรุณาระบุสิ้นสุดเวลา</p>}
                            </div>
                        </div>

                        {/* Time Validation Error */}
                        {timeError && (
                            <div className="md:col-span-2">
                                <p className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">{timeError}</p>
                            </div>
                        )}

                        {/* Overlap Validation Error */}
                        {overlapError && (
                            <div className="md:col-span-2">
                                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-lg px-3 py-2">
                                    {overlapError}
                                </p>
                            </div>
                        )}
                        {checkingOverlap && (
                            <div className="md:col-span-2">
                                <p className="text-xs text-blue-500 font-medium">กำลังตรวจสอบเวลาว่าง...</p>
                            </div>
                        )}

                        {/* Row 4 - Pricing */}
                        <div className="col-span-1">
                            <CustomInput
                                label="ราคา"
                                type="text"
                                placeholder="0.00"
                                {...register("price")}
                            />
                        </div>
                        <div className="col-span-1 pointer-events-none opacity-80">
                            <CustomInput
                                label="หักภาษี (3%)"
                                type="text"
                                placeholder="0.00"
                                readOnly
                                {...register("tax")}
                            />
                        </div>
                        <div className="md:col-span-2 pointer-events-none opacity-80">
                            <CustomInput
                                label="ยอดสุทธิ"
                                type="text"
                                placeholder="0.00"
                                readOnly
                                {...register("summary")}
                            />
                        </div>

                        {/* Row 5 - Status */}
                        <div className="md:col-span-2">
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <SearchableSelect
                                        label="สถานะ (Status)"
                                        icon={<Activity className="w-4 h-4" />}
                                        options={statusOptions}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="ค้นหาและเลือกสถานะ..."
                                    />
                                )}
                            />
                        </div>

                        {/* Row 6 - Notes */}
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="block text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0]">
                                รายละเอียดเพิ่มเติม
                            </label>
                            <textarea
                                rows={3}
                                {...register("notes")}
                                className="block w-full rounded-lg border p-3 text-sm outline-none transition-all bg-white dark:bg-[#1a1a1a] text-[#0d0d0d] dark:text-[#ececf1] placeholder:text-[#acacbe] dark:placeholder:text-[#6e6e80] border-[#e5e5e5] dark:border-[#2a2a2a] hover:border-[#c5c5d2] dark:hover:border-[#444654] focus:border-[#0d0d0d] dark:focus:border-[#ececf1] focus:ring-1 focus:ring-[#0d0d0d]/10 dark:focus:ring-[#ececf1]/10 resize-none"
                                placeholder="กรอกรายละเอียดเพิ่มเติมหรือหมายเหตุ..."
                            />
                        </div>

                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="p-5 border-t border-[#e5e5e5] dark:border-[#2a2a2a] flex items-center justify-end gap-3 bg-[#f7f7f8] dark:bg-[#1a1a1a] rounded-b-xl">
                    <CustomButton
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                    >
                        ยกเลิก
                    </CustomButton>
                    <CustomButton
                        type="submit"
                        className="px-6"
                        disabled={!!overlapError || !!timeError || checkingOverlap || submitting}
                        loading={submitting}
                    >
                        {isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกรายการจอง'}
                    </CustomButton>
                </div>
            </form>
        </div>
    );
};

export default BookingModal;
