import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Plus, Search, Trash2 } from 'lucide-react';
import UserLogo from '../../assets/user.jpg'
import { toast } from 'sonner'
import { useSelector } from 'react-redux';

const AdminList = () => {
    const [admins, setAdmins] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [deleteAdminId, setDeleteAdminId] = useState(null)
    const navigate = useNavigate()
    const { user: currentUser } = useSelector(state => state.user)

    const filteredAdmins = admins.filter(admin =>
        `${admin.firstName} ${admin.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getAllAdmins = async () => {
        const accessToken = localStorage.getItem("accessToken")
        try {
            const res = await axios.get(`${import.meta.env.VITE_URL}/api/v1/user/admins`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            if (res.data.success) {
                setAdmins(res.data.admins)
            }
        } catch (error) {
            console.log("Error fetching admins", error);
        }
    }

    useEffect(() => {
        getAllAdmins()
    }, [])

    const deleteAdmin = async (id) => {
        const accessToken = localStorage.getItem("accessToken")
        try {
            const res = await axios.delete(`${import.meta.env.VITE_URL}/api/v1/user/admins/${id}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            if (res.data.success) {
                toast.success(res.data.message)
                getAllAdmins() // Refresh the list
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete admin")
            console.log(error);
        } finally {
            setDeleteAdminId(null)
        }
    }

    return (
        <div className='w-full md:pl-[350px] py-20 px-4 md:pr-10 mx-auto '>
            <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6'>
                <div>
                    <h1 className='font-bold text-3xl'>Admin Management</h1>
                    <p className='text-gray-600 mt-1'>View and manage administrators</p>
                </div>
                <Button onClick={() => navigate('/dashboard/admins/create')} className='bg-pink-600 hover:bg-pink-700 text-white'>
                    <Plus className='w-5 h-5 mr-1' /> Create Admin
                </Button>
            </div>

            <div className='flex relative w-full md:w-[350px] mt-6'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5' />
                <Input className='pl-10 h-11'
                    placeholder='Search Admins by name or email...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {
                filteredAdmins.length === 0 ? (
                    <div className='mt-10 text-center text-gray-500'>
                        <p>No admins found.</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-7'>
                        {
                            filteredAdmins.map((admin) => {
                                const isSelf = currentUser && currentUser.id === admin.id;

                                return <div key={admin.id} className={`bg-white p-5 rounded-xl border ${isSelf ? 'border-pink-300 shadow-sm' : 'border-gray-200'} flex flex-col`}>
                                    <div className='flex items-center gap-4'>
                                        <img src={admin?.profilePic || UserLogo} alt="" className='rounded-full w-16 h-16 shrink-0 object-cover border-2 border-pink-100' />
                                        <div className='min-w-0 flex-1'>
                                            <h1 className='font-semibold text-lg truncate text-gray-900'>
                                                {admin?.firstName} {admin?.lastName} {isSelf && <span className="text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full ml-2 align-middle">You</span>}
                                            </h1>
                                            <h3 className='text-gray-500 text-sm truncate'>{admin?.email}</h3>
                                        </div>
                                    </div>
                                    <div className='flex flex-wrap sm:flex-nowrap gap-3 mt-6 pt-4 border-t border-gray-100'>
                                        <Button
                                            onClick={() => setDeleteAdminId(admin.id)}
                                            variant='outline'
                                            className={`flex-1 ${isSelf ? 'opacity-50 cursor-not-allowed' : 'text-red-600 hover:bg-red-50 hover:text-red-700 border-red-100'}`}
                                            disabled={isSelf}
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            })
                        }
                    </div>
                )
            }

            <AlertDialog open={!!deleteAdminId} onOpenChange={(open) => !open && setDeleteAdminId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this admin? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteAdmin(deleteAdminId)} className="bg-red-600 hover:bg-red-700 text-white">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

export default AdminList
