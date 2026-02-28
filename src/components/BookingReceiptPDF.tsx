import { forwardRef } from 'react';
import type { Booking } from '../types/booking';

interface BookingReceiptPDFProps {
    booking: Booking | null;
}

const BookingReceiptPDF = forwardRef<HTMLDivElement, BookingReceiptPDFProps>(({ booking }, ref) => {
    if (!booking) return null;

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '-';
        return timeStr.slice(0, 5) + ' น.';
    };

    return (
        <div
            ref={ref}
            className="bg-[#ffffff] text-[#000000] p-12 shrink-0 select-none"
            style={{ width: '794px', minHeight: '1123px', fontFamily: 'Sarabun, sans-serif' }}
        >
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-[#e2e8f0] pb-6 mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-[#0f172a] tracking-tight">BookingApps</h1>
                    <p className="text-sm text-[#64748b] mt-2">บริการจองคิวออนไลน์ 24 ชั่วโมง</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-semibold text-[#2563eb] tracking-wider">ใบยืนยันการจอง</h2>
                    <p className="text-sm text-[#475569] mt-1">รหัสอ้างอิง: BK-{String(booking.ID).padStart(5, '0')}</p>
                    <p className="text-sm text-[#475569]">วันที่พิมพ์: {formatDate(new Date().toISOString())}</p>
                </div>
            </div>

            {/* Content Row */}
            <div className="grid grid-cols-2 gap-12 mb-10">
                {/* Customer Info */}
                <div>
                    <h3 className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-3">ข้อมูลลูกค้า</h3>
                    <p className="text-lg font-medium text-[#1e293b]">{booking.CustomerMaster?.CustomerName || '-'}</p>
                    <p className="text-sm text-[#475569] mt-2 leading-relaxed">
                        ขอบคุณที่ใช้บริการ BookingApps<br />
                        หากมีข้อสงสัยติดต่อ 02-000-0000
                    </p>
                </div>

                {/* Booking Info */}
                <div className="bg-[#f8fafc] p-5 rounded-lg border border-[#f1f5f9]">
                    <h3 className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest mb-4">ข้อมูลการจอง</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-[#64748b]">วันที่จอง</span>
                            <span className="font-medium text-[#1e293b]">{formatDate(booking.Date || '')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#64748b]">เวลา</span>
                            <span className="font-medium text-[#1e293b]">{formatTime(booking.StartTime || '')} - {formatTime(booking.EndTime || '')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#64748b]">สถานที่</span>
                            <span className="font-medium text-[#1e293b]">{booking.LocationMaster?.LocationName || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#64748b]">สถานะ</span>
                            <span className="font-bold text-[#2563eb]">{booking.Status}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description Table */}
            <div className="border border-[#e2e8f0] rounded-lg overflow-hidden mb-8">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#f1f5f9] text-[#475569]">
                        <tr>
                            <th className="px-6 py-4 font-semibold w-16 text-center">#</th>
                            <th className="px-6 py-4 font-semibold">รายละเอียดงาน</th>
                            <th className="px-6 py-4 font-semibold text-right w-40">จำนวนเงิน (บาท)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                        <tr>
                            <td className="px-6 py-5 text-center text-[#64748b]">1</td>
                            <td className="px-6 py-5">
                                <p className="font-medium text-[#1e293b]">{booking.JobTypeMaster?.TypeName || 'บริการทั่วไป'}</p>
                                {booking.Notes && <p className="text-xs text-[#64748b] mt-1 break-words">หมายเหตุ: {booking.Notes}</p>}
                            </td>
                            <td className="px-6 py-5 text-right font-medium text-[#1e293b]">
                                {(booking.Price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end mb-16">
                <div className="w-72 bg-[#f8fafc] p-6 rounded-lg border border-[#e2e8f0]">
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-[#475569]">ราคา</span>
                            <span className="font-medium text-[#1e293b]">{(booking.Price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#475569]">ภาษีหัก ณ ที่จ่าย</span>
                            <span className="font-medium text-[#1e293b]">{(booking.Tax || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="h-px bg-[#e2e8f0] my-2"></div>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-[#1e293b]">ยอดสุทธิ (บาท)</span>
                            <span className="text-xl font-bold text-[#0f172a]">{(booking.Summary || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-8 border-t border-[#e2e8f0] text-[#64748b] text-sm">
                <p>เอกสารฉบับนี้ถูกสร้างขึ้นด้วยระบบอิเล็กทรอนิกส์</p>
                <p className="mt-1">BookingApps © {new Date().getFullYear()}</p>
            </div>
        </div>
    );
});

BookingReceiptPDF.displayName = 'BookingReceiptPDF';

export default BookingReceiptPDF;
