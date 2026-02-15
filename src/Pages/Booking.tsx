import React from "react";
import Navbars from '../components/Navbars.tsx'
import BookingTable from '../components/BookingTable.tsx'
type AppLayoutProps = {
  title?: string;
  children?: React.ReactNode;
};

function BookingLayout({}: AppLayoutProps) {
  return (
    <div className="min-h-dvh bg-slate-100">
      {/* Header */}
      <Navbars/>

      {/* Main */}
      <main className="mx-auto w-full max-w-1xl px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
       <BookingTable/>
      </main>
    </div>
  );
}

export default BookingLayout;
