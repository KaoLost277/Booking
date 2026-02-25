import React, { useState, useEffect, useRef } from "react";
import Navbars from '../components/Navbars.tsx'
import BookingTable from '../components/BookingTable.tsx'
import BookingFilter from '../components/BookingFilter.tsx'
import CustomButton from '../components/CustomButton.tsx'
import { Plus, CalendarDays, Database } from 'lucide-react'
import Test from "./test"
import BookingModal from '../components/BookingModal';
import { useAppDispatch } from "../hooks";
import { fetchMasterData } from "../features/masterDataSlice";
type AppLayoutProps = {
  title?: string;
  children?: React.ReactNode;
};

function BookingLayout({ }: AppLayoutProps) {
  const [showFab, setShowFab] = useState(false);
  const heroButtonRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowFab(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (heroButtonRef.current) observer.observe(heroButtonRef.current);
    return () => observer.disconnect();
  }, []);

  const dispatch = useAppDispatch();
  const handleNewBooking = () => {
    setIsModalOpen(true);
  };

  const handleTestMaster = async () => {
    try {
      const result = await dispatch(fetchMasterData()).unwrap();
      console.log("Master Data Result:", result);
    } catch (error) {
      console.error("Master Data Error:", error);
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
              <CustomButton
                onClick={handleTestMaster}
                variant="secondary"
              >
                <Database className="w-5 h-5" />
                Test Master Data
              </CustomButton>
              <Test />
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
          <BookingFilter />
        </div>

        {/* Table */}
        <BookingTable />
      </main>

      {/* Floating Action Button */}
      <BookingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div>
  );
}

export default BookingLayout;
