import React, { useEffect, useState, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { bookGet } from '../features/bookSlice'
import { fetchMasterData } from '../features/masterDataSlice'
import Navbars from '../components/Navbars'
import LoadingSpinner from '../components/LoadingSpinner'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar,
} from 'recharts'
import { CalendarDays, TrendingUp, BarChart3, Calendar, Filter, Coins, Receipt, CreditCard, XCircle } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

type TimeRange = '7d' | '14d' | '30d' | '6m' | '12m' | 'year'

const RANGE_LABELS: { value: TimeRange; label: string }[] = [
    { value: '7d', label: '7 วัน' },
    { value: '14d', label: '14 วัน' },
    { value: '30d', label: '30 วัน' },
    { value: '6m', label: '6 เดือน' },
    { value: '12m', label: '12 เดือน' },
    { value: 'year', label: 'ปี' },
]

const STATUS_COLORS: Record<string, string> = {
    Booking: '#3b82f6',
    Inprogress: '#f59e0b',
    Completed: '#10b981',
    Canceled: '#ef4444',
}

const THAI_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

const DashboardPage: React.FC = () => {
    const dispatch = useAppDispatch()
    const { data: bookings, loading } = useAppSelector((s) => s.book)
    const [range, setRange] = useState<TimeRange>('30d')
    const { theme } = useTheme()
    const isDark = theme === 'dark'

    // Date range filter
    const [dateFrom, setDateFrom] = useState('')
    const [dateTo, setDateTo] = useState('')

    useEffect(() => {
        dispatch(bookGet())
        dispatch(fetchMasterData())
    }, [dispatch])

    // ========== Filtered bookings by date range ==========
    const filteredBookings = useMemo(() => {
        if (!dateFrom && !dateTo) return bookings
        return bookings.filter(b => {
            if (!b.Date) return false
            if (dateFrom && b.Date < dateFrom) return false
            if (dateTo && b.Date > dateTo) return false
            return true
        })
    }, [bookings, dateFrom, dateTo])

    const handleClearFilter = () => {
        setDateFrom('')
        setDateTo('')
    }

    // ========== KPI ==========
    const kpis = useMemo(() => {
        const total = filteredBookings.length
        const revenue = filteredBookings.reduce((s, b) => s + (b.Summary || 0), 0)
        const uniqueMonths = new Set(filteredBookings.map(b => b.Date ? b.Date.substring(0, 7) : "").filter(Boolean))
        const monthsCount = uniqueMonths.size || 1
        const avgMonthlyRevenue = revenue / monthsCount
        const tax = filteredBookings.reduce((s, b) => s + (b.Tax || 0), 0)
        const avgRevenuePerBooking = total > 0 ? revenue / total : 0
        const canceledCount = filteredBookings.filter(b => b.Status === 'Canceled').length
        const cancellationRate = total > 0 ? (canceledCount / total) * 100 : 0

        // เปรียบเทียบ เดือนนี้ vs เดือนที่แล้ว (ไม่ขึ้นกับ date filter)
        const now = new Date()
        const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const prevMonthStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`

        const thisMonthBookings = bookings.filter(b => b.Date?.startsWith(thisMonthStr))
        const prevMonthBookings = bookings.filter(b => b.Date?.startsWith(prevMonthStr))

        const thisRevenue = thisMonthBookings.reduce((s, b) => s + (b.Summary || 0), 0)
        const prevRevenue = prevMonthBookings.reduce((s, b) => s + (b.Summary || 0), 0)

        const calcChange = (curr: number, prev: number) =>
            prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100

        return {
            total, revenue, avgMonthlyRevenue, tax, avgRevenuePerBooking, cancellationRate,
            changes: {
                total: calcChange(thisMonthBookings.length, prevMonthBookings.length),
                revenue: calcChange(thisRevenue, prevRevenue),
            }
        }
    }, [filteredBookings, bookings])

    // ========== Upcoming Bookings (7 วันข้างหน้า) ==========
    const upcomingBookings = useMemo(() => {
        const now = new Date()
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        const futureDate = new Date(now)
        futureDate.setDate(futureDate.getDate() + 7)
        const futureDateStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`

        return bookings
            .filter(b => b.Date && b.Date >= todayStr && b.Date <= futureDateStr && b.Status !== 'Canceled')
            .sort((a, b) => {
                if (a.Date !== b.Date) return a.Date!.localeCompare(b.Date!)
                return (a.StartTime || '').localeCompare(b.StartTime || '')
            })
    }, [bookings])


    // ========== Revenue Trend ==========
    const trendData = useMemo(() => {
        const now = new Date()
        let filtered = [...filteredBookings]
        let groupFn: (dateStr: string) => string

        if (range === '7d' || range === '14d' || range === '30d') {
            const days = range === '7d' ? 7 : range === '14d' ? 14 : 30
            const cutoff = new Date(now)
            cutoff.setDate(cutoff.getDate() - days)
            // เปรียบเทียบเป็น string YYYY-MM-DD (local) แทน Date object (UTC)
            const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`
            filtered = filtered.filter(b => b.Date && b.Date >= cutoffStr)
            groupFn = (dateStr: string) => {
                const d = new Date(dateStr + 'T00:00:00')
                return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]}`
            }
        } else if (range === '6m' || range === '12m') {
            const months = range === '6m' ? 6 : 12
            const cutoff = new Date(now)
            cutoff.setMonth(cutoff.getMonth() - months)
            const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}-${String(cutoff.getDate()).padStart(2, '0')}`
            filtered = filtered.filter(b => b.Date && b.Date >= cutoffStr)
            groupFn = (dateStr: string) => {
                const d = new Date(dateStr + 'T00:00:00')
                return `${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543 - 2500}`
            }
        } else {
            groupFn = (dateStr: string) => {
                const d = new Date(dateStr + 'T00:00:00')
                return `${d.getFullYear()}`
            }
        }

        const map = new Map<string, { label: string; revenue: number; tax: number; sortKey: string }>()
        filtered.forEach(b => {
            if (!b.Date) return
            const label = groupFn(b.Date)
            const existing = map.get(label) || { label, revenue: 0, tax: 0, sortKey: b.Date }
            existing.revenue += (b.Summary || 0)
            existing.tax += (b.Tax || 0)
            if (b.Date < existing.sortKey) existing.sortKey = b.Date
            map.set(label, existing)
        })

        return Array.from(map.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    }, [filteredBookings, range])

    // ========== Status Pie ==========
    const statusData = useMemo(() => {
        const counts: Record<string, number> = { Booking: 0, Inprogress: 0, Completed: 0, Canceled: 0 }
        filteredBookings.forEach(b => {
            if (b.Status && counts[b.Status] !== undefined) counts[b.Status]++
        })
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
    }, [filteredBookings])

    const totalStatusCount = useMemo(() => statusData.reduce((s, d) => s + d.value, 0), [statusData])

    const dailyData = useMemo(() => {
        const now = new Date()
        const days: { label: string; count: number; sortKey: string }[] = []
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now)
            d.setDate(d.getDate() - i)
            // ใช้ local date (ไม่ใช่ UTC) เพื่อให้ตรงกับ Date ที่บันทึกในฐานข้อมูล
            const y = d.getFullYear()
            const m = String(d.getMonth() + 1).padStart(2, '0')
            const day = String(d.getDate()).padStart(2, '0')
            const key = `${y}-${m}-${day}`
            const label = `${d.getDate()} ${THAI_MONTHS[d.getMonth()]}`
            const count = filteredBookings.filter(b => b.Date === key).length
            days.push({ label, count, sortKey: key })
        }
        return days
    }, [filteredBookings])

    // ========== Top Customers ==========
    const topCustomers = useMemo(() => {
        const map = new Map<string, { count: number, revenue: number }>()
        filteredBookings.forEach(b => {
            const name = b.CustomerMaster?.CustomerName || 'ไม่ระบุ'
            const existing = map.get(name) || { count: 0, revenue: 0 }
            existing.count += 1
            existing.revenue += (b.Summary || 0)
            map.set(name, existing)
        })
        return Array.from(map.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
    }, [filteredBookings])

    // ========== Top Job Types ==========
    const topJobTypes = useMemo(() => {
        const map = new Map<string, { count: number, revenue: number }>()
        filteredBookings.forEach(b => {
            const name = b.JobTypeMaster?.TypeName || 'ไม่ระบุ'
            const existing = map.get(name) || { count: 0, revenue: 0 }
            existing.count += 1
            existing.revenue += (b.Summary || 0)
            map.set(name, existing)
        })
        return Array.from(map.entries())
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 5)
            .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
    }, [filteredBookings])

    // ========== Top Locations ==========
    const topLocations = useMemo(() => {
        const map = new Map<string, { count: number, revenue: number }>()
        filteredBookings.forEach(b => {
            const name = b.LocationMaster?.LocationName || 'ไม่ระบุ'
            const existing = map.get(name) || { count: 0, revenue: 0 }
            existing.count += 1
            existing.revenue += (b.Summary || 0)
            map.set(name, existing)
        })
        return Array.from(map.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5)
            .map(([name, data]) => ({ name, count: data.count, revenue: data.revenue }))
    }, [filteredBookings])

    // ========== Tooltip Style ==========
    const tooltipStyle = {
        backgroundColor: isDark ? '#1a1a1a' : '#fff',
        border: `1px solid ${isDark ? '#2a2a2a' : '#e5e5e5'}`,
        borderRadius: '8px',
        color: isDark ? '#ececf1' : '#0d0d0d',
        fontSize: '13px',
    }

    // ========== Render ==========
    if (loading && bookings.length === 0) {
        return (
            <div className="min-h-dvh bg-white dark:bg-[#0d0d0d]">
                <Navbars />
                <div className="flex flex-col items-center justify-center py-32">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-[#6e6e80] dark:text-[#8e8ea0] animate-pulse">กำลังโหลดข้อมูล Dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-dvh bg-white dark:bg-[#0d0d0d] transition-colors duration-200">
            <Navbars />

            {/* Page Header */}
            <div className="border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
                <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
                    <div className="flex items-start gap-4">
                        <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f7f7f8] dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a]">
                            <BarChart3 className="h-6 w-6 text-[#0d0d0d] dark:text-[#ececf1]" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-semibold text-[#0d0d0d] dark:text-[#ececf1] tracking-tight">
                                Dashboard
                            </h1>
                            <p className="mt-1 text-[#6e6e80] dark:text-[#8e8ea0] text-sm">
                                ภาพรวมข้อมูลการจองและแนวโน้มรายได้
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6">

                {/* ===== Date Range Filter ===== */}
                <div className="rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] p-4 sm:p-5 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0] shrink-0">
                            <Filter className="w-4 h-4" />
                            กรองตามวันที่
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 flex-1">
                            <div className="w-full sm:w-auto">
                                <label className="block text-xs text-[#6e6e80] dark:text-[#8e8ea0] mb-1">ตั้งแต่</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className="h-4 w-4 text-[#acacbe] dark:text-[#6e6e80]" />
                                    </div>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="block w-full sm:w-44 h-10 pl-9 pr-3 rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#0d0d0d] text-sm text-[#0d0d0d] dark:text-[#ececf1] outline-none hover:border-[#c5c5d2] dark:hover:border-[#444654] focus:border-[#0d0d0d] dark:focus:border-[#ececf1] transition-all"
                                    />
                                </div>
                            </div>
                            <span className="hidden sm:block text-[#6e6e80] dark:text-[#8e8ea0] pb-2">—</span>
                            <div className="w-full sm:w-auto">
                                <label className="block text-xs text-[#6e6e80] dark:text-[#8e8ea0] mb-1">ถึง</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className="h-4 w-4 text-[#acacbe] dark:text-[#6e6e80]" />
                                    </div>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="block w-full sm:w-44 h-10 pl-9 pr-3 rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#0d0d0d] text-sm text-[#0d0d0d] dark:text-[#ececf1] outline-none hover:border-[#c5c5d2] dark:hover:border-[#444654] focus:border-[#0d0d0d] dark:focus:border-[#ececf1] transition-all"
                                    />
                                </div>
                            </div>
                            {(dateFrom || dateTo) && (
                                <button
                                    onClick={handleClearFilter}
                                    className="px-4 h-10 rounded-lg text-xs font-medium bg-[#f7f7f8] dark:bg-[#2a2a2a] text-[#6e6e80] dark:text-[#8e8ea0] border border-[#e5e5e5] dark:border-[#2a2a2a] hover:bg-[#ececec] dark:hover:bg-[#353740] transition-colors"
                                >
                                    ล้างตัวกรอง
                                </button>
                            )}
                        </div>
                        {(dateFrom || dateTo) && (
                            <p className="text-xs text-[#6e6e80] dark:text-[#8e8ea0] sm:pb-2">
                                แสดง <span className="font-semibold text-[#0d0d0d] dark:text-[#ececf1]">{filteredBookings.length}</span> จาก {bookings.length} รายการ
                            </p>
                        )}
                    </div>
                </div>

                {/* ===== KPI Cards ===== */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <KpiCard icon={<CalendarDays className="w-5 h-5" />} label="การจองทั้งหมด" value={kpis.total.toLocaleString()} color="blue" change={kpis.changes.total} changeLabel="vs เดือนที่แล้ว" />
                    <KpiCard icon={<CreditCard className="w-5 h-5" />} label="เฉลี่ยต่องาน" value={`${kpis.avgRevenuePerBooking.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿`} color="blue" />
                    <KpiCard icon={<Coins className="w-5 h-5" />} label="เฉลี่ยต่อเดือน" value={`${kpis.avgMonthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿`} color="amber" />
                    <KpiCard icon={<TrendingUp className="w-5 h-5" />} label="รายได้รวม" value={`${kpis.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿`} color="emerald" change={kpis.changes.revenue} changeLabel="vs เดือนที่แล้ว" />
                    <KpiCard icon={<Receipt className="w-5 h-5" />} label="ภาษีรวม" value={`${kpis.tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿`} color="amber" />
                    <KpiCard icon={<XCircle className="w-5 h-5" />} label="อัตรายกเลิก" value={`${kpis.cancellationRate.toFixed(1)}%`} color={kpis.cancellationRate > 20 ? 'red' : kpis.cancellationRate > 10 ? 'amber' : 'emerald'} />
                </div>

                {/* ===== Upcoming Bookings Widget ===== */}
                <div className="rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#111111] p-5 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold text-[#0d0d0d] dark:text-[#ececf1]">
                            🗓️ การจองที่กำลังจะมาถึง (7 วัน)
                        </h2>
                        {upcomingBookings.length > 0 && (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                                {upcomingBookings.length} รายการ
                            </span>
                        )}
                    </div>
                    {upcomingBookings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <span className="text-3xl mb-2">📭</span>
                            <p className="text-sm text-[#6e6e80] dark:text-[#8e8ea0]">ไม่มีการจองในช่วง 7 วันข้างหน้า</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#e5e5e5] dark:divide-[#2a2a2a]">
                            {upcomingBookings.map((b) => {
                                const d = new Date((b.Date || '') + 'T00:00:00')
                                const now = new Date()
                                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
                                const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1)
                                const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
                                const dateLabel = b.Date === todayStr ? 'วันนี้' : b.Date === tomorrowStr ? 'พรุ่งนี้' : `${d.getDate()} ${THAI_MONTHS[d.getMonth()]}`
                                const isToday = b.Date === todayStr
                                const statusColors: Record<string, string> = {
                                    Booking: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
                                    Inprogress: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
                                    Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
                                }
                                return (
                                    <div key={b.ID} className={`flex items-center gap-4 py-3 ${isToday ? 'bg-blue-50/50 dark:bg-blue-500/5 -mx-5 px-5' : ''}`}>
                                        <div className={`shrink-0 text-center w-12 ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-[#6e6e80] dark:text-[#8e8ea0]'}`}>
                                            <p className="text-[10px] font-semibold uppercase tracking-wide">{isToday ? '🔴 วันนี้' : dateLabel}</p>
                                            <p className="text-sm font-bold mt-0.5">{b.StartTime?.slice(0, 5)}</p>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-[#0d0d0d] dark:text-[#ececf1] truncate">
                                                {b.CustomerMaster?.CustomerName || 'ไม่ระบุลูกค้า'}
                                            </p>
                                            <p className="text-xs text-[#6e6e80] dark:text-[#8e8ea0] truncate">
                                                {b.JobTypeMaster?.TypeName || '-'} · {b.LocationMaster?.LocationName || '-'} · {b.StartTime?.slice(0, 5)}–{b.EndTime?.slice(0, 5)}
                                            </p>
                                        </div>
                                        <div className="shrink-0 flex flex-col items-end gap-1">
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColors[b.Status || 'Booking']}`}>
                                                {b.Status}
                                            </span>
                                            <span className="text-xs font-medium text-[#0d0d0d] dark:text-[#ececf1]">
                                                {(b.Summary || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ฿
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* ===== Revenue Trend ===== */}
                <div className="rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#111111] p-5 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                        <h2 className="text-base font-semibold text-[#0d0d0d] dark:text-[#ececf1]">
                            📈 แนวโน้มรายได้
                        </h2>
                        <div className="flex flex-wrap gap-1.5">
                            {RANGE_LABELS.map(r => (
                                <button
                                    key={r.value}
                                    onClick={() => setRange(r.value)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${range === r.value
                                        ? 'bg-[#0d0d0d] dark:bg-[#ececf1] text-white dark:text-[#0d0d0d]'
                                        : 'bg-[#f7f7f8] dark:bg-[#1a1a1a] text-[#6e6e80] dark:text-[#8e8ea0] hover:bg-[#ececec] dark:hover:bg-[#2a2a2a] border border-[#e5e5e5] dark:border-[#2a2a2a]'
                                        }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="h-72 sm:h-80 min-w-0 overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradTax" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2a2a2a' : '#e5e5e5'} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: isDark ? '#8e8ea0' : '#6e6e80' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: isDark ? '#8e8ea0' : '#6e6e80' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
                                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' บาท', name === 'revenue' ? 'รายได้' : 'ภาษี']} />
                                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#gradRevenue)" name="revenue" />
                                <Area type="monotone" dataKey="tax" stroke="#f59e0b" strokeWidth={2} fill="url(#gradTax)" name="tax" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ===== Row: Status Pie + Daily Bar ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Status Donut — no inline labels, use legend below */}
                    <div className="rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#111111] p-5 transition-colors">
                        <h2 className="text-base font-semibold text-[#0d0d0d] dark:text-[#ececf1] mb-4">
                            🍩 สัดส่วนสถานะการจอง
                        </h2>
                        <div className="h-56 flex items-center justify-center min-w-0 overflow-hidden">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={4}
                                        dataKey="value"
                                        label={false}
                                    >
                                        {statusData.map((entry) => (
                                            <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#6e6e80'} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [value + ' รายการ', String(name)]} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Legend as styled cards */}
                        <div className="grid grid-cols-2 gap-2 mt-3">
                            {statusData.map(s => {
                                const pct = totalStatusCount > 0 ? ((s.value / totalStatusCount) * 100).toFixed(0) : '0'
                                return (
                                    <div key={s.name} className="flex items-center gap-2.5 rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] p-2.5 bg-[#fafafa] dark:bg-[#0d0d0d]">
                                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[s.name] }} />
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-[#0d0d0d] dark:text-[#ececf1] truncate">{s.name}</p>
                                            <p className="text-[10px] text-[#6e6e80] dark:text-[#8e8ea0]">{s.value} รายการ ({pct}%)</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Daily Bookings */}
                    <div className="rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#111111] p-5 transition-colors">
                        <h2 className="text-base font-semibold text-[#0d0d0d] dark:text-[#ececf1] mb-4">
                            📊 จำนวนการจองรายวัน (7 วันล่าสุด)
                        </h2>
                        <div className="h-64 min-w-0 overflow-hidden">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#2a2a2a' : '#e5e5e5'} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: isDark ? '#8e8ea0' : '#6e6e80' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: isDark ? '#8e8ea0' : '#6e6e80' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => [value + ' รายการ', 'จำนวน']} />
                                    <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* ===== Row: Top Customers + Top Job Types ===== */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Customers */}
                    <div className="rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#111111] p-5 transition-colors">
                        <h2 className="text-base font-semibold text-[#0d0d0d] dark:text-[#ececf1] mb-4">
                            👥 ลูกค้ายอดนิยม (Top 5)
                        </h2>
                        <div className="space-y-3">
                            {topCustomers.length === 0 ? (
                                <p className="text-sm text-[#6e6e80] dark:text-[#8e8ea0] text-center py-4">ไม่มีข้อมูล</p>
                            ) : topCustomers.map((c, i) => {
                                const maxCount = topCustomers[0]?.count || 1
                                const pct = (c.count / maxCount) * 100
                                return (
                                    <div key={c.name}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-[#0d0d0d] dark:text-[#ececf1] flex items-center gap-2">
                                                <span className="text-xs font-bold text-[#6e6e80] dark:text-[#8e8ea0] w-5">#{i + 1}</span>
                                                {c.name}
                                            </span>
                                            <div className="text-right">
                                                <span className="text-[#0d0d0d] dark:text-[#ececf1] text-xs block font-medium">
                                                    {c.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
                                                </span>
                                                <span className="text-[#6e6e80] dark:text-[#8e8ea0] text-[10px]">
                                                    {c.count} รายการ
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-full h-2.5 rounded-full bg-[#f7f7f8] dark:bg-[#1a1a1a] overflow-hidden">
                                            <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Top Job Types */}
                    <div className="rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#111111] p-5 transition-colors">
                        <h2 className="text-base font-semibold text-[#0d0d0d] dark:text-[#ececf1] mb-4">
                            💼 ประเภทงานยอดนิยม (Top 5)
                        </h2>
                        <div className="space-y-3">
                            {topJobTypes.length === 0 ? (
                                <p className="text-sm text-[#6e6e80] dark:text-[#8e8ea0] text-center py-4">ไม่มีข้อมูล</p>
                            ) : topJobTypes.map((j, i) => {
                                const maxRev = topJobTypes[0]?.revenue || 1
                                const pct = (j.revenue / maxRev) * 100
                                return (
                                    <div key={j.name}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-[#0d0d0d] dark:text-[#ececf1] flex items-center gap-2">
                                                <span className="text-xs font-bold text-[#6e6e80] dark:text-[#8e8ea0] w-5">#{i + 1}</span>
                                                {j.name}
                                            </span>
                                            <div className="text-right">
                                                <span className="text-[#0d0d0d] dark:text-[#ececf1] text-xs block font-medium">
                                                    {j.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
                                                </span>
                                                <span className="text-[#6e6e80] dark:text-[#8e8ea0] text-[10px]">
                                                    {j.count} รายการ
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-full h-2.5 rounded-full bg-[#f7f7f8] dark:bg-[#1a1a1a] overflow-hidden">
                                            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* ===== Top Locations ===== */}
                <div className="rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#111111] p-5 transition-colors">
                    <h2 className="text-base font-semibold text-[#0d0d0d] dark:text-[#ececf1] mb-4">
                        📍 สถานที่ยอดนิยม (Top 5)
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3">
                        {topLocations.length === 0 ? (
                            <p className="text-sm text-[#6e6e80] dark:text-[#8e8ea0] text-center py-4 col-span-2">ไม่มีข้อมูล</p>
                        ) : topLocations.map((l, i) => {
                            const maxCount = topLocations[0]?.count || 1
                            const pct = (l.count / maxCount) * 100
                            return (
                                <div key={l.name}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-[#0d0d0d] dark:text-[#ececf1] flex items-center gap-2">
                                            <span className="text-xs font-bold text-[#6e6e80] dark:text-[#8e8ea0] w-5">#{i + 1}</span>
                                            {l.name}
                                        </span>
                                        <div className="text-right">
                                            <span className="text-[#0d0d0d] dark:text-[#ececf1] text-xs block font-medium">
                                                {l.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ฿
                                            </span>
                                            <span className="text-[#6e6e80] dark:text-[#8e8ea0] text-[10px]">
                                                {l.count} รายการ
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full h-2.5 rounded-full bg-[#f7f7f8] dark:bg-[#1a1a1a] overflow-hidden">
                                        <div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </main>
        </div>
    )
}

// ========== KPI Card Component ==========
const colorMap: Record<string, string> = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
    green: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
    red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20',
}

function KpiCard({
    icon, label, value, color, change, changeLabel
}: {
    icon: React.ReactNode; label: string; value: string; color: string;
    change?: number; changeLabel?: string
}) {
    const isPositive = (change ?? 0) >= 0
    return (
        <div className="rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#111111] p-4 sm:p-5 transition-colors">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg border ${colorMap[color] || colorMap.blue}`}>
                    {icon}
                </div>
                {change !== undefined && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${isPositive
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                        }`}>
                        {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(0)}%
                    </span>
                )}
            </div>
            <p className="text-xs font-medium text-[#6e6e80] dark:text-[#8e8ea0] uppercase tracking-wider mb-1">{label}</p>
            <p className="text-xl sm:text-2xl font-bold text-[#0d0d0d] dark:text-[#ececf1] tracking-tight truncate min-w-0" title={value}>{value}</p>
            {changeLabel && change !== undefined && (
                <p className="text-[10px] text-[#6e6e80] dark:text-[#8e8ea0] mt-1">{changeLabel}</p>
            )}
        </div>
    )
}

export default DashboardPage
