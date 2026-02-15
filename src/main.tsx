import { createRoot } from "react-dom/client"
import { RouterProvider, createBrowserRouter } from "react-router-dom"
import "./index.css"

import Hello from "./components/Hello"
import Login, { action as loginAction } from "./Pages/Login"
import BookingLayout from "./Pages/Booking"
import SignUp, { action as signupAction } from "./Pages/SignUp"
import { store } from "./store"
import { Provider } from "react-redux"

// สร้าง Data Router
const router = createBrowserRouter([
  {
    path: "/",
    element: <BookingLayout />,
  },
  {
    path: "/login",
    element: <Login />,
    action: loginAction,
  },
  {
    path: "/SignUp",
    element: <SignUp />,
    action: signupAction,
  },
  {
    path: "/hello/:id",
    element: <Hello />,
  },
])

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
)
