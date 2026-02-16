// Navbars.tsx
import { useEffect, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '../features/authSlice';
import type { AppDispatch, RootState } from '../store';
type NavItem = {
  label: string;
  to: string;
  end?: boolean; // ใช้กับ "/" เพื่อไม่ให้ active ทุกหน้า
};

type NavbarsProps = {
  brand?: { name: string; to?: string };
  items?: NavItem[];
  cta?: { label: string; to: string };
};

const defaultItems: NavItem[] = [
{ label: "Booking", to: "/", end: true },
{ label: "Customer", to: "/features" },
{ label: "Dashboard", to: "/pricing" }

];

export default function Navbars({
  brand = { name: "Booking Apps", to: "/" },
  items = defaultItems,
  cta = { label: "Signout", to: "/Login" },
}: NavbarsProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // กันเมนูค้างตอนสลับจาก mobile -> desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const linkBase =
    "rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2";

  // ✅ White clean theme
  const linkInactive =
    "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:ring-zinc-300";
  const linkActive = "bg-zinc-100 text-zinc-900 focus-visible:ring-zinc-300";

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { status } = useSelector((state: RootState) => state.auth)
  const loading = status === 'loading'

  const handleSignOut = async () => {
    const res = await dispatch(signOut())
    if (signOut.fulfilled.match(res)) {
      navigate('/login')
    }
  }

  return (
    <header className="sticky top-0 z-50">
      <nav
        className={[
          "mx-auto w-full",
          "bg-white", //  white solid
          scrolled ? "border-b border-zinc-200 shadow-sm" : "", //  nicer on scroll
        ].join(" ")}
        aria-label="Primary"
      >
        <div className="mx-auto flex max-w-1xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Brand */}
          <Link
            to={brand.to ?? "/"}
            className="group inline-flex items-center gap-2 rounded-xl px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm ring-1 ring-black/5">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 3l7.5 4.5v9L12 21 4.5 16.5v-9L12 3z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 7v10M7.8 9.2l8.4 5.6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="text-base font-semibold tracking-tight text-zinc-900">
              {brand.name}
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
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
            {/* CTA desktop */}
            <button
              type="button"
              onClick={handleSignOut}
              disabled={loading}
              className="hidden md:inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-black/5 transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing out...' : cta.label}
            </button>

            {/* Mobile button */}
            <button
              type="button"
              className="inline-flex md:hidden items-center justify-center rounded-xl p-2 text-zinc-800 hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300"
              aria-label="Toggle menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                {open ? (
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <div
          className={[
            "md:hidden overflow-hidden transition-[max-height,opacity] duration-300",
            open ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg">
              <div className="flex flex-col">
                {items.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    end={it.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      [
                        "rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300",
                        isActive
                          ? "bg-zinc-100 text-zinc-900"
                          : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
                      ].join(" ")
                    }
                  >
                    {it.label}
                  </NavLink>
                ))}

                <div className="mt-2 px-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      handleSignOut()
                    }}
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-black/5 transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:opacity-60 disabled:cursor-not-allowed"
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
