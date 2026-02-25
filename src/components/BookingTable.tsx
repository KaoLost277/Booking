import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import CustomButton from "./CustomButton";
import LoadingSpinner from "./LoadingSpinner";

type Booking = {
  id: number;
  customer: string;
  place: string;
  start: string;
  end: string;
  date: string;
  Status: "Booking" | "Inprogress" | "Canceled" | "Completed";
};

const statusStyle: Record<Booking["Status"], string> = {
  Booking: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  Inprogress: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  Canceled: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  Completed: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
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
  const bookState = useSelector((state: RootState) => state.book);
  const bookings: Booking[] = (bookState.data || []).map((item: any) => ({
    id: item.ID,
    customer: item.CustomerMaster.CustomerName ?? '-',
    place: item.LocationMaster.LocationName ?? '-',
    start: item.StartTime ?? '-',
    end: item.EndTime ?? '-',
    date: item.Date ?? '-',
    Status: (item.Status as Booking["Status"]) || 'Booking',
  }));

  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [direction, setDirection] = useState<Direction>("asc");

  const filtered = bookings;

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
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] transition-colors">
        <table className="w-full text-sm">
          <thead className="bg-[#f7f7f8] dark:bg-[#1a1a1a] border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
            <tr>
              <Th label="วันที่" column="date" />
              <Th label="ลูกค้า" column="customer" />
              <Th label="สถานที่" column="place" />
              <Th label="เวลาเริ่ม" column="start" />
              <Th label="สิ้นสุดเวลา" column="end" />
              <Th label="สถานะ" column="Status" />
              <th className="p-4 text-center text-xs font-medium uppercase tracking-wider text-[#6e6e80] dark:text-[#8e8ea0]">
                จัดการ
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#2a2a2a] bg-white dark:bg-[#0d0d0d]">
            {sorted.map((b) => (
              <tr
                key={b.id}
                className="hover:bg-[#f7f7f8] dark:hover:bg-[#1a1a1a] transition-colors"
              >
                <td className="p-4 font-medium text-[#0d0d0d] dark:text-[#ececf1]">
                  {formatDate(b.date)}
                </td>
                <td className="p-4 font-medium text-[#0d0d0d] dark:text-[#ececf1]">
                  {b.customer}
                </td>
                <td className="p-4 text-[#6e6e80] dark:text-[#8e8ea0]">
                  {b.place}
                </td>
                <td className="p-4 text-[#6e6e80] dark:text-[#8e8ea0] font-mono text-xs">
                  {b.start}
                </td>
                <td className="p-4 text-[#6e6e80] dark:text-[#8e8ea0] font-mono text-xs">
                  {b.end}
                </td>
                <td className="p-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${statusStyle[b.Status]}`}>
                    {statusLabel[b.Status]}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <CustomButton variant="secondary" className="!px-3 !py-1 text-xs">
                      Edit
                    </CustomButton>
                    <CustomButton variant="danger" className="!px-3 !py-1 text-xs">
                      Del
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
        {sorted.map((b) => (
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
              <p>เริ่ม: <span className="font-mono text-xs">{b.start}</span></p>
              <p>สิ้นสุด: <span className="font-mono text-xs">{b.end}</span></p>
            </div>

            <div className="flex gap-2 pt-3 border-t border-[#e5e5e5] dark:border-[#2a2a2a]">
              <CustomButton variant="secondary" fullWidth className="!py-2">
                Edit
              </CustomButton>
              <CustomButton variant="danger" fullWidth className="!py-2">
                Del
              </CustomButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookingTable;
