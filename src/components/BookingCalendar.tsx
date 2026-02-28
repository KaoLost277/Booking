import React, { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { Booking as BookingType } from '../types/booking';
import type { FilterValues } from './BookingFilter';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import LoadingSpinner from './LoadingSpinner';

interface BookingCalendarProps {
    onEdit?: (booking: BookingType) => void;
    onSelect?: (start: Date, end: Date) => void;
    filters?: FilterValues | null;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ onEdit, onSelect, filters }) => {
    const bookState = useSelector((state: RootState) => state.book);
    const rawBookings = bookState.data || [];

    // Filter bookings logic (reuse logic from BookingTable)
    const filteredBookings = useMemo(() => {
        if (!filters) return rawBookings;

        return rawBookings.filter((b) => {
            // กรองวันที่
            if (filters.date && b.Date !== filters.date) return false;
            // กรองลูกค้า
            if (filters.customerID && b.CustomerID !== Number(filters.customerID)) return false;
            // กรองสถานที่
            if (filters.locationID && b.LocationID !== Number(filters.locationID)) return false;
            // กรองประเภทงาน
            if (filters.jobTypeID && b.JobType !== Number(filters.jobTypeID)) return false;
            // กรองสถานะ
            if (filters.status && b.Status !== String(filters.status)) return false;

            return true;
        });
    }, [rawBookings, filters]);

    // Transform bookings into FullCalendar events
    const events = useMemo(() => {
        return filteredBookings.map((booking) => {
            // Create valid date strings for FullCalendar ISO8601 parsing
            // Assuming Date is "YYYY-MM-DD" and StartTime/EndTime is "HH:mm:ss"
            const dateStr = booking.Date || '';
            const startStr = booking.StartTime || '00:00:00';
            const endStr = booking.EndTime || '01:00:00';

            const start = `${dateStr}T${startStr}`;
            const end = `${dateStr}T${endStr}`;

            // Set colors based on status (matching the Table tags)
            let backgroundColor = '#3b82f6'; // booking (blue-500)
            let borderColor = '#2563eb';    // booking-border (blue-600)
            let textColor = '#ffffff';

            switch (booking.Status) {
                case 'Inprogress':
                    backgroundColor = '#f59e0b'; // amber-500
                    borderColor = '#d97706';
                    break;
                case 'Completed':
                    backgroundColor = '#10b981'; // emerald-500
                    borderColor = '#059669';
                    break;
                case 'Canceled':
                    backgroundColor = '#ef4444'; // red-500
                    borderColor = '#dc2626';
                    break;
                case 'Booking':
                default:
                    backgroundColor = '#3b82f6'; // blue-500
                    borderColor = '#2563eb';
                    break;
            }

            return {
                id: String(booking.ID),
                title: `${booking.CustomerMaster?.CustomerName || 'ไม่ระบุลูกค้า'} - ${booking.JobTypeMaster?.TypeName || 'ไม่ระบุงาน'}`,
                start,
                end,
                backgroundColor,
                borderColor,
                textColor,
                extendedProps: {
                    rawBooking: booking
                }
            };
        });
    }, [filteredBookings]);

    if (bookState.loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-[#6e6e80] dark:text-[#8e8ea0] font-medium animate-pulse">
                    กำลังโหลดข้อมูลปฏิทิน...
                </p>
            </div>
        );
    }

    return (
        <div className="w-full bg-[#fafafa] dark:bg-[#111111] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-xl overflow-hidden shadow-sm p-4">
            {/* Calendar Wrapper with scoped CSS overrides for themes */}
            <div className="fc-theme-custom h-[700px]">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    slotMinTime="06:00:00"
                    slotMaxTime="24:00:00"
                    allDaySlot={false}
                    nowIndicator={true}
                    editable={false}
                    selectable={true}
                    selectMirror={true}
                    select={(info) => {
                        if (onSelect) {
                            onSelect(info.start, info.end);
                        }
                    }}
                    events={events}
                    eventClick={(info) => {
                        if (onEdit) {
                            onEdit(info.event.extendedProps.rawBooking as BookingType);
                        }
                    }}
                    height="100%"
                    // Apply basic translations
                    buttonText={{
                        today: 'วันนี้',
                        month: 'เดือน',
                        week: 'สัปดาห์',
                        day: 'วัน',
                        list: 'รายการ'
                    }}
                />
            </div>
        </div>
    );
};

export default BookingCalendar;
