import Sidebar from '@/components/Sidebar'
import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className='flex flex-col md:flex-row min-h-screen'>
      {/* Mobile Top Bar for Sidebar Toggle */}
      <div className='md:hidden flex items-center justify-between bg-white border-b border-gray-200 p-4 sticky top-[60px] z-10 shadow-sm mt-[60px]'>
        <h1 className='font-bold text-lg text-pink-600'>Admin Dashboard</h1>
        <Button variant="outline" size="sm" onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-2">
          <Menu className='w-4 h-4' />
          Menu
        </Button>
      </div>

      <div className='flex flex-1'>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className='flex-1 w-full overflow-hidden'>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
