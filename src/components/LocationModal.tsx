import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { X, MapPin, Link as LinkIcon } from 'lucide-react'
import CustomButton from './CustomButton'
import CustomInput from './CustomInput'
import { useAppDispatch, useAppSelector } from '../hooks'
import { addLocation, updateLocation, fetchLocations } from '../features/locationSlice'
import { fetchMasterData } from '../features/masterDataSlice'
import type { LocationMaster } from '../types/booking'

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingLocation?: LocationMaster | null;
}

interface FormValues {
    locationName: string;
    locationlink: string;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, editingLocation }) => {
    const dispatch = useAppDispatch()
    const { locations } = useAppSelector((state) => state.masterData)
    const isEditMode = !!editingLocation
    const [submitting, setSubmitting] = useState(false)
    const [duplicateError, setDuplicateError] = useState('')

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<FormValues>({
        defaultValues: {
            locationName: '',
            locationlink: ''
        }
    });

    useEffect(() => {
        if (isOpen && editingLocation) {
            reset({
                locationName: editingLocation.LocationName || '',
                locationlink: editingLocation.Locationlink || ''
            })
        } else if (isOpen && !editingLocation) {
            reset({
                locationName: '',
                locationlink: ''
            })
        }
        setDuplicateError('')
    }, [isOpen, editingLocation, reset])

    const onSubmit = async (data: FormValues) => {
        setDuplicateError('')
        setSubmitting(true)

        // ตรวจสอบข้อมูลซ้ำ
        const isDuplicate = locations.some(
            (l) => l.LocationName.toLowerCase() === data.locationName.toLowerCase() && (!isEditMode || l.ID !== editingLocation?.ID)
        )

        if (isDuplicate) {
            setDuplicateError('ข้อมูลสถานที่นี้มีอยู่แล้วในระบบ')
            setSubmitting(false)
            return
        }

        try {
            const locationData = {
                LocationName: data.locationName,
                Locationlink: data.locationlink,
                ActiveStatus: true
            }

            if (isEditMode && editingLocation) {
                await dispatch(updateLocation({ id: editingLocation.ID, updates: locationData })).unwrap()
            } else {
                await dispatch(addLocation(locationData)).unwrap()
            }

            await dispatch(fetchLocations())
            await dispatch(fetchMasterData())
            onClose()
        } catch (err) {
            console.error('Failed to save location:', err)
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
                            {isEditMode ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่'}
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
                    <div className="space-y-1">
                        <CustomInput
                            label="ชื่อสถานที่"
                            icon={<MapPin className="w-4 h-4" />}
                            placeholder="กรุณากรอกชื่อสถานที่"
                            {...register("locationName", { required: "กรุณาระบุชื่อสถานที่" })}
                        />
                        {errors.locationName && <p className="text-xs text-red-500">{errors.locationName.message}</p>}
                        {duplicateError && <p className="text-xs text-red-500">{duplicateError}</p>}
                    </div>

                    <div className="space-y-1">
                        <CustomInput
                            label="Location Link (หรือ Google Maps Link)"
                            icon={<LinkIcon className="w-4 h-4" />}
                            placeholder="https://goo.gl/maps/..."
                            {...register("locationlink")}
                        />
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

export default LocationModal
