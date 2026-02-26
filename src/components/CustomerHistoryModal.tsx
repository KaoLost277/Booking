import React, { useEffect, useState } from 'react';
import { X, Calendar, Clock, Activity } from 'lucide-react';
import { createClient } from '../lib/client';
import type { Booking, CustomerMaster } from '../types/booking';
import CustomButton from './CustomButton';

const supabase = createClient();

interface CustomerHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: CustomerMaster | null;
}

const CustomerHistoryModal: React.FC<CustomerHistoryModalProps> = ({ isOpen, onClose, customer }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !customer) return;

        const fetchHistory = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('BookingTable')
                    .select('*, JobTypeMaster(TypeName), LocationMaster(LocationName)')
                    .eq('CustomerID', customer.ID)
                    .order('Date', { ascending: false });

                if (error) throw error;
                setBookings(data as Booking[]);
            } catch (err) {
                console.error('Error fetching booking history:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [isOpen, customer]);

    if (!isOpen || !customer) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div
                className="relative w-full max-w-4xl bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] flex flex-col my-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
                    <div>
                        <h2 className="text-lg font-semibold text-[#0d0d0d] dark:text-[#ececf1]">
                            ประวัติการจองของลูกค้า
                        </h2>
                        <p className="text-sm text-[#6e6e80] dark:text-[#8e8ea0] mt-1">
                            {customer.CustomerName}
                        </p>
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
                <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    {loading ? (
                        <div className="text-center py-8 text-[#6e6e80] dark:text-[#8e8ea0] animate-pulse">
                            กำลังโหลดประวัติ...
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-8 text-[#6e6e80] dark:text-[#8e8ea0]">
                            ไม่พบประวัติการจองสำหรับลูกค้ารายนี้
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] transition-colors">
                                <table className="w-full text-sm">
                                    <thead className="bg-[#f7f7f8] dark:bg-[#1a1a1a] border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
                                        <tr>
                                            <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">วันที่ / เวลา</th>
                                            <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">ประเภทงาน</th>
                                            <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">สถานที่</th>
                                            <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">ยอดสุทธิ</th>
                                            <th className="p-4 text-center text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">สถานะ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#2a2a2a] bg-white dark:bg-[#0d0d0d]">
                                        {bookings.map((booking) => (
                                            <tr key={booking.ID} className="hover:bg-[#f7f7f8] dark:hover:bg-[#1a1a1a] transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5 text-sm text-[#0d0d0d] dark:text-[#ececf1] font-medium">
                                                            <Calendar className="w-3.5 h-3.5 text-[#6e6e80] dark:text-[#8e8ea0]" />
                                                            {booking.Date || '-'}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs text-[#6e6e80] dark:text-[#8e8ea0]">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {booking.StartTime?.slice(0, 5) || '-'} - {booking.EndTime?.slice(0, 5) || '-'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-[#0d0d0d] dark:text-[#ececf1]">
                                                    {booking.JobTypeMaster?.TypeName || '-'}
                                                </td>
                                                <td className="p-4 text-[#0d0d0d] dark:text-[#ececf1]">
                                                    {booking.LocationMaster?.LocationName || '-'}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5 font-medium text-[#0d0d0d] dark:text-[#ececf1]">
                                                        {booking.Summary?.toLocaleString() || '-'} บาท
                                                    </div>
                                                    <div className="text-xs text-[#6e6e80] dark:text-[#8e8ea0] mt-0.5">
                                                        (ราคา: {booking.Price?.toLocaleString() || '-'} บาท)
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${booking.Status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                                                        booking.Status === 'Booking' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                                                            booking.Status === 'Inprogress' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                                                                'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                                                        }`}>
                                                        <Activity className="w-3 h-3" />
                                                        {booking.Status || '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-3">
                                {bookings.map((booking) => (
                                    <div
                                        key={booking.ID}
                                        className="rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-4 bg-white dark:bg-[#1a1a1a] transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-medium text-[#0d0d0d] dark:text-[#ececf1]">{booking.JobTypeMaster?.TypeName || '-'}</p>
                                                <p className="text-sm text-[#6e6e80] dark:text-[#8e8ea0]">{booking.LocationMaster?.LocationName || '-'}</p>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${booking.Status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                                                booking.Status === 'Booking' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                                                    booking.Status === 'Inprogress' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                                                        'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                                                }`}>
                                                <Activity className="w-3 h-3" />
                                                {booking.Status || '-'}
                                            </span>
                                        </div>

                                        <div className="text-sm text-[#6e6e80] dark:text-[#8e8ea0] mb-3 space-y-1">
                                            <p className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="font-medium text-[#0d0d0d] dark:text-[#ececf1]">{booking.Date || '-'}</span>
                                            </p>
                                            <p className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span>{booking.StartTime?.slice(0, 5) || '-'} - {booking.EndTime?.slice(0, 5) || '-'}</span>
                                            </p>
                                            <p className="flex items-center gap-1.5 pt-1">
                                                <span className="font-semibold text-[#0d0d0d] dark:text-[#ececf1]">{booking.Summary?.toLocaleString() || '-'} บาท</span>
                                                <span className="text-xs text-[#6e6e80] dark:text-[#8e8ea0] ml-1">(ราคา {booking.Price?.toLocaleString() || '-'} บาท)</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-[#e5e5e5] dark:border-[#2a2a2a] flex items-center justify-between bg-[#f7f7f8] dark:bg-[#1a1a1a] rounded-b-xl">
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0]">ยอดรวมทั้งหมด:</span>
                        <span className="text-xl font-bold text-[#0d0d0d] dark:text-[#ececf1]">
                            {bookings.reduce((sum, b) => sum + (b.Summary || 0), 0).toLocaleString()}
                        </span>
                        <span className="text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0]">บาท</span>
                    </div>
                    <CustomButton type="button" variant="secondary" onClick={onClose}>
                        ปิดหน้าต่าง
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default CustomerHistoryModal;
