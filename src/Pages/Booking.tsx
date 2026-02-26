import React, { useState, useEffect, useRef } from "react";
import Navbars from '../components/Navbars.tsx'
import BookingTable from '../components/BookingTable.tsx'
import BookingFilter from '../components/BookingFilter.tsx'
import type { FilterValues } from '../components/BookingFilter';
import CustomButton from '../components/CustomButton.tsx'
import { Plus, CalendarDays } from 'lucide-react'
import BookingModal from '../components/BookingModal';
import { useAppDispatch } from "../hooks";
import { fetchMasterData } from "../features/masterDataSlice";
import { DeleteBook, bookGet } from "../features/bookSlice";
import type { Booking } from "../types/booking";

type AppLayoutProps = {
  title?: string;
  children?: React.ReactNode;
};

function BookingLayout({ }: AppLayoutProps) {
  const heroButtonRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterValues, setFilterValues] = useState<FilterValues | null>(null);

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
  const handleNewBooking = () => {
    setEditingBooking(null);
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

  return (
    <div className="min-h-dvh bg-white dark:bg-[#0d0d0d] transition-colors duration-200">
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
            <div ref={heroButtonRef} className="flex items-center gap-3">
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

        {/* Table */}
        <BookingTable
          onEdit={handleEditBooking}
          onDelete={handleDeleteBooking}
          filters={filterValues}
        />
      </main>

      {/* Booking Modal (เพิ่ม / แก้ไข) */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingBooking={editingBooking}
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
    </div>
  );
}

export default BookingLayout;
