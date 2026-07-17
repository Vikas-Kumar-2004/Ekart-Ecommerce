import { ChartColumnBig, FolderPlus, LayoutDashboard, PackagePlus, PackageSearch, SquareUser, Users, UserPlus } from 'lucide-react'
import { LiaCommentSolid } from "react-icons/lia";
import React from 'react'
import { NavLink } from 'react-router-dom'
import { FaEdit, FaRegEdit } from 'react-icons/fa';

const Sidebar = () => {
  return (
    <>
      {/* Sidebar Container */}

      {/* Sidebar Container */}
      <div 
        className={`fixed top-0 left-0 h-screen border-r dark:bg-gray-800 bg-pink-50 border-pink-200 z-50 w-[300px] p-6 md:p-10 space-y-2 transition-transform duration-300 ease-in-out md:translate-x-0 md:block`}
      >
        
        <div className='text-center pt-4 md:pt-10 px-3 space-y-2'>
          <NavLink to='/dashboard/sales' className={({ isActive }) => `text-xl  ${isActive ? "bg-pink-600 dark:bg-gray-900 text-gray-200" : "bg-transparent"} flex items-center gap-2 font-bold cursor-pointer p-3 rounded-2xl w-full`}>
            <LayoutDashboard/>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to='/dashboard/add-product' className={({ isActive }) => `text-xl  ${isActive ? "bg-pink-600 dark:bg-gray-900 text-gray-200" : "bg-transparent"} flex items-center gap-2 font-bold cursor-pointer p-3 rounded-2xl w-full`}>
            <PackagePlus/>
            <span>Add Product</span>
          </NavLink>
          <NavLink to='/dashboard/products' className={({ isActive }) => `text-xl  ${isActive ? "bg-pink-600 dark:bg-gray-900 text-gray-200" : "bg-transparent"} flex items-center gap-2 font-bold cursor-pointer p-3 rounded-2xl w-full`}>
            <PackageSearch/>
            <span>Products</span>
          </NavLink>
          <NavLink to='/dashboard/users' className={({ isActive }) => `text-xl  ${isActive ? "bg-pink-600 dark:bg-gray-900 text-gray-200" : "bg-transparent"} flex items-center gap-2 font-bold cursor-pointer p-3 rounded-2xl w-full`}>
            <Users/>
            <span>Users</span>
          </NavLink>
          <NavLink to='/dashboard/orders' className={({ isActive }) => `text-xl  ${isActive ? "bg-pink-600 dark:bg-gray-900 text-gray-200" : "bg-transparent"} flex items-center gap-2 font-bold cursor-pointer p-3 rounded-2xl w-full`}>
            <FaRegEdit/>
            <span>Orders</span>
          </NavLink>
          <NavLink to='/dashboard/create-admin' className={({ isActive }) => `text-xl  ${isActive ? "bg-pink-600 dark:bg-gray-900 text-gray-200" : "bg-transparent"} flex items-center gap-2 font-bold cursor-pointer p-3 rounded-2xl w-full`}>
            <UserPlus/>
            <span>Create Admin</span>
          </NavLink>
        </div>
      </div>
    </>
  )
}

export default Sidebar
