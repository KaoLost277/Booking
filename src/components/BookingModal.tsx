import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import {
    X, Calendar, Clock, MapPin, User, Briefcase, Activity, Plus
} from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { parse, format } from 'date-fns'
import CustomButton from './CustomButton'
import CustomInput from './CustomInput'
import SearchableSelect from './SearchableSelect'
import CustomerModal from './CustomerModal'
import LocationModal from './LocationModal'
import { useAppSelector, useAppDispatch } from '../hooks'
import { checkBookingOverlap, InsertBook, UpdateBook, bookGet } from '../features/bookSlice'
import type { Booking } from '../types/booking'

// ฟังก์ชันคำนวณคณิตศาสตร์อย่างปลอดภัย (ไม่ใช้ eval)
const safeMathEval = (expr: string): number | null => {
    try {
        const sanitized = expr.replace(/,/g, '').replace(/[^0-9+\-*/(). ]/g, '').trim()
        if (!sanitized) return null

        const fn = new Function(`"use strict"; return (${sanitized})`)
        const result = fn()

        if (typeof result !== 'number' || !isFinite(result)) return null
        return result
    } catch {
        return null
    }
}

// จัดรูปแบบตัวเลขเป็นเงิน
const formatCurrency = (val: number): string =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingBooking?: Booking | null;
    initialDate?: Date;
    initialStartTime?: Date;
    initialEndTime?: Date;
}

interface BookingItemForm {
    customer: string | number;
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

interface FormValues {
    jobType: string | number;
    location: string | number;
    date: string;
    items: BookingItemForm[];
}

const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    id: i.toString().padStart(2, '0'),
    label: i.toString().padStart(2, '0')
}));

const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    id: i.toString().padStart(2, '0'),
    label: i.toString().padStart(2, '0')
}));

// ==========================================
// BookingItemRow Component
// ==========================================
const BookingItemRow = ({
    index, control, register, errors, setValue, watch, selectedJobType, watchedDate, editingBooking, onRemove, showRemove, customerOptions, statusOptions, onRowErrorChange, onAddCustomer
}: any) => {
    const dispatch = useAppDispatch()

    const [timeError, setTimeError] = useState<string>('')
    const [overlapError, setOverlapError] = useState<string>('')
    const [checkingOverlap, setCheckingOverlap] = useState(false)
    const overlapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const watchedStartHour = watch(`items.${index}.startHour`)
    const watchedStartMinute = watch(`items.${index}.startMinute`)
    const watchedEndHour = watch(`items.${index}.endHour`)
    const watchedEndMinute = watch(`items.${index}.endMinute`)
    const watchedPrice = watch(`items.${index}.price`)

    // Sync errors up
    useEffect(() => {
        onRowErrorChange(index, { timeError, overlapError, checkingOverlap })
    }, [index, timeError, overlapError, checkingOverlap, onRowErrorChange])

    // Time Validation and Price Calculation
    useEffect(() => {
        setTimeError('')
        if (!watchedStartHour || !watchedStartMinute || !watchedEndHour || !watchedEndMinute) {
            return
        }

        const startTotal = parseInt(watchedStartHour) * 60 + parseInt(watchedStartMinute)
        const endTotal = parseInt(watchedEndHour) * 60 + parseInt(watchedEndMinute)
        const diffMinutes = endTotal - startTotal

        if (diffMinutes <= 0) {
            setTimeError('เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม')
            setValue(`items.${index}.price`, '', { shouldDirty: true })
            return
        }

        if (selectedJobType && diffMinutes < selectedJobType.MinTimeMinutes) {
            setTimeError(`ประเภทงานนี้ต้องจองอย่างน้อย ${selectedJobType.MinTimeMinutes} นาที (ตอนนี้ ${diffMinutes} นาที)`)
            setValue(`items.${index}.price`, '', { shouldDirty: true })
            return
        }

        if (selectedJobType) {
            const calculatedPrice = diffMinutes * selectedJobType.PriceUnitMinutes
            setValue(`items.${index}.price`, formatCurrency(calculatedPrice), { shouldValidate: true, shouldDirty: true })
        }
    }, [watchedStartHour, watchedStartMinute, watchedEndHour, watchedEndMinute, selectedJobType, setValue, index])

    // Overlap Validation
    useEffect(() => {
        setOverlapError('')
        if (!watchedDate || !watchedStartHour || !watchedStartMinute || !watchedEndHour || !watchedEndMinute) {
            return
        }

        const startTime = `${watchedStartHour}:${watchedStartMinute}:00`
        const endTime = `${watchedEndHour}:${watchedEndMinute}:00`

        if (overlapTimerRef.current) clearTimeout(overlapTimerRef.current)

        overlapTimerRef.current = setTimeout(async () => {
            setCheckingOverlap(true)
            try {
                const result = await dispatch(
                    checkBookingOverlap({
                        date: watchedDate,
                        startTime,
                        endTime,
                        excludeId: editingBooking?.ID // Exclude if editing
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

    // Tax and Summary Calculation
    useEffect(() => {
        const priceStr = String(watchedPrice || '')
        if (priceStr === '') {
            setValue(`items.${index}.tax`, '', { shouldValidate: true, shouldDirty: true })
            setValue(`items.${index}.summary`, '', { shouldValidate: true, shouldDirty: true })
            return
        }

        const pVal = safeMathEval(priceStr) ?? (parseFloat(priceStr.replace(/,/g, '')) || 0)
        const calculatedTax = pVal * 0.03
        const total = pVal - calculatedTax

        setValue(`items.${index}.tax`, formatCurrency(calculatedTax), { shouldValidate: true, shouldDirty: true })
        setValue(`items.${index}.summary`, formatCurrency(total), { shouldValidate: true, shouldDirty: true })
    }, [watchedPrice, setValue, index])

    const itemErrors = errors?.items?.[index] || {}

    return (
        <div className="bg-white dark:bg-[#1f1f1f] rounded-lg border border-[#e5e5e5] dark:border-[#333] p-4 relative shadow-sm">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Row 1: Customer */}
                <div className="col-span-1 md:col-span-2">
                    <Controller
                        name={`items.${index}.customer`}
                        control={control}
                        rules={{ required: "กรุณาเลือกลูกค้า" }}
                        render={({ field }) => (
                            <div className="flex flex-col">
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <SearchableSelect
                                            label="ลูกค้า (Customer)"
                                            icon={<User className="w-4 h-4" />}
                                            options={customerOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="ค้นหาและเลือกชื่อลูกค้า..."
                                            error={!!itemErrors.customer}
                                        />
                                    </div>
                                    <div className="pt-[22px] flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={onAddCustomer}
                                            className="shrink-0 w-11 h-11 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm"
                                            title="เพิ่มลูกค้าใหม่"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                        {showRemove && (
                                            <button
                                                type="button"
                                                onClick={() => onRemove(index)}
                                                className="shrink-0 h-11 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-4 rounded-lg text-sm transition-colors shadow-sm font-medium"
                                                title="ลบลูกค้ารายการนี้"
                                            >
                                                ลบ
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {itemErrors.customer && <p className="text-xs text-red-500 font-medium mt-1">{itemErrors.customer.message}</p>}
                            </div>
                        )}
                    />
                </div>

                {/* Row 2: Times */}
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0] mb-1.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> เวลาเริ่ม
                    </label>
                    <div className="flex items-center gap-1.5">
                        <div className="flex-1">
                            <Controller
                                name={`items.${index}.startHour`}
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <SearchableSelect
                                        label=""
                                        options={hourOptions}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="HH"
                                        error={!!itemErrors.startHour}
                                    />
                                )}
                            />
                        </div>
                        <span className="text-[#0d0d0d] dark:text-[#ececf1] font-bold pb-1">:</span>
                        <div className="flex-1">
                            <Controller
                                name={`items.${index}.startMinute`}
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <SearchableSelect
                                        label=""
                                        options={minuteOptions}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="mm"
                                        error={!!itemErrors.startMinute}
                                    />
                                )}
                            />
                        </div>
                    </div>
                    {(itemErrors.startHour || itemErrors.startMinute) && <p className="text-xs text-red-500 font-medium mt-1">กรุณาระบุเวลาเริ่ม</p>}
                </div>

                <div className="col-span-1">
                    <label className="block text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0] mb-1.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> สิ้นสุดเวลา
                    </label>
                    <div className="flex items-center gap-1.5">
                        <div className="flex-1">
                            <Controller
                                name={`items.${index}.endHour`}
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <SearchableSelect
                                        label=""
                                        options={hourOptions}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="HH"
                                        error={!!itemErrors.endHour}
                                    />
                                )}
                            />
                        </div>
                        <span className="text-[#0d0d0d] dark:text-[#ececf1] font-bold pb-1">:</span>
                        <div className="flex-1">
                            <Controller
                                name={`items.${index}.endMinute`}
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <SearchableSelect
                                        label=""
                                        options={minuteOptions}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="mm"
                                        error={!!itemErrors.endMinute}
                                    />
                                )}
                            />
                        </div>
                    </div>
                    {(itemErrors.endHour || itemErrors.endMinute) && <p className="text-xs text-red-500 font-medium mt-1">กรุณาระบุสิ้นสุดเวลา</p>}
                </div>

                {/* Validation Errors Display */}
                {timeError && (
                    <div className="col-span-1 md:col-span-2">
                        <p className="text-xs text-red-500 font-medium bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">{timeError}</p>
                    </div>
                )}
                {overlapError && (
                    <div className="col-span-1 md:col-span-2">
                        <p className="text-xs text-orange-600 dark:text-orange-400 font-medium bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-lg px-3 py-2">
                            {overlapError}
                        </p>
                    </div>
                )}
                {checkingOverlap && (
                    <div className="col-span-1 md:col-span-2">
                        <p className="text-xs text-blue-500 font-medium">กำลังตรวจสอบเวลาว่าง...</p>
                    </div>
                )}

                {/* Row 3: Pricing */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <CustomInput
                            label="ราคา"
                            type="text"
                            placeholder="0.00"
                            {...register(`items.${index}.price` as const)}
                        />
                    </div>
                    <div className="col-span-1 pointer-events-none opacity-80">
                        <CustomInput
                            label="หักภาษี (3%)"
                            type="text"
                            placeholder="0.00"
                            readOnly
                            {...register(`items.${index}.tax` as const)}
                        />
                    </div>
                    <div className="col-span-1 pointer-events-none opacity-80">
                        <CustomInput
                            label="ยอดสุทธิ"
                            type="text"
                            placeholder="0.00"
                            readOnly
                            {...register(`items.${index}.summary` as const)}
                        />
                    </div>
                </div>

                {/* Row 4: Status and Notes */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1">
                        <Controller
                            name={`items.${index}.status`}
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
                    <div className="col-span-1">
                        <label className="block text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0] mb-1.5">
                            รายละเอียดเพิ่มเติม
                        </label>
                        <textarea
                            rows={2}
                            {...register(`items.${index}.notes` as const)}
                            className="block w-full rounded-lg border p-2.5 text-sm outline-none transition-all bg-white dark:bg-[#1a1a1a] text-[#0d0d0d] dark:text-[#ececf1] placeholder:text-[#acacbe] dark:placeholder:text-[#6e6e80] border-[#e5e5e5] dark:border-[#2a2a2a] hover:border-[#c5c5d2] dark:hover:border-[#444654] focus:border-[#0d0d0d] dark:focus:border-[#ececf1] focus:ring-1 focus:ring-[#0d0d0d]/10 dark:focus:ring-[#ececf1]/10 resize-none"
                            placeholder="หมายเหตุ..."
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

// ==========================================
// Main BookingModal Component
// ==========================================
const BookingModal: React.FC<BookingModalProps> = ({
    isOpen,
    onClose,
    editingBooking,
    initialDate,
    initialStartTime,
    initialEndTime
}) => {
    const { customers, locations, statusOptions, jobTypes } = useAppSelector((state) => state.masterData)
    const user = useAppSelector((state) => state.auth.user)
    const dispatch = useAppDispatch()

    const isEditMode = !!editingBooking
    const [submitting, setSubmitting] = useState(false)
    const [rowErrors, setRowErrors] = useState<Record<number, { timeError: string, overlapError: string, checkingOverlap: boolean }>>({})

    // Quick Add Modal States
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)

    const handleRowErrorChange = React.useCallback((index: number, errorState: { timeError: string, overlapError: string, checkingOverlap: boolean }) => {
        setRowErrors(prev => ({
            ...prev,
            [index]: errorState
        }))
    }, [])

    const hasAnyErrors = useMemo(() => {
        return Object.values(rowErrors).some(err => err.timeError || err.overlapError || err.checkingOverlap)
    }, [rowErrors])

    const getDefaultItem = (): BookingItemForm => ({
        customer: '',
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
            location: '',
            date: '',
            items: [getDefaultItem()]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items"
    });

    // Pre-fill form
    useEffect(() => {
        if (isOpen && editingBooking) {
            const startParts = editingBooking.StartTime?.split(':') || []
            const endParts = editingBooking.EndTime?.split(':') || []

            reset({
                jobType: editingBooking.JobType || '',
                location: editingBooking.LocationID || '',
                date: editingBooking.Date || '',
                items: [{
                    customer: editingBooking.CustomerID || '',
                    startHour: startParts[0] || '',
                    startMinute: startParts[1] || '',
                    endHour: endParts[0] || '',
                    endMinute: endParts[1] || '',
                    price: editingBooking.Price != null ? formatCurrency(editingBooking.Price) : '',
                    tax: editingBooking.Tax != null ? formatCurrency(editingBooking.Tax) : '',
                    summary: editingBooking.Summary != null ? formatCurrency(editingBooking.Summary) : '',
                    status: editingBooking.Status || 'Booking',
                    notes: editingBooking.Notes || ''
                }]
            })
            setRowErrors({})
        } else if (isOpen && !editingBooking) {
            let startHour = ''
            let startMinute = ''
            let endHour = ''
            let endMinute = ''
            let dateStr = ''

            if (initialDate) {
                dateStr = format(initialDate, 'yyyy-MM-dd')
            }
            if (initialStartTime) {
                startHour = format(initialStartTime, 'HH')
                startMinute = format(initialStartTime, 'mm')
            }
            if (initialEndTime) {
                endHour = format(initialEndTime, 'HH')
                endMinute = format(initialEndTime, 'mm')
            }

            reset({
                jobType: '',
                location: '',
                date: dateStr,
                items: [{
                    ...getDefaultItem(),
                    startHour,
                    startMinute,
                    endHour,
                    endMinute
                }]
            })
            setRowErrors({})
        }
    }, [isOpen, editingBooking, reset, initialDate, initialStartTime, initialEndTime])

    const watchedJobType = watch("jobType")
    const watchedDate = watch("date")

    const selectedJobType = useMemo(() => {
        if (!watchedJobType || !jobTypes) return null
        return (jobTypes || []).find(j => j.ID === watchedJobType) || null
    }, [watchedJobType, jobTypes])

    const jobOptions = (jobTypes || []).map((j) => ({ id: j.ID, label: j.TypeName }));
    const customerOptions = (customers || []).map((c) => ({ id: c.ID, label: c.CustomerName }));
    const locationOptions = (locations || []).map((l) => ({ id: l.ID, label: l.LocationName }));

    const onSubmit = async (data: FormValues) => {
        setSubmitting(true)
        try {
            const bookingsToInsert = data.items.map(item => {
                const priceVal = (safeMathEval(String(item.price)) ?? parseFloat(String(item.price).replace(/,/g, ''))) || 0
                const taxVal = (safeMathEval(String(item.tax)) ?? parseFloat(String(item.tax).replace(/,/g, ''))) || 0
                const summaryVal = (safeMathEval(String(item.summary)) ?? parseFloat(String(item.summary).replace(/,/g, ''))) || 0

                return {
                    JobType: data.jobType ? Number(data.jobType) : null,
                    LocationID: data.location ? Number(data.location) : null,
                    Date: data.date || null,
                    CustomerID: item.customer ? Number(item.customer) : null,
                    StartTime: `${item.startHour}:${item.startMinute}:00`,
                    EndTime: `${item.endHour}:${item.endMinute}:00`,
                    Price: priceVal,
                    Tax: taxVal,
                    Summary: summaryVal,
                    Status: String(item.status) || 'Booking',
                    Notes: item.notes || null,
                }
            })

            if (isEditMode && editingBooking) {
                // อัปเดตรายการเดียว
                await dispatch(UpdateBook({ id: editingBooking.ID, updates: bookingsToInsert[0] })).unwrap()
            } else {
                // เพิ่มรายการใหม่ทั้งหมด
                const newBookings = bookingsToInsert.map(b => ({ ...b, CreatedID: user?.id || null }))
                await dispatch(InsertBook(newBookings)).unwrap()
            }

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
                className="relative w-full max-w-3xl bg-[#fcfcfc] dark:bg-[#121212] rounded-xl shadow-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] flex flex-col my-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] rounded-t-xl">
                    <div>
                        <h2 className="text-lg font-semibold text-[#0d0d0d] dark:text-[#ececf1]">
                            {isEditMode ? 'แก้ไขรายการจอง (Edit Booking)' : 'เพิ่มรายการจอง (New Bookings)'}
                        </h2>
                        <p className="text-sm text-[#6e6e80] dark:text-[#8e8ea0] mt-1">
                            {isEditMode ? 'แก้ไขข้อมูลรายละเอียดการจอง' : 'กรอกข้อมูลสถานที่และเพิ่มรายชื่อลูกค้าด้านล่าง'}
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
                <div className="p-5 overflow-y-auto space-y-6" style={{ maxHeight: 'calc(100vh - 200px)' }}>

                    {/* Shared Fields (Location, Date, JobType) */}
                    <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] shadow-sm">
                        <h3 className="font-medium text-[#0d0d0d] dark:text-[#ececf1] mb-4">ข้อมูลร่วม (Shared Details)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="col-span-1">
                                <Controller
                                    name="location"
                                    control={control}
                                    rules={{ required: "กรุณาเลือกสถานที่" }}
                                    render={({ field }) => (
                                        <div className="flex flex-col">
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <SearchableSelect
                                                        label="สถานที่ (Location)"
                                                        icon={<MapPin className="w-4 h-4" />}
                                                        options={locationOptions}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="เลือกสถานที่..."
                                                        error={!!errors.location}
                                                    />
                                                </div>
                                                <div className="pt-[22px]">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsLocationModalOpen(true)}
                                                        className="shrink-0 w-11 h-11 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm"
                                                        title="เพิ่มสถานที่ใหม่"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            {errors.location && <p className="text-xs text-red-500 font-medium mt-1">{errors.location.message}</p>}
                                        </div>
                                    )}
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0] mb-1.5 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" /> วันที่ (Date)
                                </label>
                                <Controller
                                    name="date"
                                    control={control}
                                    rules={{ required: "กรุณาระบุวันที่" }}
                                    render={({ field }) => {
                                        const selectedDate = field.value && /^\d{4}-\d{2}-\d{2}$/.test(field.value)
                                            ? parse(field.value, 'yyyy-MM-dd', new Date())
                                            : null
                                        return (
                                            <div>
                                                <DatePicker
                                                    selected={selectedDate}
                                                    onChange={(date: Date | null) => {
                                                        if (date) field.onChange(format(date, 'yyyy-MM-dd'))
                                                        else field.onChange('')
                                                    }}
                                                    dateFormat="dd/MM/yyyy"
                                                    placeholderText="dd/mm/yyyy"
                                                    className={`block w-full h-[42px] px-3 rounded-lg border bg-white dark:bg-[#1a1a1a] text-sm text-[#0d0d0d] dark:text-[#ececf1] outline-none transition-all ${errors.date ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/10' : 'border-[#e5e5e5] dark:border-[#2a2a2a] hover:border-[#c5c5d2] dark:hover:border-[#444654] focus:border-[#0d0d0d] dark:focus:border-[#ececf1] focus:ring-1 focus:ring-[#0d0d0d]/10 dark:focus:ring-[#ececf1]/10'}`}
                                                    autoComplete="off"
                                                />
                                            </div>
                                        )
                                    }}
                                />
                                {errors.date && <p className="text-xs text-red-500 font-medium mt-1">{errors.date.message}</p>}
                            </div>

                            <div className="col-span-1">
                                <Controller
                                    name="jobType"
                                    control={control}
                                    rules={{ required: "กรุณาเลือกประเภทงาน" }}
                                    render={({ field }) => (
                                        <>
                                            <SearchableSelect
                                                label="ประเภทงาน (Job Type)"
                                                icon={<Briefcase className="w-4 h-4" />}
                                                options={jobOptions}
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="เลือกประเภทงาน..."
                                                error={!!errors.jobType}
                                            />
                                            {errors.jobType && <p className="text-xs text-red-500 font-medium mt-1">{errors.jobType.message}</p>}
                                        </>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Customers Items Array */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-[#0d0d0d] dark:text-[#ececf1]">รายการลูกค้า (Customers)</h3>
                        </div>

                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <BookingItemRow
                                    key={field.id}
                                    index={index}
                                    control={control}
                                    register={register}
                                    errors={errors}
                                    setValue={setValue}
                                    watch={watch}
                                    selectedJobType={selectedJobType}
                                    watchedDate={watchedDate}
                                    editingBooking={editingBooking}
                                    onRemove={remove}
                                    showRemove={!isEditMode && fields.length > 1}
                                    customerOptions={customerOptions}
                                    statusOptions={statusOptions}
                                    onRowErrorChange={handleRowErrorChange}
                                    onAddCustomer={() => setIsCustomerModalOpen(true)}
                                />
                            ))}
                        </div>

                        {!isEditMode && (
                            <div className="flex justify-start pt-2">
                                <button
                                    type="button"
                                    onClick={() => append(getDefaultItem())}
                                    className="flex items-center gap-1.5 text-sm w-full justify-center md:w-auto px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    <Plus className="w-4 h-4" /> เพิ่มลูกค้ารายการถัดไป
                                </button>
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer / Actions */}
                <div className="p-5 border-t border-[#e5e5e5] dark:border-[#2a2a2a] flex items-center justify-end gap-3 bg-white dark:bg-[#1a1a1a] rounded-b-xl">
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
                        disabled={hasAnyErrors || submitting || fields.length === 0}
                        loading={submitting}
                    >
                        {isEditMode ? 'บันทึกการแก้ไข' : `บันทึกรายการจอง (${fields.length})`}
                    </CustomButton>
                </div>
            </form>

            {/* Quick Add Modals */}
            <CustomerModal
                isOpen={isCustomerModalOpen}
                onClose={() => setIsCustomerModalOpen(false)}
            />
            <LocationModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
            />
        </div>
    );
};

export default BookingModal;
