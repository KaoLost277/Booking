import React, { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, User, Facebook, Users } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { fetchCustomers, deleteCustomer } from '../features/customerSlice'
import CustomerModal from '../components/CustomerModal'
import CustomButton from '../components/CustomButton'
import Navbars from '../components/Navbars'
import type { CustomerMaster } from '../types/booking'

const CustomerMasterPage: React.FC = () => {
    const dispatch = useAppDispatch()
    const { data: customers, loading } = useAppSelector((state) => state.customer)

    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerMaster | null>(null)

    useEffect(() => {
        dispatch(fetchCustomers())
    }, [dispatch])

    const handleAdd = () => {
        setSelectedCustomer(null)
        setIsModalOpen(true)
    }

    const handleEdit = (customer: CustomerMaster) => {
        setSelectedCustomer(customer)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (window.confirm('คุณต้องการลบข้อมูลลูกค้าท่านนี้ใช่หรือไม่?')) {
            try {
                await dispatch(deleteCustomer(id)).unwrap()
            } catch (err) {
                alert(`ลบไม่สำเร็จ: ${err}`)
            }
        }
    }

    const filteredCustomers = customers.filter(c =>
        c.CustomerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.FacebookIink?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-dvh bg-white dark:bg-[#0d0d0d] transition-colors duration-200">
            <Navbars />

            {/* Page Header — OpenAI style */}
            <div className="border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
                <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                        {/* Title */}
                        <div className="flex items-start gap-4">
                            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f7f7f8] dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] transition-colors">
                                <Users className="h-6 w-6 text-[#0d0d0d] dark:text-[#ececf1]" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-semibold text-[#0d0d0d] dark:text-[#ececf1] tracking-tight">
                                    จัดการข้อมูลลูกค้า
                                </h1>
                                <p className="mt-1 text-[#6e6e80] dark:text-[#8e8ea0] text-sm">
                                    จัดการรายชื่อลูกค้าและช่องทางการติดต่อทั้งหมด
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <CustomButton onClick={handleAdd}>
                                <Plus className="w-5 h-5" />
                                เพิ่มลูกค้าใหม่
                            </CustomButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6">

                {/* Filter Container matching BookingFilter */}
                <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-4 lg:p-5 transition-colors">
                    <div className="w-full lg:max-w-md">
                        <label className="block text-xs font-medium text-[#6e6e80] dark:text-[#8e8ea0] uppercase tracking-wider mb-1.5 ml-0.5">
                            ค้นหาลูกค้า
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-[#acacbe] group-focus-within:text-[#0d0d0d] dark:group-focus-within:text-[#ececf1] transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อลูกค้า หรือ Facebook..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full h-11 pl-10 pr-4 bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg text-sm text-[#0d0d0d] dark:text-[#ececf1] outline-none hover:border-[#c5c5d2] dark:hover:border-[#444654] focus:border-[#0d0d0d] dark:focus:border-[#ececf1] focus:ring-1 focus:ring-[#0d0d0d]/10 dark:focus:ring-[#ececf1]/10 transition-all placeholder:text-[#acacbe] dark:placeholder:text-[#6e6e80]"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-4">
                    <p className="text-sm text-[#6e6e80] dark:text-[#8e8ea0]">
                        พบ <span className="font-semibold text-[#0d0d0d] dark:text-[#ececf1]">{filteredCustomers.length}</span> รายการ
                        {filteredCustomers.length !== customers.length && (
                            <span> จากทั้งหมด {customers.length} รายการ</span>
                        )}
                    </p>

                    {/* Desktop Table matching BookingTable */}
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] transition-colors">
                        <table className="w-full text-sm">
                            <thead className="bg-[#f7f7f8] dark:bg-[#1a1a1a] border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
                                <tr>
                                    <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">ID</th>
                                    <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">ชื่อลูกค้า</th>
                                    <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">Facebook / ติดต่อ</th>
                                    <th className="p-4 text-center text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#2a2a2a] bg-white dark:bg-[#0d0d0d]">
                                {loading && filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-[#6e6e80] dark:text-[#8e8ea0] animate-pulse">
                                            กำลังโหลดข้อมูล...
                                        </td>
                                    </tr>
                                ) : filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-[#6e6e80] dark:text-[#8e8ea0]">
                                            ไม่พบข้อมูลลูกค้า
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCustomers.map((customer) => (
                                        <tr key={customer.ID} className="hover:bg-[#f7f7f8] dark:hover:bg-[#1a1a1a] transition-colors group">
                                            <td className="p-4 font-medium text-[#acacbe] dark:text-[#565869]">#{customer.ID}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-md bg-[#f7f7f8] dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#353740] flex items-center justify-center text-[#0d0d0d] dark:text-[#ececf1]">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium text-[#0d0d0d] dark:text-[#ececf1]">{customer.CustomerName}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {customer.FacebookIink ? (
                                                    <a
                                                        href={customer.FacebookIink.startsWith('http') ? customer.FacebookIink : `https://${customer.FacebookIink}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 text-sm text-[#0d0d0d] dark:text-[#ececf1] hover:text-blue-500 dark:hover:text-blue-400 font-medium transition-colors"
                                                    >
                                                        <Facebook className="w-4 h-4" />
                                                        {customer.FacebookIink}
                                                    </a>
                                                ) : (
                                                    <span className="text-[#6e6e80] dark:text-[#8e8ea0] italic">-</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    <CustomButton
                                                        variant="secondary"
                                                        className="!px-5 !py-2 text-sm"
                                                        onClick={() => handleEdit(customer)}
                                                    >
                                                        แก้ไข
                                                    </CustomButton>
                                                    <CustomButton
                                                        variant="danger"
                                                        className="!px-5 !py-2 text-sm"
                                                        onClick={() => handleDelete(customer.ID)}
                                                    >
                                                        ลบ
                                                    </CustomButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards matching BookingTable */}
                    <div className="md:hidden space-y-3">
                        {loading && filteredCustomers.length === 0 ? (
                            <div className="text-center py-8 text-[#6e6e80] dark:text-[#8e8ea0] animate-pulse">
                                กำลังโหลดข้อมูล...
                            </div>
                        ) : filteredCustomers.length === 0 ? (
                            <div className="text-center py-8 text-[#6e6e80] dark:text-[#8e8ea0]">
                                ไม่พบข้อมูลลูกค้า
                            </div>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <div
                                    key={customer.ID}
                                    className="rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-4 bg-white dark:bg-[#1a1a1a] transition-colors"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-md bg-[#f7f7f8] dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#353740] flex items-center justify-center text-[#0d0d0d] dark:text-[#ececf1] shrink-0">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-[#0d0d0d] dark:text-[#ececf1]">{customer.CustomerName}</p>
                                            <p className="text-xs text-[#6e6e80] dark:text-[#8e8ea0]">รหัสลูกค้า: #{customer.ID}</p>
                                        </div>
                                    </div>

                                    <div className="text-sm mb-4">
                                        {customer.FacebookIink ? (
                                            <a
                                                href={customer.FacebookIink.startsWith('http') ? customer.FacebookIink : `https://${customer.FacebookIink}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-[#0d0d0d] dark:text-[#ececf1] hover:text-blue-500 dark:hover:text-blue-400 font-medium transition-colors border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg p-2.5 bg-[#f7f7f8] dark:bg-[#0d0d0d]"
                                            >
                                                <Facebook className="w-4 h-4 text-blue-500" />
                                                <span className="truncate">{customer.FacebookIink}</span>
                                            </a>
                                        ) : (
                                            <div className="flex items-center gap-2 text-[#6e6e80] dark:text-[#8e8ea0] italic border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg p-2.5 bg-[#f7f7f8] dark:bg-[#0d0d0d]">
                                                ไม่มีช่องทางการติดต่อ
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 pt-3 border-t border-[#e5e5e5] dark:border-[#2a2a2a]">
                                        <CustomButton
                                            variant="secondary"
                                            fullWidth
                                            className="!py-2"
                                            onClick={() => handleEdit(customer)}
                                        >
                                            แก้ไข
                                        </CustomButton>
                                        <CustomButton
                                            variant="danger"
                                            fullWidth
                                            className="!py-2"
                                            onClick={() => handleDelete(customer.ID)}
                                        >
                                            ลบ
                                        </CustomButton>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            <CustomerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingCustomer={selectedCustomer}
            />
        </div>
    )
}

export default CustomerMasterPage
