import React, { useEffect, useState } from 'react'
import { Plus, Search, Briefcase, Clock } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { fetchJobTypes, deleteJobType } from '../features/jobTypeSlice'
import JobTypeModal from '../components/JobTypeModal'
import CustomButton from '../components/CustomButton'
import Navbars from '../components/Navbars'
import type { JobTypeMaster } from '../types/booking'

const JobTypeMasterPage: React.FC = () => {
    const dispatch = useAppDispatch()
    const { data: jobTypes, loading } = useAppSelector((state) => state.jobType)

    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedJobType, setSelectedJobType] = useState<JobTypeMaster | null>(null)

    useEffect(() => {
        dispatch(fetchJobTypes())
    }, [dispatch])

    const handleAdd = () => {
        setSelectedJobType(null)
        setIsModalOpen(true)
    }

    const handleEdit = (jobType: JobTypeMaster) => {
        setSelectedJobType(jobType)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (window.confirm('คุณต้องการลบประเภทงานนี้ใช่หรือไม่?')) {
            try {
                await dispatch(deleteJobType(id)).unwrap()
            } catch (err) {
                alert(`ลบไม่สำเร็จ: ${err}`)
            }
        }
    }

    const filteredJobTypes = jobTypes.filter(j =>
        j.TypeName?.toLowerCase().includes(searchTerm.toLowerCase())
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
                                <Briefcase className="h-6 w-6 text-[#0d0d0d] dark:text-[#ececf1]" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-semibold text-[#0d0d0d] dark:text-[#ececf1] tracking-tight">
                                    จัดการประเภทงาน
                                </h1>
                                <p className="mt-1 text-[#6e6e80] dark:text-[#8e8ea0] text-sm">
                                    จัดการรายชื่อประเภทงาน ราคาเริ่มต้น และเวลาทำงานขั้นต่ำ
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <CustomButton onClick={handleAdd}>
                                <Plus className="w-5 h-5" />
                                เพิ่มประเภทงาน
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
                            ค้นหาประเภทงาน
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-[#acacbe] group-focus-within:text-[#0d0d0d] dark:group-focus-within:text-[#ececf1] transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อประเภทงาน..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full h-11 pl-10 pr-4 bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg text-sm text-[#0d0d0d] dark:text-[#ececf1] outline-none hover:border-[#c5c5d2] dark:hover:border-[#444654] focus:border-[#0d0d0d] dark:focus:border-[#ececf1] focus:ring-1 focus:ring-[#0d0d0d]/10 dark:focus:ring-[#ececf1]/10 transition-all placeholder:text-[#acacbe] dark:placeholder:text-[#6e6e80]"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-4">
                    <p className="text-sm text-[#6e6e80] dark:text-[#8e8ea0]">
                        พบ <span className="font-semibold text-[#0d0d0d] dark:text-[#ececf1]">{filteredJobTypes.length}</span> รายการ
                        {filteredJobTypes.length !== jobTypes.length && (
                            <span> จากทั้งหมด {jobTypes.length} รายการ</span>
                        )}
                    </p>

                    {/* Desktop Table matching BookingTable */}
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] transition-colors">
                        <table className="w-full text-sm">
                            <thead className="bg-[#f7f7f8] dark:bg-[#1a1a1a] border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
                                <tr>
                                    <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">ID</th>
                                    <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">ประเภทงาน</th>
                                    <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">เวลาขั้นต่ำ</th>
                                    <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">ราคาเริ่มต้น</th>
                                    <th className="p-4 text-center text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#2a2a2a] bg-white dark:bg-[#0d0d0d]">
                                {loading && filteredJobTypes.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-[#6e6e80] dark:text-[#8e8ea0] animate-pulse">
                                            กำลังโหลดข้อมูล...
                                        </td>
                                    </tr>
                                ) : filteredJobTypes.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-[#6e6e80] dark:text-[#8e8ea0]">
                                            ไม่พบข้อมูลประเภทงาน
                                        </td>
                                    </tr>
                                ) : (
                                    filteredJobTypes.map((jobType) => (
                                        <tr key={jobType.ID} className="hover:bg-[#f7f7f8] dark:hover:bg-[#1a1a1a] transition-colors group">
                                            <td className="p-4 font-medium text-[#acacbe] dark:text-[#565869]">#{jobType.ID}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-md bg-[#f7f7f8] dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#353740] flex items-center justify-center text-[#0d0d0d] dark:text-[#ececf1]">
                                                        <Briefcase className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium text-[#0d0d0d] dark:text-[#ececf1]">{jobType.TypeName}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5 text-sm text-[#0d0d0d] dark:text-[#ececf1] font-medium">
                                                    <Clock className="w-4 h-4 text-[#6e6e80] dark:text-[#8e8ea0]" />
                                                    {jobType.MinTimeMinutes % 60 === 0 ? `${jobType.MinTimeMinutes / 60} ชั่วโมง` : `${jobType.MinTimeMinutes} นาที`}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5 text-sm text-[#0d0d0d] dark:text-[#ececf1] font-medium">
                                                        {(jobType.PriceUnitMinutes * 60).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท/ชั่วโมง
                                                    </div>
                                                    <span className="text-xs text-[#6e6e80] dark:text-[#8e8ea0] ml-5">
                                                        (หรือ {jobType.PriceUnitMinutes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท/นาที)
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    <CustomButton
                                                        variant="secondary"
                                                        className="!px-5 !py-2 text-sm"
                                                        onClick={() => handleEdit(jobType)}
                                                    >
                                                        แก้ไข
                                                    </CustomButton>
                                                    <CustomButton
                                                        variant="danger"
                                                        className="!px-5 !py-2 text-sm"
                                                        onClick={() => handleDelete(jobType.ID)}
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
                        {loading && filteredJobTypes.length === 0 ? (
                            <div className="text-center py-8 text-[#6e6e80] dark:text-[#8e8ea0] animate-pulse">
                                กำลังโหลดข้อมูล...
                            </div>
                        ) : filteredJobTypes.length === 0 ? (
                            <div className="text-center py-8 text-[#6e6e80] dark:text-[#8e8ea0]">
                                ไม่พบข้อมูลประเภทงาน
                            </div>
                        ) : (
                            filteredJobTypes.map((jobType) => (
                                <div
                                    key={jobType.ID}
                                    className="rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-4 bg-white dark:bg-[#1a1a1a] transition-colors"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-md bg-[#f7f7f8] dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#353740] flex items-center justify-center text-[#0d0d0d] dark:text-[#ececf1] shrink-0">
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-[#0d0d0d] dark:text-[#ececf1]">{jobType.TypeName}</p>
                                            <p className="text-xs text-[#6e6e80] dark:text-[#8e8ea0]">รหัสงาน: #{jobType.ID}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="flex items-center gap-2 text-[#0d0d0d] dark:text-[#ececf1] font-medium border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg p-2.5 bg-[#f7f7f8] dark:bg-[#0d0d0d] text-sm">
                                            <Clock className="w-4 h-4 text-[#6e6e80] dark:text-[#8e8ea0] shrink-0" />
                                            <span>{jobType.MinTimeMinutes % 60 === 0 ? `${jobType.MinTimeMinutes / 60} ชั่วโมง` : `${jobType.MinTimeMinutes} นาที`}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[#0d0d0d] dark:text-[#ececf1] font-medium border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg p-2.5 bg-[#f7f7f8] dark:bg-[#0d0d0d] text-sm flex-wrap">
                                            <span>{(jobType.PriceUnitMinutes * 60).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} บาท/ชม.</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-[#e5e5e5] dark:border-[#2a2a2a]">
                                        <CustomButton
                                            variant="secondary"
                                            fullWidth
                                            className="!py-2"
                                            onClick={() => handleEdit(jobType)}
                                        >
                                            แก้ไข
                                        </CustomButton>
                                        <CustomButton
                                            variant="danger"
                                            fullWidth
                                            className="!py-2"
                                            onClick={() => handleDelete(jobType.ID)}
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

            <JobTypeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingJobType={selectedJobType}
            />
        </div>
    )
}

export default JobTypeMasterPage
