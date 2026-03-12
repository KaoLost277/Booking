// Navbars.tsx — OpenAI-inspired with dark mode toggle + Notifications
import { useEffect, useState, useRef, useMemo } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '../features/authSlice';
import type { AppDispatch, RootState } from '../store';
import { PATH } from '../constants.ts'
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Bell, Calendar, Clock, X } from 'lucide-react';

type NavItem = {
  label: string;
  to: string;
  end?: boolean;
};

type NavbarsProps = {
  brand?: { name: string; to?: string };
  items?: NavItem[];
  cta?: { label: string; to: string };
};

const defaultItems: NavItem[] = [
  { label: "Dashboard", to: PATH.DASHBOARD, end: true },
  { label: "Booking", to: PATH.BOOKING },
  { label: "Customer", to: PATH.CUSTOMER },
  { label: "Location", to: PATH.LOCATION },
  { label: "Job Type", to: PATH.JOB_TYPE },
];

const THAI_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

export default function Navbars({
  brand = { name: "Booking Apps", to: PATH.HOME },
  items = defaultItems,
  cta = { label: "Signout", to: PATH.LOGIN },
}: NavbarsProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const bookings = useSelector((state: RootState) => state.book.data || []);

  // คำนวณ upcoming bookings (7 วันข้างหน้า) + pending
  const notifications = useMemo(() => {
    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const futureDate = new Date(now)
    futureDate.setDate(futureDate.getDate() + 7)
    const futureDateStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`

    return bookings
      .filter(b => {
        if (!b.Date) return false
        // upcoming (วันนี้ถึง 7 วันข้างหน้า) + ยังไม่ยกเลิก
        return b.Date >= todayStr && b.Date <= futureDateStr && b.Status !== 'Canceled'
      })
      .sort((a, b) => {
        if (a.Date !== b.Date) return a.Date!.localeCompare(b.Date!)
        return (a.StartTime || '').localeCompare(b.StartTime || '')
      })
      .slice(0, 8)
  }, [bookings])

  const pendingCount = useMemo(() =>
    bookings.filter(b => {
      const now = new Date()
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      return b.Date && b.Date >= todayStr && b.Status === 'Booking'
    }).length
    , [bookings])

  const badgeCount = notifications.length

  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const linkBase =
    "rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2";

  const linkInactive =
    "text-[#6e6e80] hover:text-[#0d0d0d] hover:bg-[#f7f7f8] dark:text-[#8e8ea0] dark:hover:text-[#ececf1] dark:hover:bg-[#2a2a2a] focus-visible:ring-[#a3a3a3]";
  const linkActive =
    "text-[#0d0d0d] bg-[#f7f7f8] dark:text-[#ececf1] dark:bg-[#2a2a2a] focus-visible:ring-[#a3a3a3]";

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status } = useSelector((state: RootState) => state.auth);
  const loading = status === 'loading';

  const handleSignOut = async () => {
    const res = await dispatch(signOut());
    if (signOut.fulfilled.match(res)) {
      navigate(PATH.LOGIN);
    }
  };

  const formatNotifDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
    if (dateStr === todayStr) return 'วันนี้'
    if (dateStr === tomorrowStr) return 'พรุ่งนี้'
    return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}`
  }

  const statusStyle: Record<string, string> = {
    Booking: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    Inprogress: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
    Canceled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
  }

  return (
    <header className="sticky top-0 z-50">
      <nav
        className={[
          "mx-auto w-full transition-all duration-200",
          "bg-white dark:bg-[#0d0d0d]",
          scrolled
            ? "border-b border-[#e5e5e5] dark:border-[#2a2a2a] shadow-sm dark:shadow-none"
            : "border-b border-transparent",
        ].join(" ")}
        aria-label="Primary"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Brand */}
          <Link
            to={brand.to ?? "/"}
            className="group inline-flex items-center gap-2.5 rounded-lg px-1 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a3a3a3]"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#0d0d0d] dark:bg-[#ececf1] text-white dark:text-[#0d0d0d] shadow-sm transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
                <path
                  d="M12 3l7.5 4.5v9L12 21 4.5 16.5v-9L12 3z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-base font-semibold tracking-tight text-[#0d0d0d] dark:text-[#ececf1]">
              {brand.name}
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 lg:flex">
            {items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.end}
                className={({ isActive }) =>
                  [linkBase, isActive ? linkActive : linkInactive].join(" ")
                }
              >
                {it.label}
              </NavLink>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen(v => !v)}
                className="relative inline-flex items-center justify-center rounded-lg p-2 text-[#6e6e80] hover:text-[#0d0d0d] hover:bg-[#f7f7f8] dark:text-[#8e8ea0] dark:hover:text-[#ececf1] dark:hover:bg-[#2a2a2a] transition-colors focus:outline-none"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {badgeCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <>
                  {/* Backdrop for mobile — click to close */}
                  <div
                    className="fixed inset-0 z-40 sm:hidden"
                    onClick={() => setNotifOpen(false)}
                  />

                  <div className="fixed left-2 right-2 top-14 z-50 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
                      <div>
                        <p className="text-sm font-semibold text-[#0d0d0d] dark:text-[#ececf1]">การแจ้งเตือน</p>
                        {pendingCount > 0 && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                            มี {pendingCount} รายการรอยืนยัน
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="p-1.5 rounded-lg text-[#6e6e80] hover:bg-[#f7f7f8] dark:hover:bg-[#2a2a2a] transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Notification list */}
                    <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto divide-y divide-[#e5e5e5] dark:divide-[#2a2a2a]">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <Bell className="w-8 h-8 text-[#acacbe] dark:text-[#6e6e80] mb-2" />
                          <p className="text-sm text-[#6e6e80] dark:text-[#8e8ea0]">ไม่มีการจองในช่วงนี้</p>
                        </div>
                      ) : notifications.map((b) => (
                        <div
                          key={b.ID}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-[#f7f7f8] dark:hover:bg-[#111111] transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#0d0d0d] dark:text-[#ececf1] truncate">
                              {b.CustomerMaster?.CustomerName || 'ไม่ระบุลูกค้า'}
                            </p>
                            <p className="text-xs text-[#6e6e80] dark:text-[#8e8ea0] truncate mt-0.5">
                              {b.JobTypeMaster?.TypeName || '-'} · {b.LocationMaster?.LocationName || '-'}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="flex items-center gap-1 text-[10px] text-[#6e6e80] dark:text-[#8e8ea0]">
                                <Calendar className="w-3 h-3" />
                                {formatNotifDate(b.Date || '')}
                              </span>
                              <span className="flex items-center gap-1 text-[10px] text-[#6e6e80] dark:text-[#8e8ea0]">
                                <Clock className="w-3 h-3" />
                                {b.StartTime?.slice(0, 5)} - {b.EndTime?.slice(0, 5)}
                              </span>
                            </div>
                          </div>
                          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyle[b.Status || 'Booking']}`}>
                            {b.Status}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                      <div className="px-4 py-2.5 border-t border-[#e5e5e5] dark:border-[#2a2a2a] bg-[#f7f7f8] dark:bg-[#111111]">
                        <NavLink
                          to={PATH.BOOKING}
                          onClick={() => setNotifOpen(false)}
                          className="block text-center text-xs font-medium text-[#6e6e80] dark:text-[#8e8ea0] hover:text-[#0d0d0d] dark:hover:text-[#ececf1] transition-colors"
                        >
                          ดูการจองทั้งหมด →
                        </NavLink>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center justify-center rounded-lg p-2 text-[#6e6e80] hover:text-[#0d0d0d] hover:bg-[#f7f7f8] dark:text-[#8e8ea0] dark:hover:text-[#ececf1] dark:hover:bg-[#2a2a2a] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a3a3a3]"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {/* CTA desktop */}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={loading}
              className="hidden lg:inline-flex items-center justify-center rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-[#0d0d0d] dark:text-[#ececf1] transition-colors hover:bg-[#f7f7f8] dark:hover:bg-[#2a2a2a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a3a3a3] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing out...' : cta.label}
            </button>

            {/* Mobile button */}
            <button
              type="button"
              className="inline-flex lg:hidden items-center justify-center rounded-lg p-2 text-[#0d0d0d] dark:text-[#ececf1] hover:bg-[#f7f7f8] dark:hover:bg-[#2a2a2a] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a3a3a3]"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                {open ? (
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <div
          className={[
            "lg:hidden overflow-hidden transition-[max-height,opacity] duration-300",
            open ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
            <div className="rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] p-2 shadow-lg dark:shadow-none">
              <div className="flex flex-col">
                {items.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      [
                        "rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a3a3a3]",
                        isActive
                          ? "bg-[#f7f7f8] dark:bg-[#2a2a2a] text-[#0d0d0d] dark:text-[#ececf1]"
                          : "text-[#6e6e80] dark:text-[#8e8ea0] hover:bg-[#f7f7f8] dark:hover:bg-[#2a2a2a] hover:text-[#0d0d0d] dark:hover:text-[#ececf1]",
                      ].join(" ")
                    }
                  >
                    {it.label}
                  </NavLink>
                ))}

                <div className="mt-2 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      handleSignOut();
                    }}
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-[#0d0d0d] dark:bg-[#ececf1] px-4 py-2 text-sm font-medium text-white dark:text-[#0d0d0d] transition-colors hover:bg-[#353740] dark:hover:bg-[#d9d9e3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a3a3a3] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Signing out...' : cta.label}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
