import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { X, User, Facebook } from 'lucide-react'
import CustomButton from './CustomButton'
import CustomInput from './CustomInput'
import { useAppDispatch } from '../hooks'
import { addCustomer, updateCustomer, fetchCustomers } from '../features/customerSlice'
import type { CustomerMaster } from '../types/booking'

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingCustomer?: CustomerMaster | null;
}

interface FormValues {
    customerName: string;
    facebookIink: string;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, editingCustomer }) => {
    const dispatch = useAppDispatch()
    const isEditMode = !!editingCustomer
    const [submitting, setSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<FormValues>({
        defaultValues: {
            customerName: '',
            facebookIink: ''
        }
    });

    useEffect(() => {
        if (isOpen && editingCustomer) {
            reset({
                customerName: editingCustomer.CustomerName || '',
                facebookIink: editingCustomer.FacebookIink || ''
            })
        } else if (isOpen && !editingCustomer) {
            reset({
                customerName: '',
                facebookIink: ''
            })
        }
    }, [isOpen, editingCustomer, reset])

    const onSubmit = async (data: FormValues) => {
        setSubmitting(true)
        try {
            const customerData = {
                CustomerName: data.customerName,
                FacebookIink: data.facebookIink,
                ActiveStatus: true
            }

            if (isEditMode && editingCustomer) {
                await dispatch(updateCustomer({ id: editingCustomer.ID, updates: customerData })).unwrap()
            } else {
                await dispatch(addCustomer(customerData)).unwrap()
            }

            await dispatch(fetchCustomers())
            onClose()
        } catch (err) {
            console.error('Failed to save customer:', err)
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
                            {isEditMode ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}
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
                            label="ชื่อลูกค้า"
                            icon={<User className="w-4 h-4" />}
                            placeholder="กรุณากรอกชื่อลูกค้า"
                            {...register("customerName", { required: "กรุณาระบุชื่อลูกค้า" })}
                        />
                        {errors.customerName && <p className="text-xs text-red-500">{errors.customerName.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <CustomInput
                            label="Facebook Link (หรือช่องทางติดต่อ)"
                            icon={<Facebook className="w-4 h-4" />}
                            placeholder="https://facebook.com/..."
                            {...register("facebookIink")}
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

export default CustomerModal
