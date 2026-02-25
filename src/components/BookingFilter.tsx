import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Calendar, User, MapPin, ChevronDown, Check } from 'lucide-react';
import CustomButton from './CustomButton';

interface Option {
    id: string | number;
    label: string;
}

interface SearchableSelectProps {
    label: string;
    icon: React.ReactNode;
    options: Option[];
    value: string | number;
    onChange: (value: string | number) => void;
    placeholder: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    label,
    icon,
    options,
    value,
    onChange,
    placeholder
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = useMemo(() => {
        return options.filter(opt =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    const selectedLabel = options.find(opt => opt.id === value)?.label || '';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="w-full relative" ref={containerRef}>
            <label className="block text-xs font-medium text-[#6e6e80] dark:text-[#8e8ea0] uppercase tracking-wider mb-1.5 ml-0.5">
                {label}
            </label>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 w-full h-11 px-3 rounded-lg border bg-white dark:bg-[#1a1a1a] cursor-pointer transition-all duration-150 ${isOpen
                        ? 'border-[#0d0d0d] dark:border-[#ececf1] ring-1 ring-[#0d0d0d]/10 dark:ring-[#ececf1]/10'
                        : 'border-[#e5e5e5] dark:border-[#2a2a2a] hover:border-[#c5c5d2] dark:hover:border-[#444654]'
                    }`}
            >
                <span className="text-[#6e6e80] dark:text-[#8e8ea0] shrink-0">{icon}</span>
                <span className={`flex-1 text-sm truncate ${!selectedLabel ? 'text-[#acacbe] dark:text-[#6e6e80]' : 'text-[#0d0d0d] dark:text-[#ececf1]'}`}>
                    {selectedLabel || placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-[#acacbe] dark:text-[#6e6e80] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-[#1a1a1a] rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] shadow-lg dark:shadow-none overflow-hidden">
                    <div className="p-2 border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
                        <div className="flex items-center gap-2 px-2.5 bg-[#f7f7f8] dark:bg-[#2a2a2a] rounded-md border border-[#e5e5e5] dark:border-[#353740]">
                            <Search className="w-4 h-4 text-[#acacbe] dark:text-[#6e6e80] shrink-0" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="ค้นหา..."
                                className="w-full h-9 bg-transparent text-sm text-[#0d0d0d] dark:text-[#ececf1] outline-none placeholder:text-[#acacbe] dark:placeholder:text-[#6e6e80]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <div
                                    key={opt.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChange(opt.id);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${value === opt.id
                                            ? 'bg-[#f7f7f8] dark:bg-[#2a2a2a] text-[#0d0d0d] dark:text-[#ececf1] font-medium'
                                            : 'text-[#6e6e80] dark:text-[#8e8ea0] hover:bg-[#f7f7f8] dark:hover:bg-[#2a2a2a] hover:text-[#0d0d0d] dark:hover:text-[#ececf1]'
                                        }`}
                                >
                                    {opt.label}
                                    {value === opt.id && <Check className="w-4 h-4 shrink-0" />}
                                </div>
                            ))
                        ) : (
                            <div className="px-3 py-6 text-center text-sm text-[#acacbe] dark:text-[#6e6e80]">
                                ไม่พบข้อมูลที่ค้นหา
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const BookingFilter: React.FC = () => {
    const [date, setDate] = useState('');
    const [customer, setCustomer] = useState<string | number>('');
    const [location, setLocation] = useState<string | number>('');
    const [status, setStatus] = useState<string | number>('');
    const [isExpanded, setIsExpanded] = useState(true);

    const customerOptions = [
        { id: 1, label: 'ลูกค้าทั่วไป' },
        { id: 2, label: 'บริษัท เอสซีจี' },
        { id: 3, label: 'ปตท. จำกัด' },
    ];

    const locationOptions = [
        { id: 1, label: 'ห้องประชุม A' },
        { id: 2, label: 'ห้องประชุม B' },
        { id: 3, label: 'ห้องโถงกลาง' },
    ];

    const statusOptions = [
        { id: 'Booking', label: 'จองแล้ว' },
        { id: 'Inprogress', label: 'กำลังดำเนินการ' },
        { id: 'Completed', label: 'เสร็จสิ้น' },
        { id: 'Canceled', label: 'ยกเลิก' },
    ];

    const handleSearch = () => {
        console.log('Searching for:', { date, customer, location, status });
    };

    return (
        <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] transition-colors">
            {/* Header / Mobile Toggle */}
            <div
                className="flex items-center justify-between p-4 lg:hidden cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <div className="bg-[#f7f7f8] dark:bg-[#2a2a2a] p-1.5 rounded-lg text-[#0d0d0d] dark:text-[#ececf1] border border-[#e5e5e5] dark:border-[#353740]">
                        <Search className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-[#0d0d0d] dark:text-[#ececf1] text-sm">ตัวช่วยค้นหา</span>
                </div>
                <div className={`p-1 rounded-full hover:bg-[#f7f7f8] dark:hover:bg-[#2a2a2a] transition-all duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-[#6e6e80] dark:text-[#8e8ea0]" />
                </div>
            </div>

            {/* Filter Body */}
            <div className={`${isExpanded ? 'block' : 'hidden'} lg:block p-5 pt-0 lg:pt-5`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-end gap-4">
                    {/* Date Filter */}
                    <div className="w-full">
                        <label className="block text-xs font-medium text-[#6e6e80] dark:text-[#8e8ea0] uppercase tracking-wider mb-1.5 ml-0.5">
                            วันที่การจอง
                        </label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Calendar className="h-5 w-5 text-[#acacbe] dark:text-[#6e6e80] group-hover:text-[#6e6e80] dark:group-hover:text-[#8e8ea0] transition-colors" />
                            </div>
                            <input
                                type="date"
                                className="block w-full h-11 pl-10 pr-3 rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] text-sm text-[#0d0d0d] dark:text-[#ececf1] outline-none transition-all hover:border-[#c5c5d2] dark:hover:border-[#444654] focus:border-[#0d0d0d] dark:focus:border-[#ececf1] focus:ring-1 focus:ring-[#0d0d0d]/10 dark:focus:ring-[#ececf1]/10"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <SearchableSelect
                        label="ลูกค้า"
                        icon={<User className="w-5 h-5" />}
                        options={customerOptions}
                        value={customer}
                        onChange={setCustomer}
                        placeholder="เลือกชื่อลูกค้า..."
                    />

                    <SearchableSelect
                        label="สถานที่"
                        icon={<MapPin className="w-5 h-5" />}
                        options={locationOptions}
                        value={location}
                        onChange={setLocation}
                        placeholder="เลือกสถานที่..."
                    />

                    <SearchableSelect
                        label="สถานะ"
                        icon={<Check className="w-5 h-5" />}
                        options={statusOptions}
                        value={status}
                        onChange={setStatus}
                        placeholder="เลือกสถานะ..."
                    />
                </div>

                {/* Action Buttons */}
                <div className="mt-5 flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#e5e5e5] dark:border-[#2a2a2a]">
                    <CustomButton
                        variant="secondary"
                        className="w-full sm:w-max min-w-[120px]"
                        onClick={() => {
                            setDate('');
                            setCustomer('');
                            setLocation('');
                            setStatus('');
                        }}
                    >
                        ล้างค่า
                    </CustomButton>

                    <CustomButton
                        className="w-full sm:w-max min-w-[140px]"
                        onClick={handleSearch}
                    >
                        <Search className="w-4 h-4" />
                        ค้นหาข้อมูล
                    </CustomButton>
                </div>
            </div>
        </div>
    );
};

export default BookingFilter;
