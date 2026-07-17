import Sidebar from '@/components/Sidebar'
import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, PackagePlus, PackageSearch, Users, UserPlus } from 'lucide-react'
import { FaRegEdit } from 'react-icons/fa'

const Dashboard = () => {

  return (
    <div className='flex flex-col md:flex-row min-h-screen'>
      {/* Mobile Horizontal Navigation */}
      <div className='md:hidden flex overflow-x-auto gap-2 bg-white border-b border-gray-200 p-3 sticky top-[60px] z-10 shadow-sm mt-[60px] scrollbar-hide'>
        <NavLink to='/dashboard/sales' className={({ isActive }) => `flex-shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${isActive ? 'bg-pink-600 text-white border-pink-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}>
          <LayoutDashboard size={16} /> Dashboard
        </NavLink>
        <NavLink to='/dashboard/add-product' className={({ isActive }) => `flex-shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${isActive ? 'bg-pink-600 text-white border-pink-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}>
          <PackagePlus size={16} /> Add Product
        </NavLink>
        <NavLink to='/dashboard/products' className={({ isActive }) => `flex-shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${isActive ? 'bg-pink-600 text-white border-pink-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}>
          <PackageSearch size={16} /> Products
        </NavLink>
        <NavLink to='/dashboard/users' className={({ isActive }) => `flex-shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${isActive ? 'bg-pink-600 text-white border-pink-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}>
          <Users size={16} /> Users
        </NavLink>
        <NavLink to='/dashboard/orders' className={({ isActive }) => `flex-shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${isActive ? 'bg-pink-600 text-white border-pink-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}>
          <FaRegEdit size={16} /> Orders
        </NavLink>
        <NavLink to='/dashboard/create-admin' className={({ isActive }) => `flex-shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${isActive ? 'bg-pink-600 text-white border-pink-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}>
          <UserPlus size={16} /> Create Admin
        </NavLink>
      </div>

      <div className='flex flex-1 min-w-0'>
        <div className='hidden md:block'>
          <Sidebar />
        </div>
        <div className='flex-1 min-w-0 overflow-hidden'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
