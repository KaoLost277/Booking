import { createRoot } from "react-dom/client"
import { RouterProvider, createBrowserRouter } from "react-router-dom"
import "./index.css"

import Hello from "./components/Hello"
import Login from "./Pages/Login"
import BookingLayout from "./Pages/Booking"
import SignUp from "./Pages/SignUp"
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
   
  },
  {
    path: "/SignUp",
    element: <SignUp />,
   
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
