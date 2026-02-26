import { createRoot } from "react-dom/client"
import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom"
import "./index.css"
import { PATH } from "../src/constants"


import Login from "./Pages/Login"
import BookingLayout from "./Pages/Booking"
import SignUp from "./Pages/SignUp"
import { store } from "./store"
import { Provider } from "react-redux"
import ProtectedRoute from "./components/ProtectedRoute"
import { createClient } from "./lib/client"
import { setSession } from "./features/authSlice"

import CustomerMaster from "./Pages/CustomerMaster"
import LocationMaster from "./Pages/LocationMaster"
import JobTypeMaster from "./Pages/JobTypeMaster"
import Dashboard from "./Pages/Dashboard"
import { ThemeProvider } from "./contexts/ThemeContext"

// initialize supabase client and sync session to redux store
const supabase = createClient()
supabase.auth.getSession().then(({ data }) => {
  store.dispatch(setSession(data.session))
})
supabase.auth.onAuthStateChange((_event, session) => {
  store.dispatch(setSession(session))
})

// สร้าง Data Router
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to={PATH.HOME} replace />,
  },
  {
    path: PATH.DASHBOARD,
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: PATH.BOOKING,
    element: (
      <ProtectedRoute>
        <BookingLayout />
      </ProtectedRoute>
    ),
  },
  {
    path: PATH.CUSTOMER,
    element: (
      <ProtectedRoute>
        <CustomerMaster />
      </ProtectedRoute>
    ),
  },
  {
    path: PATH.LOCATION,
    element: (
      <ProtectedRoute>
        <LocationMaster />
      </ProtectedRoute>
    ),
  },
  {
    path: PATH.JOB_TYPE,
    element: (
      <ProtectedRoute>
        <JobTypeMaster />
      </ProtectedRoute>
    ),
  },
  {
    path: PATH.LOGIN,
    element: <Login />,

  },
  {
    path: PATH.SIGNUP,
    element: <SignUp />,

  },

])

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </ThemeProvider>
)
