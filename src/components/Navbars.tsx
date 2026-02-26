// Navbars.tsx — OpenAI-inspired with dark mode toggle
import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '../features/authSlice';
import type { AppDispatch, RootState } from '../store';
import { PATH } from '../constants.ts'
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

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

export default function Navbars({
  brand = { name: "Booking Apps", to: PATH.HOME },
  items = defaultItems,
  cta = { label: "Signout", to: PATH.LOGIN },
}: NavbarsProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

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
