import { useMemo, useState, useEffect } from "react";
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

import { Calendar, Clock, Activity, ChevronLeft, ChevronRight, ChevronDown, Copy, Printer } from 'lucide-react';

interface BookingTableProps {
  onEdit?: (booking: BookingType) => void;
  onDelete?: (booking: BookingType) => void;
  onDuplicate?: (booking: BookingType) => void;
  onStatusChange?: (booking: BookingType, newStatus: string) => void;
  onExportPDF?: (booking: BookingType) => void;
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

function BookingTable({ onEdit, onDelete, onDuplicate, onStatusChange, onExportPDF, filters }: BookingTableProps) {
  const bookState = useSelector((state: RootState) => state.book);
  const rawBookings = bookState.data || [];

  const bookings: BookingRow[] = rawBookings.map((item: BookingType) => ({
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Status Change State
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<number | null>(null);
  const [statusConfirm, setStatusConfirm] = useState<{ id: number, newStatus: BookingRow["Status"] } | null>(null);

  // กรองข้อมูลตาม filter values
  const filtered = useMemo(() => {
    if (!filters) return bookings;

    return bookings.filter((b) => {
      // กรองข้อความค้นหา (searchText)
      if (filters.searchText) {
        const text = filters.searchText.toLowerCase();
        const matchCustomer = b.customer.toLowerCase().includes(text);
        const matchLocation = b.place.toLowerCase().includes(text);
        const matchJobType = b.jobType.toLowerCase().includes(text);
        if (!matchCustomer && !matchLocation && !matchJobType) return false;
      }
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

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

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
      let valA: string | number = (a[sortKey] as string | number) || "";
      let valB: string | number = (b[sortKey] as string | number) || "";

      if (sortKey === "start" || sortKey === "end") {
        valA = String(valA).replace(":", "");
        valB = String(valB).replace(":", "");
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
    setCurrentPage(1); // Reset page on sort
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

  const handleDuplicate = (id: number) => {
    const booking = findRawBooking(id);
    if (booking && onDuplicate) onDuplicate(booking);
  };

  const handlePdfExport = (id: number) => {
    const booking = findRawBooking(id);
    if (booking && onExportPDF) onExportPDF(booking);
  };

  // Pagination Logic
  const totalItems = sorted.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sorted.slice(startIndex, startIndex + itemsPerPage);

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

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
              <th onClick={() => handleSort("date")} className="p-4 cursor-pointer select-none text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">
                วันที่ / เวลา <span className="ml-1 text-xs opacity-50">{sortKey === "date" ? (direction === "asc" ? "▲" : "▼") : "↕"}</span>
              </th>
              <th onClick={() => handleSort("customer")} className="p-4 cursor-pointer select-none text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">
                ลูกค้า <span className="ml-1 text-xs opacity-50">{sortKey === "customer" ? (direction === "asc" ? "▲" : "▼") : "↕"}</span>
              </th>
              <th onClick={() => handleSort("jobType")} className="p-4 cursor-pointer select-none text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">
                ประเภทงาน <span className="ml-1 text-xs opacity-50">{sortKey === "jobType" ? (direction === "asc" ? "▲" : "▼") : "↕"}</span>
              </th>
              <th onClick={() => handleSort("place")} className="p-4 cursor-pointer select-none text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">
                สถานที่ <span className="ml-1 text-xs opacity-50">{sortKey === "place" ? (direction === "asc" ? "▲" : "▼") : "↕"}</span>
              </th>
              <th onClick={() => handleSort("summary")} className="p-4 cursor-pointer select-none text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">
                ยอดสุทธิ <span className="ml-1 text-xs opacity-50">{sortKey === "summary" ? (direction === "asc" ? "▲" : "▼") : "↕"}</span>
              </th>
              <th onClick={() => handleSort("Status")} className="p-4 cursor-pointer select-none text-left text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">
                สถานะ <span className="ml-1 text-xs opacity-50">{sortKey === "Status" ? (direction === "asc" ? "▲" : "▼") : "↕"}</span>
              </th>
              <th className="p-4 text-center text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">
                จัดการ
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#2a2a2a] bg-white dark:bg-[#0d0d0d]">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-[#6e6e80] dark:text-[#8e8ea0]">
                  ไม่พบข้อมูลการจอง
                </td>
              </tr>
            ) : paginatedData.map((b) => (
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
                  <div className="relative">
                    <button
                      onClick={() => setStatusDropdownOpen(statusDropdownOpen === b.id ? null : b.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer select-none transition-all hover:opacity-80
                      ${b.Status === 'Booking' ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                          b.Status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                            b.Status === 'Inprogress' ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                              'bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
                        }`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      {statusLabel[b.Status]}
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </button>

                    {statusDropdownOpen === b.id && (
                      <>
                        {/* Overlay to close dropdown */}
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setStatusDropdownOpen(null)}
                        />
                        <div className="absolute left-0 mt-2 w-36 bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-lg shadow-xl z-20 overflow-hidden text-sm animate-in fade-in slide-in-from-top-2">
                          {(['Booking', 'Inprogress', 'Completed', 'Canceled'] as BookingRow["Status"][]).map((st) => (
                            <button
                              key={st}
                              onClick={() => {
                                setStatusDropdownOpen(null);
                                setStatusConfirm({ id: b.id, newStatus: st });
                              }}
                              className={`w-full text-left px-4 py-2 hover:bg-[#f7f7f8] dark:hover:bg-[#2a2a2a] transition-colors
                                ${b.Status === st ? 'font-semibold text-[#0d0d0d] dark:text-[#ececf1] bg-[#f7f7f8] dark:bg-[#2a2a2a]' : 'text-[#6e6e80] dark:text-[#8e8ea0]'}`}
                            >
                              {statusLabel[st]}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => handlePdfExport(b.id)}
                      className="p-2 text-[#6e6e80] dark:text-[#8e8ea0] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors group relative"
                      title="พิมพ์ใบเสร็จ (PDF)"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(b.id)}
                      className="p-2 text-[#6e6e80] dark:text-[#8e8ea0] hover:text-[#0d0d0d] dark:hover:text-[#ececf1] hover:bg-[#f7f7f8] dark:hover:bg-[#1a1a1a] rounded-lg transition-colors group relative"
                      title="คัดลอกรายการจอง"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
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
        {paginatedData.length === 0 ? (
          <div className="text-center py-8 text-[#6e6e80] dark:text-[#8e8ea0]">
            ไม่พบข้อมูลการจอง
          </div>
        ) : paginatedData.map((b) => (
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
              <div className="flex gap-2">
                <CustomButton
                  variant="secondary"
                  className="flex-1 !py-2 text-[#6e6e80] dark:text-[#8e8ea0] hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => handlePdfExport(b.id)}
                >
                  <Printer className="w-4 h-4 mx-auto" />
                </CustomButton>
                <CustomButton
                  variant="secondary"
                  className="flex-1 !py-2 text-[#6e6e80] dark:text-[#8e8ea0] hover:text-[#0d0d0d] dark:hover:text-[#ececf1]"
                  onClick={() => handleDuplicate(b.id)}
                >
                  <Copy className="w-4 h-4 mx-auto" />
                </CustomButton>
                <CustomButton
                  variant="secondary"
                  className="flex-[2] !py-2"
                  onClick={() => handleEdit(b.id)}
                >
                  แก้ไข
                </CustomButton>
              </div>
              <CustomButton
                variant="danger"
                fullWidth
                className="!py-2 border-t sm:border-t-0 sm:border-l border-[#e5e5e5] dark:border-[#2a2a2a] pt-2 sm:pt-0 sm:pl-2"
                onClick={() => handleDelete(b.id)}
              >
                ลบ
              </CustomButton>
            </div>
          </div>
        ))}
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

      {/* Status Change Confirmation */}
      {statusConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-[#0d0d0d] dark:text-[#ececf1] mb-2">
              ยืนยันการเปลี่ยนสถานะ
            </h3>
            <p className="text-sm text-[#6e6e80] dark:text-[#8e8ea0] mb-5">
              คุณต้องการเปลี่ยนสถานะรายการนี้เป็น <span className="font-semibold text-[#0d0d0d] dark:text-[#ececf1]">"{statusLabel[statusConfirm.newStatus]}"</span> ใช่หรือไม่?
            </p>
            <div className="flex items-center justify-end gap-3">
              <CustomButton
                variant="secondary"
                onClick={() => setStatusConfirm(null)}
              >
                ยกเลิก
              </CustomButton>
              <CustomButton
                onClick={() => {
                  const booking = findRawBooking(statusConfirm.id);
                  if (booking && onStatusChange) {
                    onStatusChange(booking, statusConfirm.newStatus);
                  }
                  setStatusConfirm(null);
                }}
              >
                ยืนยัน
              </CustomButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingTable;
