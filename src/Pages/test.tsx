import { useDispatch } from 'react-redux'
import { bookGet } from '../features/bookSlice'
import type { AppDispatch } from '../store'

export default function Test() {

    const dispatch = useDispatch<AppDispatch>()

    const getdata = async () => {
        try {
            const result = (await dispatch(bookGet())).payload
            console.log(result) // <-- ได้ data จริง
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <button
            onClick={getdata}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-[#6e6e80] dark:text-[#8e8ea0] bg-transparent border border-[#e5e5e5] dark:border-[#2a2a2a] hover:bg-[#f7f7f8] dark:hover:bg-[#2a2a2a] hover:text-[#0d0d0d] dark:hover:text-[#ececf1] transition-colors cursor-pointer"
        >
            กดเพิ่มเทส
        </button>
    )
}
