import React, { useState } from 'react';
import {
    X, Calendar, Clock, MapPin, User, Briefcase, Activity
} from 'lucide-react';
import CustomButton from './CustomButton';
import CustomInput from './CustomInput';
import SearchableSelect from './SearchableSelect';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    id: i.toString().padStart(2, '0'),
    label: i.toString().padStart(2, '0')
}));

const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    id: i.toString().padStart(2, '0'),
    label: i.toString().padStart(2, '0')
}));

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
    // Form state mockups
    const [jobType, setJobType] = useState<string | number>('');
    const [customer, setCustomer] = useState<string | number>('');
    const [location, setLocation] = useState<string | number>('');
    const [date, setDate] = useState('');

    // Split Time States
    const [startHour, setStartHour] = useState('00');
    const [startMinute, setStartMinute] = useState('00');
    const [endHour, setEndHour] = useState('00');
    const [endMinute, setEndMinute] = useState('00');

    const [price, setPrice] = useState('');
    const [tax, setTax] = useState('');
    const [summary, setSummary] = useState('');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<string | number>('Booking');

    // Mock Options
    const jobOptions = [
        { id: 1, label: 'งานทำความสะอาด' },
        { id: 2, label: 'งานซ่อมบำรุง' },
        { id: 3, label: 'งานดูแลระบบ' }
    ];
    const customerOptions = [
        { id: 1, label: 'ลูกค้า ก (SCG)' },
        { id: 2, label: 'ลูกค้า ข (PTT)' },
        { id: 3, label: 'ลูกค้า ค (บุคคลทั่วไป)' }
    ];
    const locationOptions = [
        { id: 1, label: 'อาคาร A' },
        { id: 2, label: 'อาคาร B' },
        { id: 3, label: 'ห้องโถงกลาง' }
    ];
    const statusOptions = [
        { id: 'Booking', label: 'Booking (จอง)' },
        { id: 'Inprogress', label: 'กำลังดำเนินการ' },
        { id: 'Completed', label: 'เสร็จสิ้น' },
        { id: 'Canceled', label: 'ยกเลิก' }
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            {/* Modal Container */}
            <div
                className="relative w-full max-w-2xl bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] flex flex-col my-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
                    <div>
                        <h2 className="text-lg font-semibold text-[#0d0d0d] dark:text-[#ececf1]">เพิ่มรายการจอง (New Booking)</h2>
                        <p className="text-sm text-[#6e6e80] dark:text-[#8e8ea0] mt-1">กรอกข้อมูลรายละเอียดการจองด้านล่าง</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-[#6e6e80] dark:text-[#8e8ea0] hover:bg-[#f7f7f8] dark:hover:bg-[#2a2a2a] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body / Scrollable Content */}
                <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Row 1 */}
                        <div className="md:col-span-2">
                            <SearchableSelect
                                label="ประเภทงาน"
                                icon={<Briefcase className="w-4 h-4" />}
                                options={jobOptions}
                                value={jobType}
                                onChange={setJobType}
                                placeholder="ค้นหาและเลือกประเภทงาน..."
                            />
                        </div>

                        {/* Row 2 */}
                        <div className="col-span-1">
                            <SearchableSelect
                                label="ลูกค้า"
                                icon={<User className="w-4 h-4" />}
                                options={customerOptions}
                                value={customer}
                                onChange={setCustomer}
                                placeholder="ค้นหาและเลือกชื่อลูกค้า..."
                            />
                        </div>
                        <div className="col-span-1">
                            <SearchableSelect
                                label="สถานที่"
                                icon={<MapPin className="w-4 h-4" />}
                                options={locationOptions}
                                value={location}
                                onChange={setLocation}
                                placeholder="ค้นหาและเลือกสถานที่..."
                            />
                        </div>

                        {/* Row 3 - Dates and Times */}
                        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="w-full">
                                <label className="block text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0] mb-1.5">
                                    วันที่
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Calendar className="h-4 w-4 text-[#acacbe] dark:text-[#6e6e80]" />
                                    </div>
                                    <input
                                        type="date"
                                        className="block w-full h-[42px] pl-10 pr-3 rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] text-sm text-[#0d0d0d] dark:text-[#ececf1] outline-none transition-all hover:border-[#c5c5d2] dark:hover:border-[#444654] focus:border-[#0d0d0d] dark:focus:border-[#ececf1] focus:ring-1 focus:ring-[#0d0d0d]/10 dark:focus:ring-[#ececf1]/10"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="w-full">
                                <label className="block text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0] mb-1.5 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> เวลาเริ่ม
                                </label>
                                <div className="flex items-center gap-1.5">
                                    <div className="flex-1">
                                        <SearchableSelect
                                            label=""
                                            options={hourOptions}
                                            value={startHour}
                                            onChange={(val) => setStartHour(val as string)}
                                            placeholder="HH"
                                        />
                                    </div>
                                    <span className="text-[#0d0d0d] dark:text-[#ececf1] font-bold pb-1">:</span>
                                    <div className="flex-1">
                                        <SearchableSelect
                                            label=""
                                            options={minuteOptions}
                                            value={startMinute}
                                            onChange={(val) => setStartMinute(val as string)}
                                            placeholder="mm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="w-full">
                                <label className="block text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0] mb-1.5 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> สิ้นสุดเวลา
                                </label>
                                <div className="flex items-center gap-1.5">
                                    <div className="flex-1">
                                        <SearchableSelect
                                            label=""
                                            options={hourOptions}
                                            value={endHour}
                                            onChange={(val) => setEndHour(val as string)}
                                            placeholder="HH"
                                        />
                                    </div>
                                    <span className="text-[#0d0d0d] dark:text-[#ececf1] font-bold pb-1">:</span>
                                    <div className="flex-1">
                                        <SearchableSelect
                                            label=""
                                            options={minuteOptions}
                                            value={endMinute}
                                            onChange={(val) => setEndMinute(val as string)}
                                            placeholder="mm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Row 4 - Pricing */}
                        <div className="col-span-1">
                            <CustomInput
                                label="ราคา"
                                type="number"
                                placeholder="0.00"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                        <div className="col-span-1">
                            <CustomInput
                                label="ภาษี"
                                type="number"
                                placeholder="0.00"
                                value={tax}
                                onChange={(e) => setTax(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <CustomInput
                                label="ราคารวม"
                                type="number"
                                placeholder="0.00"
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                            />
                        </div>

                        {/* Row 5 - Status */}
                        <div className="md:col-span-2">
                            <SearchableSelect
                                label="สถานะ (Status)"
                                icon={<Activity className="w-4 h-4" />}
                                options={statusOptions}
                                value={status}
                                onChange={setStatus}
                                placeholder="ค้นหาและเลือกสถานะ..."
                            />
                        </div>

                        {/* Row 6 - Notes */}
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="block text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0]">
                                รายละเอียดเพิ่มเติม
                            </label>
                            <textarea
                                rows={3}
                                className="block w-full rounded-lg border p-3 text-sm outline-none transition-all bg-white dark:bg-[#1a1a1a] text-[#0d0d0d] dark:text-[#ececf1] placeholder:text-[#acacbe] dark:placeholder:text-[#6e6e80] border-[#e5e5e5] dark:border-[#2a2a2a] hover:border-[#c5c5d2] dark:hover:border-[#444654] focus:border-[#0d0d0d] dark:focus:border-[#ececf1] focus:ring-1 focus:ring-[#0d0d0d]/10 dark:focus:ring-[#ececf1]/10 resize-none"
                                placeholder="กรอกรายละเอียดเพิ่มเติมหรือหมายเหตุ..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="p-5 border-t border-[#e5e5e5] dark:border-[#2a2a2a] flex items-center justify-end gap-3 bg-[#f7f7f8] dark:bg-[#1a1a1a] rounded-b-xl">
                    <CustomButton
                        variant="secondary"
                        onClick={onClose}
                    >
                        ยกเลิก
                    </CustomButton>
                    <CustomButton
                        onClick={() => {
                            console.log("บันทึกรายการจอง", {
                                jobType, customer, location, date,
                                startTime: `${startHour}:${startMinute}`,
                                endTime: `${endHour}:${endMinute}`,
                                price, tax, summary, notes, status
                            });
                            onClose();
                        }}
                        className="px-6"
                    >
                        บันทึกรายการจอง
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
