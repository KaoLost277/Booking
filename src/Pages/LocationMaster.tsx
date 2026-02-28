import React, { useEffect, useState, useMemo } from 'react'
import { Plus, Search, MapPin, ExternalLink, Copy, Check, Map, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { fetchLocations, deleteLocation } from '../features/locationSlice'
import LocationModal from '../components/LocationModal'
import CustomButton from '../components/CustomButton'
import Navbars from '../components/Navbars'
import type { LocationMaster } from '../types/booking'

const LocationMasterPage: React.FC = () => {
    const dispatch = useAppDispatch()
    const { data: locations, loading } = useAppSelector((state) => state.location)

    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState<LocationMaster | null>(null)
    const [copiedId, setCopiedId] = useState<number | null>(null)

    useEffect(() => {
        dispatch(fetchLocations())
    }, [dispatch])

    const handleAdd = () => {
        setSelectedLocation(null)
        setIsModalOpen(true)
    }

    const handleEdit = (location: LocationMaster) => {
        setSelectedLocation(location)
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (window.confirm('คุณต้องการลบสถานที่นี้ใช่หรือไม่?')) {
            try {
                await dispatch(deleteLocation(id)).unwrap()
            } catch (err) {
                alert(`ลบไม่สำเร็จ: ${err}`)
            }
        }
    }

    const filteredLocations = useMemo(() => locations.filter(l =>
        l.LocationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.Locationlink?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [locations, searchTerm])

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    // Pagination Logic
    const totalItems = filteredLocations.length
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedData = filteredLocations.slice(startIndex, startIndex + itemsPerPage)

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(p => p - 1)
    }

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(p => p + 1)
    }

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
                                <Map className="h-6 w-6 text-[#0d0d0d] dark:text-[#ececf1]" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-semibold text-[#0d0d0d] dark:text-[#ececf1] tracking-tight">
                                    จัดการสถานที่
                                </h1>
                                <p className="mt-1 text-[#6e6e80] dark:text-[#8e8ea0] text-sm">
                                    จัดการรายชื่อสถานที่ตู้คอนเทนเนอร์และพิกัดที่เกี่ยวข้อง
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <CustomButton onClick={handleAdd}>
                                <Plus className="w-5 h-5" />
                                เพิ่มสถานที่
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
                            ค้นหาสถานที่
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-[#acacbe] group-focus-within:text-[#0d0d0d] dark:group-focus-within:text-[#ececf1] transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="ค้นหาชื่อสถานที่ หรือ Link..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full h-11 pl-10 pr-4 bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg text-sm text-[#0d0d0d] dark:text-[#ececf1] outline-none hover:border-[#c5c5d2] dark:hover:border-[#444654] focus:border-[#0d0d0d] dark:focus:border-[#ececf1] focus:ring-1 focus:ring-[#0d0d0d]/10 dark:focus:ring-[#ececf1]/10 transition-all placeholder:text-[#acacbe] dark:placeholder:text-[#6e6e80]"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-4">
                    <p className="text-sm text-[#6e6e80] dark:text-[#8e8ea0]">
                        พบ <span className="font-semibold text-[#0d0d0d] dark:text-[#ececf1]">{filteredLocations.length}</span> รายการ
                        {filteredLocations.length !== locations.length && (
                            <span> จากทั้งหมด {locations.length} รายการ</span>
                        )}
                    </p>

                    {/* Desktop Table matching BookingTable */}
                    <div className="hidden md:block overflow-x-auto rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] transition-colors">
                        <table className="w-full text-sm">
                            <thead className="bg-[#f7f7f8] dark:bg-[#1a1a1a] border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
                                <tr>
                                    <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">ID</th>
                                    <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">ชื่อสถานที่</th>
                                    <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">Location Link</th>
                                    <th className="p-4 text-center text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#2a2a2a] bg-white dark:bg-[#0d0d0d]">
                                {loading && filteredLocations.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-[#6e6e80] dark:text-[#8e8ea0] animate-pulse">
                                            กำลังโหลดข้อมูล...
                                        </td>
                                    </tr>
                                ) : paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-[#6e6e80] dark:text-[#8e8ea0]">
                                            ไม่พบข้อมูลสถานที่
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((location) => (
                                        <tr key={location.ID} className="hover:bg-[#f7f7f8] dark:hover:bg-[#1a1a1a] transition-colors group">
                                            <td className="p-4 font-medium text-[#acacbe] dark:text-[#565869]">#{location.ID}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-md bg-[#f7f7f8] dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#353740] flex items-center justify-center text-[#0d0d0d] dark:text-[#ececf1]">
                                                        <MapPin className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium text-[#0d0d0d] dark:text-[#ececf1]">{location.LocationName}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {location.Locationlink ? (
                                                    <div className="flex items-center gap-2">
                                                        <a
                                                            href={location.Locationlink.startsWith('http') ? location.Locationlink : `https://${location.Locationlink}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg outline-none hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                            เปิดลิงก์
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                navigator.clipboard.writeText(location.Locationlink.startsWith('http') ? location.Locationlink : `https://${location.Locationlink}`)
                                                                setCopiedId(location.ID)
                                                                setTimeout(() => setCopiedId(null), 2000)
                                                            }}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6e6e80] dark:text-[#8e8ea0] bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg outline-none hover:bg-[#f7f7f8] dark:hover:bg-[#2a2a2a] transition-colors"
                                                        >
                                                            {copiedId === location.ID ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                                            คัดลอก
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[#6e6e80] dark:text-[#8e8ea0] italic text-xs">ไม่มีลิงก์สถานที่</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    <CustomButton
                                                        variant="secondary"
                                                        className="!px-5 !py-2 text-sm"
                                                        onClick={() => handleEdit(location)}
                                                    >
                                                        แก้ไข
                                                    </CustomButton>
                                                    <CustomButton
                                                        variant="danger"
                                                        className="!px-5 !py-2 text-sm"
                                                        onClick={() => handleDelete(location.ID)}
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
                        {loading && filteredLocations.length === 0 ? (
                            <div className="text-center py-8 text-[#6e6e80] dark:text-[#8e8ea0] animate-pulse">
                                กำลังโหลดข้อมูล...
                            </div>
                        ) : paginatedData.length === 0 ? (
                            <div className="text-center py-8 text-[#6e6e80] dark:text-[#8e8ea0]">
                                ไม่พบข้อมูลสถานที่
                            </div>
                        ) : (
                            paginatedData.map((location) => (
                                <div
                                    key={location.ID}
                                    className="rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-4 bg-white dark:bg-[#1a1a1a] transition-colors"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-md bg-[#f7f7f8] dark:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#353740] flex items-center justify-center text-[#0d0d0d] dark:text-[#ececf1] shrink-0">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-[#0d0d0d] dark:text-[#ececf1]">{location.LocationName}</p>
                                            <p className="text-xs text-[#6e6e80] dark:text-[#8e8ea0]">รหัสสถานที่: #{location.ID}</p>
                                        </div>
                                    </div>

                                    <div className="text-sm mb-4">
                                        {location.Locationlink ? (
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={location.Locationlink.startsWith('http') ? location.Locationlink : `https://${location.Locationlink}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-medium transition-colors border border-blue-200 dark:border-blue-500/20 rounded-lg p-2.5 bg-blue-50 dark:bg-blue-500/10 text-xs"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    เปิดลิงก์
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        navigator.clipboard.writeText(location.Locationlink.startsWith('http') ? location.Locationlink : `https://${location.Locationlink}`)
                                                        setCopiedId(location.ID)
                                                        setTimeout(() => setCopiedId(null), 2000)
                                                    }}
                                                    className="flex-1 flex items-center justify-center gap-2 text-[#0d0d0d] dark:text-[#ececf1] font-medium transition-colors border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg p-2.5 bg-white dark:bg-[#1a1a1a] text-xs hover:bg-[#f7f7f8] dark:hover:bg-[#2a2a2a]"
                                                >
                                                    {copiedId === location.ID ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-[#6e6e80] dark:text-[#8e8ea0]" />}
                                                    คัดลอกลิงก์
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 text-[#6e6e80] dark:text-[#8e8ea0] italic border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg p-2.5 bg-white dark:bg-[#1a1a1a] text-xs">
                                                ไม่มีลิงก์สถานที่
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-[#e5e5e5] dark:border-[#2a2a2a]">
                                        <CustomButton
                                            variant="secondary"
                                            fullWidth
                                            className="!py-2"
                                            onClick={() => handleEdit(location)}
                                        >
                                            แก้ไข
                                        </CustomButton>
                                        <CustomButton
                                            variant="danger"
                                            fullWidth
                                            className="!py-2"
                                            onClick={() => handleDelete(location.ID)}
                                        >
                                            ลบ
                                        </CustomButton>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {totalItems > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-1">
                            <div className="text-sm text-[#6e6e80] dark:text-[#8e8ea0]">
                                แสดง <span className="font-semibold text-[#0d0d0d] dark:text-[#ececf1]">{startIndex + 1}</span> ถึง <span className="font-semibold text-[#0d0d0d] dark:text-[#ececf1]">{Math.min(startIndex + itemsPerPage, totalItems)}</span> จากทั้งหมด <span className="font-semibold text-[#0d0d0d] dark:text-[#ececf1]">{totalItems}</span> รายการ
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] text-[#0d0d0d] dark:text-[#ececf1] bg-white dark:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f7f7f8] dark:hover:bg-[#2a2a2a] transition-colors flex items-center gap-1 text-sm font-medium"
                                >
                                    <ChevronLeft className="w-4 h-4" /> ก่อนหน้า
                                </button>
                                <div className="text-sm font-medium text-[#0d0d0d] dark:text-[#ececf1] px-4">
                                    หน้า {currentPage} / {totalPages}
                                </div>
                                <button
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] text-[#0d0d0d] dark:text-[#ececf1] bg-white dark:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#f7f7f8] dark:hover:bg-[#2a2a2a] transition-colors flex items-center gap-1 text-sm font-medium"
                                >
                                    ถัดไป <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <LocationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingLocation={selectedLocation}
            />
        </div>
    )
}

export default LocationMasterPage
