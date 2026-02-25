import { useState } from 'react';
import { Search, Calendar, User, MapPin, ChevronDown, Check, Plus } from 'lucide-react';
import CustomButton from './CustomButton';
import SearchableSelect from './SearchableSelect';
import { useAppSelector } from '../hooks';

const BookingFilter: React.FC = () => {
    const [date, setDate] = useState('');
    const [customer, setCustomer] = useState<string | number>('');
    const [location, setLocation] = useState<string | number>('');
    const [status, setStatus] = useState<string | number>('');
    const [isExpanded, setIsExpanded] = useState(true);


    const { customers, locations, statusOptions } = useAppSelector((state) => state.masterData);

    const customerOptions = customers.map((c) => ({
        id: c.ID,
        label: c.CustomerName
    }));

    const locationOptions = locations.map((l) => ({
        id: l.ID,
        label: l.LocationName
    }));

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
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#e5e5e5] dark:border-[#2a2a2a]">


                    <div className="flex flex-wrap items-center justify-end gap-3 flex-1">
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


        </div>
    );
};

export default BookingFilter;
