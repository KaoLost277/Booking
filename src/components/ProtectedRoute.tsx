import type { ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import type { RootState } from '../store'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session } = useSelector((s: RootState) => s.auth)
  const location = useLocation()

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
