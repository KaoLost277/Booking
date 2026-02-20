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
        <button onClick={getdata}>กดเพิ่มเทส</button>
    )
}
