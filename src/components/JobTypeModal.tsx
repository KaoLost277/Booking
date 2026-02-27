import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { X, Briefcase, Clock } from 'lucide-react'
import CustomButton from './CustomButton'
import CustomInput from './CustomInput'
import { useAppDispatch } from '../hooks'
import { addJobType, updateJobType, fetchJobTypes } from '../features/jobTypeSlice'
import type { JobTypeMaster } from '../types/booking'

interface JobTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingJobType?: JobTypeMaster | null;
}

interface FormValues {
    typeName: string;
    unit: 'm' | 'h';
    minTimeVal: number;
    priceVal: string;
}

const JobTypeModal: React.FC<JobTypeModalProps> = ({ isOpen, onClose, editingJobType }) => {
    const dispatch = useAppDispatch()
    const isEditMode = !!editingJobType
    const [submitting, setSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<FormValues>({
        defaultValues: {
            typeName: '',
            unit: 'h',
            minTimeVal: 1,
            priceVal: "0.00"
        }
    });

    const selectedUnit = watch('unit');

    useEffect(() => {
        if (isOpen && editingJobType) {
            // Default to hour if it's divisible by 60 for cleaner UI
            const isHour = editingJobType.MinTimeMinutes % 60 === 0;
            const tempPrice = isHour ? (editingJobType.PriceUnitMinutes * 60) : editingJobType.PriceUnitMinutes;

            reset({
                typeName: editingJobType.TypeName || '',
                unit: isHour ? 'h' : 'm',
                minTimeVal: isHour ? editingJobType.MinTimeMinutes / 60 : editingJobType.MinTimeMinutes,
                priceVal: tempPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            })
        } else if (isOpen && !editingJobType) {
            reset({
                typeName: '',
                unit: 'h',
                minTimeVal: 1,
                priceVal: "0.00"
            })
        }
    }, [isOpen, editingJobType, reset])

    const onSubmit = async (data: FormValues) => {
        setSubmitting(true)
        try {
            const isHour = data.unit === 'h';
            // Backend stored in minutes: 
            // MinTimeMinutes = hours * 60
            // PriceUnitMinutes = pricePerHour / 60 (so price per minute)
            const minMins = isHour ? Number(data.minTimeVal) * 60 : Number(data.minTimeVal);
            const numPrice = Number(String(data.priceVal).replace(/,/g, ''));
            const priceMins = isHour ? numPrice / 60 : numPrice;

            const jobTypeData = {
                TypeName: data.typeName,
                MinTimeMinutes: minMins,
                PriceUnitMinutes: priceMins,
                ActiveStatus: true
            }

            if (isEditMode && editingJobType) {
                await dispatch(updateJobType({ id: editingJobType.ID, updates: jobTypeData })).unwrap()
            } else {
                await dispatch(addJobType(jobTypeData)).unwrap()
            }

            await dispatch(fetchJobTypes())
            onClose()
        } catch (err) {
            console.error('Failed to save job type:', err)
            alert(`เกิดข้อผิดพลาด: ${err}`)
        } finally {
            setSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="relative w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] flex flex-col my-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
                    <div>
                        <h2 className="text-lg font-semibold text-[#0d0d0d] dark:text-[#ececf1]">
                            {isEditMode ? 'แก้ไขประเภทงาน' : 'เพิ่มประเภทงาน'}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full text-[#6e6e80] dark:text-[#8e8ea0] hover:bg-[#f7f7f8] dark:hover:bg-[#2a2a2a] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    <div className="flex gap-4 mb-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-[#0d0d0d] dark:text-[#ececf1] cursor-pointer">
                            <input type="radio" value="m" {...register("unit")} className="accent-[#0d0d0d] dark:accent-[#ececf1] w-4 h-4" />
                            ระบุเป็นนาที
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-[#0d0d0d] dark:text-[#ececf1] cursor-pointer">
                            <input type="radio" value="h" {...register("unit")} className="accent-[#0d0d0d] dark:accent-[#ececf1] w-4 h-4" />
                            ระบุเป็นชั่วโมง
                        </label>
                    </div>

                    <div className="space-y-1">
                        <CustomInput
                            label="ชื่อประเภทงาน"
                            icon={<Briefcase className="w-4 h-4" />}
                            placeholder="กรุณากรอกชื่อประเภทงาน"
                            {...register("typeName", { required: "กรุณาระบุชื่อประเภทงาน" })}
                        />
                        {errors.typeName && <p className="text-xs text-red-500">{errors.typeName.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <CustomInput
                            label={`เวลาขั้นต่ำ (${selectedUnit === 'h' ? 'ชั่วโมง' : 'นาที'})`}
                            type="number"
                            icon={<Clock className="w-4 h-4" />}
                            placeholder={selectedUnit === 'h' ? "1" : "60"}
                            {...register("minTimeVal", {
                                required: "กรุณาระบุเวลาขั้นต่ำ",
                                min: { value: 0, message: "ต้องไม่เป็นค่าติดลบ" }
                            })}
                        />
                        {errors.minTimeVal && <p className="text-xs text-red-500">{errors.minTimeVal.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <CustomInput
                            label={`ราคาเริ่มต้น (${selectedUnit === 'h' ? 'บาท/ชั่วโมง' : 'บาท/นาที'})`}
                            type="text"
                            placeholder={selectedUnit === 'h' ? "500.00" : "8.33"}
                            {...register("priceVal", {
                                required: "กรุณาระบุราคาเริ่มต้น",
                                validate: value => {
                                    const num = Number(String(value).replace(/,/g, ''));
                                    return (!isNaN(num) && num >= 0) || "ต้องไม่เป็นค่าติดลบและเป็นตัวเลขที่ถูกต้อง";
                                },
                                onChange: (e) => {
                                    const val = e.target.value.replace(/[^0-9.,]/g, '');
                                    e.target.value = val;
                                },
                                onBlur: (e) => {
                                    const val = e.target.value.replace(/,/g, '');
                                    if (!isNaN(Number(val)) && val !== '') {
                                        setValue("priceVal", Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                                    }
                                }
                            })}
                        />
                        {errors.priceVal && <p className="text-xs text-red-500">{errors.priceVal.message}</p>}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-[#e5e5e5] dark:border-[#2a2a2a] flex items-center justify-end gap-3 bg-[#f7f7f8] dark:bg-[#1a1a1a] rounded-b-xl">
                    <CustomButton
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                    >
                        ยกเลิก
                    </CustomButton>
                    <CustomButton
                        type="submit"
                        loading={submitting}
                        disabled={submitting}
                    >
                        {isEditMode ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล'}
                    </CustomButton>
                </div>
            </form>
        </div>
    )
}

export default JobTypeModal
