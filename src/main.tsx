import { createRoot } from "react-dom/client"
import { RouterProvider, createBrowserRouter } from "react-router-dom"
import "./index.css"
import {PATH} from "../src/constants"

import Hello from "./components/Hello"
import Login from "./Pages/Login"
import BookingLayout from "./Pages/Booking"
import SignUp from "./Pages/SignUp"
import { store } from "./store"
import { Provider } from "react-redux"
import ProtectedRoute from "./components/ProtectedRoute"
import { createClient } from "./lib/client"
import { setSession } from "./features/authSlice"
import Test from "./Pages/test"

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
    element: (
      <ProtectedRoute>
        <BookingLayout />
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
  {
    path: "/hello/:id",
    element: <Hello />,
  },
  {
    path: "/Test",
    element: <Test />,
   
  }
])

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
)
