import type { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import type { RootState } from '../store'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isInitialized } = useSelector((s: RootState) => s.auth)
  const location = useLocation()

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0d0d0d]">
        <p className="text-[#6e6e80] dark:text-[#8e8ea0]">กำลังตรวจสอบข้อมูลการเข้าสู่ระบบ...</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
