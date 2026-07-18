import React, { useState, useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import axios from 'axios'
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
import ProtectedRoute from './components/ProtectedRoute'
import AddProduct from './pages/Admin/AddProduct'
import AdminProduct from './pages/Admin/AdminProduct'
import AddressForm from './pages/AddressForm'
import Stepper from './components/Stepper'
import OrderSuccess from './pages/OrderSuccess'
import AdminOrders from './pages/Admin/AdminOrders'
import AdminUsers from './pages/Admin/AdminUsers'
import ShowUserOrders from './pages/Admin/ShowUserOrders'
import Profile from './pages/Profile'
import UserInfo from './pages/Admin/UserInfo'
import AdminSales from './pages/Admin/AdminSales'
import AdminList from './pages/Admin/AdminList'
import CreateAdmin from './pages/Admin/CreateAdmin'
import Footer from './components/Footer'
import MyOrder from './pages/MyOrder'
import ForgotPassword from './pages/ForgotPassword'
import ErrorPage from './pages/ErrorPage'
import SplashScreen from './components/SplashScreen'

const rawRoutes = [
  {
    path: '/',
    element: <><Navbar /><Home /><Footer /></>
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
    path: '/forgot-password',
    element: <ForgotPassword />
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
    element: <><Navbar /><Product /><Footer /></>
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
    element: <ProtectedRoute><Navbar /><Profile /></ProtectedRoute>
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
        element: <><AdminSales /></>
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
      {
        path: "admins",
        element: <><AdminList /></>
      },
      {
        path: "admins/create",
        element: <><CreateAdmin /></>
      },
    ]
  },
  {
    path: '*',
    element: <><Navbar /><ErrorPage /><Footer /></>
  },
];

const router = createBrowserRouter(
  rawRoutes.map(route => ({
    ...route,
    errorElement: <ErrorPage />
  }))
);

const App = () => {
  const [isBackendReady, setIsBackendReady] = useState(false);

  useEffect(() => {
    let timeoutId;
    
    const checkHealth = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_URL}/health`);
        if (res.status === 200) {
          setIsBackendReady(true);
        } else {
          timeoutId = setTimeout(checkHealth, 2000);
        }
      } catch (error) {
        // Backend not ready yet, keep trying
        timeoutId = setTimeout(checkHealth, 2000);
      }
    };

    checkHealth();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  if (!isBackendReady) {
    return <SplashScreen />;
  }

  return (
    <div >
      <RouterProvider router={router} />
    </div>
  )
}

export default App
