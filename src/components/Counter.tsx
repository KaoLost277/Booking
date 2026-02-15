import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '../hooks'
import { decrement, increment, incrementByAmount } from '../features/counterSlice'

function Counter() {
  // ดึงค่าจาก Redux store
  const count = useAppSelector((state) => state.counter.value)

  // เตรียม dispatch ไว้ส่ง action
  const dispatch = useAppDispatch()

  // state สำหรับ input
  const [amount, setAmount] = useState<number>(0)

  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      <h2>Redux Counter</h2>

      <div>
        <button onClick={() => dispatch(decrement())}>-</button>

        <span style={{ margin: '0 20px', fontSize: '20px' }}>
          {count}
        </span>
        <button type="button" className="flex-none rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500" onClick={() => dispatch(increment())}>Add</button>
        <button onClick={() => dispatch(increment())}>+</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <input
          type="string"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        <button
          onClick={() => dispatch(incrementByAmount(amount))}
          style={{ marginLeft: '10px' }}
        >
          Add Amount
        </button>
      </div>
    </div>
  )
}
export default Counter
