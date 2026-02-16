import { useMemo, useState } from "react";

type Booking = {
  id: number;
  customer: string;
  place: string;
  start: string;
  end: string;
  date: string;
  Status: "Booking" | "Inprogress" | "Canceled" | "Completed";
};

const bookings: Booking[] = [
  {
    id: 1,
    customer: "สมชาย ใจดี",
    place: "Meeting Room A",
    start: "09:00",
    end: "10:30",
    date: "2026-02-12",
    Status: "Completed",
  },
  {
    id: 2,
    customer: "บริษัท ABC",
    place: "Hall 2",
    start: "13:00",
    end: "15:00",
    date: "2026-02-13",
    Status: "Booking",
  },
  {
    id: 3,
    customer: "คุณมิน",
    place: "Studio Room",
    start: "18:00",
    end: "20:00",
    date: "2026-02-12",
    Status: "Canceled",
  },
  {
    id: 4,
    customer: "คุณxd",
    place: "Studio Room",
    start: "18:00",
    end: "20:00",
    date: "2026-02-12",
    Status: "Canceled",
  },
  {
    id: 5,
    customer: "คุณ3312",
    place: "Studio Room",
    start: "18:00",
    end: "20:00",
    date: "2026-02-12",
    Status: "Canceled",
  },
  {
    id: 6,
    customer: "บริษัท TechSoft",
    place: "Meeting Room B",
    start: "10:00",
    end: "12:00",
    date: "2026-02-14",
    Status: "Completed",
  },
  {
    id: 7,
    customer: "คุณแพรว",
    place: "Hall 1",
    start: "08:30",
    end: "11:30",
    date: "2026-02-15",
    Status: "Inprogress",
  },
  {
    id: 8,
    customer: "Startup XYZ",
    place: "Conference Room",
    start: "14:00",
    end: "17:00",
    date: "2026-02-15",
    Status: "Completed",
  },
  {
    id: 9,
    customer: "คุณบอย",
    place: "Studio Room",
    start: "12:00",
    end: "13:30",
    date: "2026-02-16",
    Status: "Booking",
  },
  {
    id: 10,
    customer: "Creative Team",
    place: "Hall 3",
    start: "16:00",
    end: "19:00",
    date: "2026-02-16",
    Status: "Completed",
  },
];

const statusStyle: Record<Booking["Status"], string> = {
  Booking: "bg-amber-100 text-amber-700",
  Inprogress: "bg-sky-100 text-sky-700",
  Canceled: "bg-rose-100 text-rose-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

const statusLabel: Record<Booking["Status"], string> = {
  Booking: "จองแล้ว",
  Inprogress: "กำลังดำเนินการ",
  Canceled: "ยกเลิก",
  Completed: "เสร็จสิ้น",
};

type SortKey = keyof Booking;
type Direction = "asc" | "desc";

function BookingTable() {
  const [todayOnly, setTodayOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [direction, setDirection] = useState<Direction>("asc");

  const today = new Date().toISOString().slice(0, 10);

  const filtered = todayOnly ? bookings.filter((b) => b.date === today) : bookings;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("th-TH-u-ca-gregory", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

  const sorted = useMemo(() => {
    const sortedData = [...filtered].sort((a, b) => {
      let valA: any = a[sortKey];
      let valB: any = b[sortKey];

      if (sortKey === "start" || sortKey === "end") {
        valA = valA.replace(":", "");
        valB = valB.replace(":", "");
      }

      if (sortKey === "Status") {
        const order: Record<Booking["Status"], number> = {
          Booking: 4,
          Inprogress: 3,
          Completed: 2,
          Canceled: 1,
        };
        valA = order[valA as Booking["Status"]];
        valB = order[valB as Booking["Status"]];
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

  const Arrow = ({ column }: { column: SortKey }) => (
    <span className="ml-1 text-xs">{sortKey === column ? (direction === "asc" ? "▲" : "▼") : "↕"}</span>
  );

  const Th = ({ label, column }: { label: string; column: SortKey }) => (
    <th onClick={() => handleSort(column)} className="p-4 cursor-pointer select-none hover:bg-white/10 transition">
      <div className="flex items-center gap-1">
        {label} <Arrow column={column} />
      </div>
    </th>
  );

  return (
    <div className="w-full space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTodayOnly(!todayOnly)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
          ${
            todayOnly
              ? "bg-violet-600 text-white shadow-lg shadow-violet-300/40 scale-105"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-violet-50"
          }`}
        >
          วันนี้
        </button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
            <tr className="text-left">
              <Th label="วันที่" column="date" />
              <Th label="ลูกค้า" column="customer" />
              <Th label="ชื่อสถานที่" column="place" />
              <Th label="เวลาเริ่ม" column="start" />
              <Th label="สิ้นสุดเวลา" column="end" />
              <Th label="สถานะ" column="Status" />
              <th className="p-4 text-center">จัดการ</th>
            </tr>
          </thead>

          <tbody className="divide-y bg-white">
            {sorted.map((b) => (
              <tr key={b.id} className="hover:bg-violet-50 transition-colors">
                <td className="p-4 font-medium text-gray-700">{formatDate(b.date)}</td>
                <td className="p-4 font-medium text-gray-700">{b.customer}</td>
                <td className="p-4">{b.place}</td>
                <td className="p-4">{b.start}</td>
                <td className="p-4">{b.end}</td>

                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[b.Status]}`}>
                    {statusLabel[b.Status]}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button className="px-3 py-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs transition">
                      Edit
                    </button>
                    <button className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs transition">
                      Del
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {sorted.map((b) => (
          <div key={b.id} className="rounded-2xl border border-gray-200 shadow-sm p-4 bg-white">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-800">{b.customer}</p>
                <p className="text-sm text-gray-500">{b.place}</p>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[b.Status]}`}>
                {statusLabel[b.Status]}
              </span>
            </div>

            {/*เพิ่ม date ใน mobile */}
            <div className="text-sm text-gray-600 mb-3 space-y-1">
              <p>
                วันที่: <span className="font-medium text-gray-800">{formatDate(b.date)}</span>
              </p>
              <p>เริ่ม: {b.start}</p>
              <p>สิ้นสุด: {b.end}</p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition">
                Edit
              </button>
              <button className="flex-1 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition">
                Del
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookingTable;
