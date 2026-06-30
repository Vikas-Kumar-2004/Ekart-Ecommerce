import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Verify from './pages/Verify'
import VerifyEmail from './pages/VerifyEmail'
import Product from './pages/Product'
import About from './pages/About'
import Cart from './pages/Cart'
import Dashboard from './pages/Dashboard'
import SingleProduct from './pages/SingleProduct'
import ProtectedRoute from './components/protectedRoute'
import AddProduct from './pages/Admin/AddProduct'
import AdminProduct from './pages/Admin/AdminProduct'
import AddressForm from './pages/AddressForm'
import Stepper from './components/Stepper'
import OrderSuccess from './pages/OrderSuccess'
import AdminOrders from './pages/Admin/AdminOrders'
import AdminUsers from './pages/Admin/AdminUsers'
import ShowUserOrders from './pages/Admin/ShowUserOrders'
import Profile from './pages/profile'
import UserInfo from './pages/Admin/UserInfo'
import AdminSales from './pages/Admin/AdminSales'
import Footer from './components/Footer'
import MyOrder from './pages/MyOrder'

const router = createBrowserRouter([
  {
    path: '/',
    element: <><Navbar /><Home /><Footer/></>
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/signup',
    element: <Signup />
  },
  {
    path: '/verify',
    element: <Verify />
  },
  {
    path: '/verify/:token',
    element: <VerifyEmail />
  },
  {
    path: '/products',
    element: <><Navbar /><Product /><Footer/></>
  },
  {
    path: '/products/:id',
    element: <><Navbar /><SingleProduct /></>
  },
  {
    path: '/about',
    element: <><Navbar /><About /></>
  },
  {
    path: '/profile/:userId',
    element: <ProtectedRoute><Navbar /><Profile/></ProtectedRoute>
  },
  {
    path: '/cart',
    element: <ProtectedRoute><Navbar /><Cart /></ProtectedRoute>
  },
  {
    path: "/checkout",
    element: <ProtectedRoute><Navbar /><Stepper /></ProtectedRoute>
  },
  {
    path: '/address',
    element: <ProtectedRoute><AddressForm /></ProtectedRoute>
  },
  {
    path: '/order-success',
    element: <ProtectedRoute><OrderSuccess /></ProtectedRoute>
  },
  {
    path: '/orders',
    element: <ProtectedRoute><Navbar /><MyOrder /></ProtectedRoute>
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute adminOnly={true}><Navbar /><Dashboard /></ProtectedRoute>,
    children: [
      {
        path: "sales",
        element: <><AdminSales/></>
      },
      {
        path: "add-product",
        element: <><AddProduct /></>
      },
      {
        path: "products",
        element: <><AdminProduct /></>
      },
      {
        path: "orders",
        element: <><AdminOrders /></>
      },
      {
        path: "users/orders/:userId",
        element: <><ShowUserOrders /></>
      },
      {
        path: "users",
        element: <><AdminUsers /></>
      },
      {
        path: "users/:id",
        element: <><UserInfo /></>
      },   
    ]
  },
])

const App = () => {
  return (
    <div >
      <RouterProvider router={router} />
    </div>
  )
}

export default App
