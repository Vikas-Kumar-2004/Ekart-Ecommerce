import { ChartColumnBig, FolderPlus, LayoutDashboard, PackagePlus, PackageSearch, SquareUser, Users } from 'lucide-react'
import { LiaCommentSolid } from "react-icons/lia";
import React from 'react'
import { NavLink } from 'react-router-dom'
import { FaEdit, FaRegEdit } from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`fixed top-0 left-0 h-screen border-r dark:bg-gray-800 bg-pink-50 border-pink-200 z-50 w-[300px] p-6 md:p-10 space-y-2 transition-transform duration-300 ease-in-out
        md:translate-x-0 md:block ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className='flex justify-between items-center md:hidden mb-6 mt-4 px-3'>
          <span className="font-bold text-xl text-pink-600">Menu</span>
          <button onClick={onClose} className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className='text-center pt-4 md:pt-10 px-3 space-y-2'>
          <NavLink to='/dashboard/sales' onClick={onClose} className={({ isActive }) => `text-xl  ${isActive ? "bg-pink-600 dark:bg-gray-900 text-gray-200" : "bg-transparent"} flex items-center gap-2 font-bold cursor-pointer p-3 rounded-2xl w-full`}>
            <LayoutDashboard/>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to='/dashboard/add-product' onClick={onClose} className={({ isActive }) => `text-xl  ${isActive ? "bg-pink-600 dark:bg-gray-900 text-gray-200" : "bg-transparent"} flex items-center gap-2 font-bold cursor-pointer p-3 rounded-2xl w-full`}>
            <PackagePlus/>
            <span>Add Product</span>
          </NavLink>
          <NavLink to='/dashboard/products' onClick={onClose} className={({ isActive }) => `text-xl  ${isActive ? "bg-pink-600 dark:bg-gray-900 text-gray-200" : "bg-transparent"} flex items-center gap-2 font-bold cursor-pointer p-3 rounded-2xl w-full`}>
            <PackageSearch/>
            <span>Products</span>
          </NavLink>
          <NavLink to='/dashboard/users' onClick={onClose} className={({ isActive }) => `text-xl  ${isActive ? "bg-pink-600 dark:bg-gray-900 text-gray-200" : "bg-transparent"} flex items-center gap-2 font-bold cursor-pointer p-3 rounded-2xl w-full`}>
            <Users/>
            <span>Users</span>
          </NavLink>
          <NavLink to='/dashboard/orders' onClick={onClose} className={({ isActive }) => `text-xl  ${isActive ? "bg-pink-600 dark:bg-gray-900 text-gray-200" : "bg-transparent"} flex items-center gap-2 font-bold cursor-pointer p-3 rounded-2xl w-full`}>
            <FaRegEdit/>
            <span>Orders</span>
          </NavLink>
        </div>
      </div>
    </>
  )
}

export default Sidebar
