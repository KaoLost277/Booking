import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import type { Booking as BookingType } from "../types/booking";
import type { FilterValues } from "./BookingFilter";
import CustomButton from "./CustomButton";
import LoadingSpinner from "./LoadingSpinner";

type BookingRow = {
  id: number;
  customer: string;
  customerID: number | null;
  place: string;
  locationID: number | null;
  jobType: string;
  jobTypeID: number | null;
  start: string;
  end: string;
  date: string;
  Status: "Booking" | "Inprogress" | "Canceled" | "Completed";
  price: number;
  summary: number;
};

import { Calendar, Clock, Activity } from 'lucide-react';

interface BookingTableProps {
  onEdit?: (booking: BookingType) => void;
  onDelete?: (booking: BookingType) => void;
  filters?: FilterValues | null;
}

const statusStyle: Record<BookingRow["Status"], string> = {
  Booking: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  Inprogress: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  Canceled: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  Completed: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
};

const statusLabel: Record<BookingRow["Status"], string> = {
  Booking: "Booking",
  Inprogress: "Inprogress",
  Canceled: "Canceled",
  Completed: "Completed",
};

type SortKey = keyof BookingRow;
type Direction = "asc" | "desc";

function BookingTable({ onEdit, onDelete, filters }: BookingTableProps) {
  const bookState = useSelector((state: RootState) => state.book);
  const rawBookings = bookState.data || [];

  const bookings: BookingRow[] = rawBookings.map((item: any) => ({
    id: item.ID,
    customer: item.CustomerMaster?.CustomerName ?? '-',
    customerID: item.CustomerID ?? null,
    place: item.LocationMaster?.LocationName ?? '-',
    locationID: item.LocationID ?? null,
    jobType: item.JobTypeMaster?.TypeName ?? '-',
    jobTypeID: item.JobType ?? null,
    start: item.StartTime ?? '-',
    end: item.EndTime ?? '-',
    date: item.Date ?? '-',
    Status: (item.Status as BookingRow["Status"]) || 'Booking',
    price: item.Price || 0,
    summary: item.Summary || 0,
  }));

  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [direction, setDirection] = useState<Direction>("asc");

  // กรองข้อมูลตาม filter values
  const filtered = useMemo(() => {
    if (!filters) return bookings;

    return bookings.filter((b) => {
      // กรองวันที่
      if (filters.date && b.date !== filters.date) return false;
      // กรองลูกค้า
      if (filters.customerID && b.customerID !== Number(filters.customerID)) return false;
      // กรองสถานที่
      if (filters.locationID && b.locationID !== Number(filters.locationID)) return false;
      // กรองประเภทงาน
      if (filters.jobTypeID && b.jobTypeID !== Number(filters.jobTypeID)) return false;
      // กรองสถานะ
      if (filters.status && b.Status !== String(filters.status)) return false;

      return true;
    });
  }, [bookings, filters]);

  const formatDate = (date: string) => {
    try {
      if (!date || date === '-') return '-';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return date;
    }
  };

  const sorted = useMemo(() => {
    const sortedData = [...filtered].sort((a, b) => {
      let valA: any = a[sortKey];
      let valB: any = b[sortKey];

      if (sortKey === "start" || sortKey === "end") {
        valA = valA.replace(":", "");
        valB = valB.replace(":", "");
      }

      if (sortKey === "Status") {
        const order: Record<BookingRow["Status"], number> = {
          Booking: 4,
          Inprogress: 3,
          Completed: 2,
          Canceled: 1,
        };
        valA = order[valA as BookingRow["Status"]];
        valB = order[valB as BookingRow["Status"]];
      }

      if (valA > valB) return direction === "asc" ? 1 : -1;
      if (valA < valB) return direction === "asc" ? -1 : 1;
      return 0;
    });

    return sortedData;
  }, [filtered, sortKey, direction]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setDirection(direction === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setDirection("asc");
    }
  };

  // หาข้อมูล Booking ดิบจาก rawBookings โดยใช้ ID
  const findRawBooking = (id: number): BookingType | undefined => {
    return rawBookings.find((item) => item.ID === id);
  };

  const handleEdit = (id: number) => {
    const booking = findRawBooking(id);
    if (booking && onEdit) onEdit(booking);
  };

  const handleDelete = (id: number) => {
    const booking = findRawBooking(id);
    if (booking && onDelete) onDelete(booking);
  };

  const Arrow = ({ column }: { column: SortKey }) => (
    <span className="ml-1 text-xs opacity-50">
      {sortKey === column ? (direction === "asc" ? "▲" : "▼") : "↕"}
    </span>
  );

  const Th = ({ label, column }: { label: string; column: SortKey }) => (
    <th
      onClick={() => handleSort(column)}
      className="p-4 cursor-pointer select-none text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0] hover:text-[#0d0d0d] dark:hover:text-[#ececf1] transition-colors"
    >
      <div className="flex items-center gap-1">
        {label} <Arrow column={column} />
      </div>
    </th>
  );

  if (bookState.loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-[#6e6e80] dark:text-[#8e8ea0] font-medium animate-pulse">
          กำลังโหลดข้อมูลการจอง...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Filter result count */}
      {filters && (
        <p className="text-sm text-[#6e6e80] dark:text-[#8e8ea0]">
          พบ <span className="font-semibold text-[#0d0d0d] dark:text-[#ececf1]">{sorted.length}</span> รายการ
          {sorted.length !== bookings.length && (
            <span> จากทั้งหมด {bookings.length} รายการ</span>
          )}
        </p>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] transition-colors bg-[#fafafa] dark:bg-[#111111]">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f7f8] dark:bg-[#1a1a1a] border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
            <tr>
              <Th label="วันที่ / เวลา" column="date" />
              <Th label="ลูกค้า" column="customer" />
              <Th label="ประเภทงาน" column="jobType" />
              <Th label="สถานที่" column="place" />
              <Th label="ยอดสุทธิ" column="summary" />
              <Th label="สถานะ" column="Status" />
              <th className="p-4 text-center text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">
                จัดการ
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#2a2a2a] bg-white dark:bg-[#0d0d0d]">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#6e6e80] dark:text-[#8e8ea0]">
                  ไม่พบข้อมูลการจอง
                </td>
              </tr>
            ) : sorted.map((b) => (
              <tr
                key={b.id}
                className="hover:bg-[#f7f7f8] dark:hover:bg-[#1a1a1a] transition-colors"
              >
                <td className="p-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 font-semibold text-[#0d0d0d] dark:text-[#ececf1]">
                      <Calendar className="w-4 h-4 text-[#6e6e80] dark:text-[#8e8ea0]" />
                      {formatDate(b.date)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#6e6e80] dark:text-[#8e8ea0]">
                      <Clock className="w-3 h-3" />
                      {b.start.slice(0, 5)} - {b.end.slice(0, 5)}
                    </div>
                  </div>
                </td>
                <td className="p-4 font-medium text-[#0d0d0d] dark:text-[#ececf1]">
                  {b.customer}
                </td>
                <td className="p-4 font-medium text-[#0d0d0d] dark:text-[#ececf1]">
                  {b.jobType}
                </td>
                <td className="p-4 text-[#6e6e80] dark:text-[#8e8ea0]">
                  {b.place}
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#0d0d0d] dark:text-[#ececf1]">
                      {b.summary.toLocaleString()} บาท
                    </div>
                    <div className="text-[11px] text-[#6e6e80] dark:text-[#8e8ea0]">
                      (ราคา: {b.price.toLocaleString()} บาท)
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${b.Status === 'Booking' ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                    b.Status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                      b.Status === 'Inprogress' ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                        'bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                    }`}>
                    <Activity className="w-3.5 h-3.5" />
                    {statusLabel[b.Status]}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <CustomButton
                      variant="secondary"
                      className="!px-5 !py-2 text-sm"
                      onClick={() => handleEdit(b.id)}
                    >
                      แก้ไข
                    </CustomButton>
                    <CustomButton
                      variant="danger"
                      className="!px-5 !py-2 text-sm"
                      onClick={() => handleDelete(b.id)}
                    >
                      ลบ
                    </CustomButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {sorted.length === 0 ? (
          <div className="text-center py-8 text-[#6e6e80] dark:text-[#8e8ea0]">
            ไม่พบข้อมูลการจอง
          </div>
        ) : sorted.map((b) => (
          <div
            key={b.id}
            className="rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-4 bg-white dark:bg-[#1a1a1a] transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-medium text-[#0d0d0d] dark:text-[#ececf1]">{b.customer}</p>
                <p className="text-sm text-[#6e6e80] dark:text-[#8e8ea0]">{b.place}</p>
              </div>
              <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${statusStyle[b.Status]}`}>
                {statusLabel[b.Status]}
              </span>
            </div>

            <div className="text-sm text-[#6e6e80] dark:text-[#8e8ea0] mb-3 space-y-1">
              <p>
                วันที่: <span className="font-medium text-[#0d0d0d] dark:text-[#ececf1]">{formatDate(b.date)}</span>
              </p>
              <p>ประเภทงาน: <span className="font-medium text-[#0d0d0d] dark:text-[#ececf1]">{b.jobType}</span></p>
              <p>เริ่ม: <span className="font-mono text-xs">{b.start}</span></p>
              <p>สิ้นสุด: <span className="font-mono text-xs">{b.end}</span></p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-[#e5e5e5] dark:border-[#2a2a2a]">
              <CustomButton
                variant="secondary"
                fullWidth
                className="!py-2"
                onClick={() => handleEdit(b.id)}
              >
                แก้ไข
              </CustomButton>
              <CustomButton
                variant="danger"
                fullWidth
                className="!py-2"
                onClick={() => handleDelete(b.id)}
              >
                ลบ
              </CustomButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookingTable;
