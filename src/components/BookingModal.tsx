import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    X, Calendar, Clock, MapPin, User, Briefcase, Activity
} from 'lucide-react';
import CustomButton from './CustomButton';
import CustomInput from './CustomInput';
import SearchableSelect from './SearchableSelect';
import { useAppSelector } from '../hooks';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface FormValues {
    jobType: string | number;
    customer: string | number;
    location: string | number;
    date: string;
    startHour: string;
    startMinute: string;
    endHour: string;
    endMinute: string;
    price: string | number;
    tax: string | number;
    summary: string | number;
    status: string | number;
    notes: string;
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
    const { customers, locations, statusOptions, jobTypes } = useAppSelector((state) => state.masterData);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<FormValues>({
        defaultValues: {
            jobType: '',
            customer: '',
            location: '',
            date: '',
            startHour: '',
            startMinute: '',
            endHour: '',
            endMinute: '',
            price: '',
            tax: '',
            summary: '',
            status: 'Booking',
            notes: ''
        }
    });

    const watchedPrice = watch("price");

    // คำนวณราคารวม (Summary) และ ภาษี (Tax) อัตโนมัติเมื่อราคา (Price) มีการเปลี่ยนแปลง
    useEffect(() => {
        const calculateTotal = () => {
            let pVal = 0;
            try {
                // If the user typed a math expression, evaluate it first for the sum
                const cleanPrice = String(watchedPrice).replace(/,/g, '').replace(/[^0-9+\-*/(). ]/g, '');
                if (cleanPrice) pVal = eval(cleanPrice) || 0;
            } catch (e) { pVal = parseFloat(String(watchedPrice).replace(/,/g, '')) || 0; }

            // Calculate 3% Tax
            const calculatedTax = pVal * 0.03;
            const total = pVal + calculatedTax;

            const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

            if (String(watchedPrice) === '') {
                setValue("tax", '', { shouldValidate: true, shouldDirty: true });
                setValue("summary", '', { shouldValidate: true, shouldDirty: true });
            } else {
                setValue("tax", formatCurrency(calculatedTax), { shouldValidate: true, shouldDirty: true });
                setValue("summary", formatCurrency(total), { shouldValidate: true, shouldDirty: true });
            }
        };

        calculateTotal();
    }, [watchedPrice, setValue]);

    const handleCalculateValues = (fieldName: keyof FormValues, value: string | number) => {
        if (!value) return;
        try {
            // Very simple math evaluation for standard format like "100 * 5" -> 500
            // We strip anything that's not a number, operator or parenthesis.
            const sanitized = String(value).replace(/,/g, '').replace(/[^0-9+\-*/(). ]/g, '');
            if (sanitized) {
                // eslint-disable-next-line no-eval
                const result = eval(sanitized);
                if (!isNaN(result)) {
                    // Update value without triggering whole component re-render ideally, but react-hook-form does it nicely
                    // @ts-ignore
                    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
                    setValue(fieldName, formatCurrency(result), { shouldValidate: true, shouldDirty: true });
                }
            }
        } catch (e) {
            console.warn("Invalid calculation format");
        }
    };

    const jobOptions = (jobTypes || []).map((j) => ({
        id: j.ID,
        label: j.TypeName
    }));
    const customerOptions = (customers || []).map((c) => ({
        id: c.ID,
        label: c.CustomerName
    }));
    const locationOptions = (locations || []).map((l) => ({
        id: l.ID,
        label: l.LocationName
    }));

    if (!isOpen) return null;

    const onSubmit = (data: FormValues) => {
        console.log("บันทึกรายการจอง", {
            ...data,
            startTime: `${data.startHour}:${data.startMinute}`,
            endTime: `${data.endHour}:${data.endMinute}`,
        });
        reset();
        onClose();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            <form
                onSubmit={handleSubmit(onSubmit)}
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
                        type="button"
                        onClick={handleClose}
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
                            <Controller
                                name="jobType"
                                control={control}
                                rules={{ required: "กรุณาเลือกประเภทงาน" }}
                                render={({ field }) => (
                                    <>
                                        <SearchableSelect
                                            label="ประเภทงาน"
                                            icon={<Briefcase className="w-4 h-4" />}
                                            options={jobOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="ค้นหาและเลือกประเภทงาน..."
                                            error={!!errors.jobType}
                                        />
                                        {errors.jobType && <p className="text-xs text-red-500 font-medium mt-1">{errors.jobType.message}</p>}
                                    </>
                                )}
                            />
                        </div>

                        {/* Row 2 */}
                        <div className="col-span-1">
                            <Controller
                                name="customer"
                                control={control}
                                rules={{ required: "กรุณาเลือกลูกค้า" }}
                                render={({ field }) => (
                                    <>
                                        <SearchableSelect
                                            label="ลูกค้า"
                                            icon={<User className="w-4 h-4" />}
                                            options={customerOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="ค้นหาและเลือกชื่อลูกค้า..."
                                            error={!!errors.customer}
                                        />
                                        {errors.customer && <p className="text-xs text-red-500 font-medium mt-1">{errors.customer.message}</p>}
                                    </>
                                )}
                            />
                        </div>
                        <div className="col-span-1">
                            <Controller
                                name="location"
                                control={control}
                                rules={{ required: "กรุณาเลือกสถานที่" }}
                                render={({ field }) => (
                                    <>
                                        <SearchableSelect
                                            label="สถานที่"
                                            icon={<MapPin className="w-4 h-4" />}
                                            options={locationOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="ค้นหาและเลือกสถานที่..."
                                            error={!!errors.location}
                                        />
                                        {errors.location && <p className="text-xs text-red-500 font-medium mt-1">{errors.location.message}</p>}
                                    </>
                                )}
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
                                        {...register("date", { required: "กรุณาระบุวันที่" })}
                                        className={`block w-full h-[42px] pl-10 pr-3 rounded-lg border bg-white dark:bg-[#1a1a1a] text-sm text-[#0d0d0d] dark:text-[#ececf1] outline-none transition-all ${errors.date ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/10' : 'border-[#e5e5e5] dark:border-[#2a2a2a] hover:border-[#c5c5d2] dark:hover:border-[#444654] focus:border-[#0d0d0d] dark:focus:border-[#ececf1] focus:ring-1 focus:ring-[#0d0d0d]/10 dark:focus:ring-[#ececf1]/10'}`}
                                    />
                                </div>
                                {errors.date && <p className="text-xs text-red-500 font-medium mt-1">{errors.date.message}</p>}
                            </div>

                            <div className="w-full">
                                <label className="block text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0] mb-1.5 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> เวลาเริ่ม
                                </label>
                                <div className="flex items-center gap-1.5">
                                    <div className="flex-1">
                                        <Controller
                                            name="startHour"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <SearchableSelect
                                                    label=""
                                                    options={hourOptions}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="HH"
                                                    error={!!errors.startHour}
                                                />
                                            )}
                                        />
                                    </div>
                                    <span className="text-[#0d0d0d] dark:text-[#ececf1] font-bold pb-1">:</span>
                                    <div className="flex-1">
                                        <Controller
                                            name="startMinute"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <SearchableSelect
                                                    label=""
                                                    options={minuteOptions}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="mm"
                                                    error={!!errors.startMinute}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                                {(errors.startHour || errors.startMinute) && <p className="text-xs text-red-500 font-medium mt-1">กรุณาระบุเวลาเริ่ม</p>}
                            </div>

                            <div className="w-full">
                                <label className="block text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0] mb-1.5 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> สิ้นสุดเวลา
                                </label>
                                <div className="flex items-center gap-1.5">
                                    <div className="flex-1">
                                        <Controller
                                            name="endHour"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <SearchableSelect
                                                    label=""
                                                    options={hourOptions}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="HH"
                                                    error={!!errors.endHour}
                                                />
                                            )}
                                        />
                                    </div>
                                    <span className="text-[#0d0d0d] dark:text-[#ececf1] font-bold pb-1">:</span>
                                    <div className="flex-1">
                                        <Controller
                                            name="endMinute"
                                            control={control}
                                            rules={{ required: true }}
                                            render={({ field }) => (
                                                <SearchableSelect
                                                    label=""
                                                    options={minuteOptions}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="mm"
                                                    error={!!errors.endMinute}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                                {(errors.endHour || errors.endMinute) && <p className="text-xs text-red-500 font-medium mt-1">กรุณาระบุสิ้นสุดเวลา</p>}
                            </div>
                        </div>

                        {/* Row 4 - Pricing */}
                        <div className="col-span-1">
                            <CustomInput
                                label="ราคา"
                                type="text"
                                placeholder="0.00"
                                {...register("price", {
                                    onBlur: (e) => {
                                        handleCalculateValues("price", e.target.value);
                                    }
                                })}
                            />
                        </div>
                        <div className="col-span-1 pointer-events-none opacity-80">
                            <CustomInput
                                label="ภาษี (3%)"
                                type="text"
                                placeholder="0.00"
                                readOnly
                                {...register("tax")}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <CustomInput
                                label="ราคารวม"
                                type="text"
                                placeholder="0.00"
                                {...register("summary", {
                                    onBlur: (e) => {
                                        handleCalculateValues("summary", e.target.value);
                                    }
                                })}
                            />
                        </div>

                        {/* Row 5 - Status */}
                        <div className="md:col-span-2">
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <SearchableSelect
                                        label="สถานะ (Status)"
                                        icon={<Activity className="w-4 h-4" />}
                                        options={statusOptions}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="ค้นหาและเลือกสถานะ..."
                                    />
                                )}
                            />
                        </div>

                        {/* Row 6 - Notes */}
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="block text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0]">
                                รายละเอียดเพิ่มเติม
                            </label>
                            <textarea
                                rows={3}
                                {...register("notes")}
                                className="block w-full rounded-lg border p-3 text-sm outline-none transition-all bg-white dark:bg-[#1a1a1a] text-[#0d0d0d] dark:text-[#ececf1] placeholder:text-[#acacbe] dark:placeholder:text-[#6e6e80] border-[#e5e5e5] dark:border-[#2a2a2a] hover:border-[#c5c5d2] dark:hover:border-[#444654] focus:border-[#0d0d0d] dark:focus:border-[#ececf1] focus:ring-1 focus:ring-[#0d0d0d]/10 dark:focus:ring-[#ececf1]/10 resize-none"
                                placeholder="กรอกรายละเอียดเพิ่มเติมหรือหมายเหตุ..."
                            />
                        </div>

                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="p-5 border-t border-[#e5e5e5] dark:border-[#2a2a2a] flex items-center justify-end gap-3 bg-[#f7f7f8] dark:bg-[#1a1a1a] rounded-b-xl">
                    <CustomButton
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                    >
                        ยกเลิก
                    </CustomButton>
                    <CustomButton
                        type="submit"
                        className="px-6"
                    >
                        บันทึกรายการจอง
                    </CustomButton>
                </div>
            </form>
        </div>
    );
};

export default BookingModal;
