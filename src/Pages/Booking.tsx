import { useState, useEffect, useRef } from "react";
import Navbars from '../components/Navbars.tsx'
import BookingTable from '../components/BookingTable'
import BookingCalendar from '../components/BookingCalendar'
import BookingFilter from '../components/BookingFilter'
import type { FilterValues } from '../components/BookingFilter'
import CustomButton from '../components/CustomButton'
import { Plus, CalendarDays, List, Calendar as CalendarIcon } from 'lucide-react'
import BookingModal from '../components/BookingModal';
import { useAppDispatch } from "../hooks";
import { fetchMasterData } from "../features/masterDataSlice";
import { DeleteBook, bookGet, UpdateBook } from "../features/bookSlice";
import type { Booking } from "../types/booking";
import BookingReceiptPDF from '../components/BookingReceiptPDF';


function BookingLayout() {
  const heroButtonRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('calendar');
  const [initialBookingData, setInitialBookingData] = useState<{ date?: Date, start?: Date, end?: Date } | null>(null);

  const [pdfBooking, setPdfBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      () => { }, // Placeholder callback
      { threshold: 0 }
    );
    if (heroButtonRef.current) observer.observe(heroButtonRef.current);
    return () => observer.disconnect();
  }, []);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(bookGet());
    dispatch(fetchMasterData());
  }, [dispatch]);

  // เปิด Modal โหมดเพิ่มใหม่
  const handleNewBooking = (start?: Date | any, end?: Date | any) => {
    setEditingBooking(null);
    if (start instanceof Date && end instanceof Date) {
      setInitialBookingData({ date: start, start, end });
    } else {
      setInitialBookingData(null);
    }
    setIsModalOpen(true);
  };

  // เปิด Modal โหมดแก้ไข
  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setIsModalOpen(true);
  };

  // ปิด Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBooking(null);
    setInitialBookingData(null);
  };

  // คัดลอกรายการจอง (เปิดโหมด Add แต่ pre-fill ข้อมูล)
  const handleDuplicateBooking = (booking: Booking) => {
    // We pass the booking to editingBooking but we need to tell the modal it's a duplication.
    // Instead of adding a new state, we can pass it via editingBooking and let Modal handle it 
    // OR add a specific duplicate state. Let's send a fake booking object with no ID to act as template.
    const duplicateB = { ...booking, ID: undefined };
    setEditingBooking(duplicateB as unknown as Booking);
    setIsModalOpen(true);
  };

  // เปิด Confirm ลบ
  const handleDeleteBooking = (booking: Booking) => {
    setDeleteConfirm(booking);
  };

  // ยืนยันการลบ
  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await dispatch(DeleteBook(deleteConfirm.ID)).unwrap();
      await dispatch(bookGet());
      setDeleteConfirm(null);
    } catch (err) {
      console.error('ลบรายการจองไม่สำเร็จ:', err);
      alert(`เกิดข้อผิดพลาดในการลบ: ${err}`);
    } finally {
      setDeleting(false);
    }
  };

  // เปลี่ยนสถานะด่วนจาก Table
  const handleStatusChange = async (booking: Booking, newStatus: string) => {
    try {
      if (!booking.ID) return;
      await dispatch(UpdateBook({ id: booking.ID, updates: { Status: newStatus as any } })).unwrap();
      await dispatch(bookGet());
    } catch (err) {
      console.error('เปลี่ยนสถานะไม่สำเร็จ:', err);
      alert(`เกิดข้อผิดพลาดในการเปลี่ยนสถานะ: ${err}`);
    }
  };

  const handleExportPDF = (booking: Booking) => {
    setPdfBooking(booking);

    // รอให้ React render component ใบเสร็จให้เสร็จก่อน
    setTimeout(() => {
      window.print();
      // ไม่ต้องล้าง pdfBooking ทันที ให้ค้างไว้ระหว่าง print
      // จะมี Event Listener ดักเมื่อ print เสร็จค่อยเคลียร์
    }, 500);
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      setPdfBooking(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  return (
    <div className="min-h-dvh bg-white dark:bg-[#0d0d0d] transition-colors duration-200">
      {/* === ส่วนเนื้อหาหลัก จะถูกซ่อนเมื่อมีการสั่ง Print === */}
      <div className="print:hidden">
        <Navbars />

        {/* Page Header — OpenAI style: clean, minimal */}
        <div className="border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              {/* Title */}
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f7f7f8] dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] transition-colors">
                  <CalendarDays className="h-6 w-6 text-[#0d0d0d] dark:text-[#ececf1]" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold text-[#0d0d0d] dark:text-[#ececf1] tracking-tight">
                    จัดการข้อมูลการจอง
                  </h1>
                  <p className="mt-1 text-[#6e6e80] dark:text-[#8e8ea0] text-sm">
                    จัดการรายการจองคิวทั้งหมด
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div ref={heroButtonRef} className="flex flex-col sm:flex-row items-center gap-3">
                {/* View Toggle */}
                <div className="flex bg-[#f7f7f8] dark:bg-[#1a1a1a] p-1 rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a]">
                  <button
                    type="button"
                    onClick={() => setViewMode('calendar')}
                    className={`flex flex-1 items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'calendar'
                      ? 'bg-white dark:bg-[#353740] text-[#0d0d0d] dark:text-[#ececf1] shadow-sm'
                      : 'text-[#6e6e80] dark:text-[#8e8ea0] hover:text-[#0d0d0d] dark:hover:text-[#ececf1]'
                      }`}
                  >
                    <CalendarIcon className="w-4 h-4" />
                    ปฏิทิน
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`flex flex-1 items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'table'
                      ? 'bg-white dark:bg-[#353740] text-[#0d0d0d] dark:text-[#ececf1] shadow-sm'
                      : 'text-[#6e6e80] dark:text-[#8e8ea0] hover:text-[#0d0d0d] dark:hover:text-[#ececf1]'
                      }`}
                  >
                    <List className="w-4 h-4" />
                    ตาราง
                  </button>
                </div>

                <CustomButton onClick={handleNewBooking}>
                  <Plus className="w-5 h-5" />
                  เพิ่มการจองใหม่
                </CustomButton>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* Filter */}
          <div className="mb-6">
            <BookingFilter
              onFilter={(f) => setFilterValues(f)}
              onClear={() => setFilterValues(null)}
            />
          </div>

          {/* Dynamic View (Table or Calendar) */}
          {viewMode === 'table' ? (
            <BookingTable
              onEdit={handleEditBooking}
              onDelete={handleDeleteBooking}
              onStatusChange={handleStatusChange}
              onDuplicate={handleDuplicateBooking}
              onExportPDF={handleExportPDF}
              filters={filterValues}
            />
          ) : (
            <BookingCalendar
              onEdit={handleEditBooking}
              onSelect={handleNewBooking}
              filters={filterValues}
            />
          )}
        </main>

        {/* Booking Modal (เพิ่ม / แก้ไข) */}
        <BookingModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          editingBooking={editingBooking}
          initialDate={initialBookingData?.date}
          initialStartTime={initialBookingData?.start}
          initialEndTime={initialBookingData?.end}
        />

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-xl shadow-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-6">
              <h3 className="text-lg font-semibold text-[#0d0d0d] dark:text-[#ececf1] mb-2">
                ยืนยันการลบ
              </h3>
              <p className="text-sm text-[#6e6e80] dark:text-[#8e8ea0] mb-1">
                คุณต้องการลบรายการจองนี้หรือไม่?
              </p>
              <div className="text-sm text-[#6e6e80] dark:text-[#8e8ea0] mb-5 bg-[#f7f7f8] dark:bg-[#0d0d0d] rounded-lg p-3 border border-[#e5e5e5] dark:border-[#2a2a2a]">
                <p><strong>ลูกค้า:</strong> {deleteConfirm.CustomerMaster?.CustomerName || '-'}</p>
                <p><strong>วันที่:</strong> {deleteConfirm.Date || '-'}</p>
                <p><strong>เวลา:</strong> {deleteConfirm.StartTime?.slice(0, 5) || '-'} - {deleteConfirm.EndTime?.slice(0, 5) || '-'}</p>
              </div>
              <p className="text-xs text-red-500 mb-4">
                ⚠️ การลบจะไม่สามารถกู้คืนได้
              </p>
              <div className="flex items-center justify-end gap-3">
                <CustomButton
                  variant="secondary"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                >
                  ยกเลิก
                </CustomButton>
                <CustomButton
                  variant="danger"
                  onClick={confirmDelete}
                  loading={deleting}
                  disabled={deleting}
                >
                  ลบรายการ
                </CustomButton>
              </div>
            </div>
          </div>
        )}
      </div> {/* ปิด div print:hidden */}

      {/* Hidden PDF content for Printing Only */}
      {pdfBooking && (
        <div className="hidden print:block w-full bg-white absolute top-0 left-0 m-0 p-0 text-black">
          <BookingReceiptPDF booking={pdfBooking} />
        </div>
      )}
    </div>
  );
}

export default BookingLayout;
