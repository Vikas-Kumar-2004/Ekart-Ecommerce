import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Edit, Eye, Search} from 'lucide-react';
import UserLogo from '../../assets/user.jpg'

const AdminUsers = () => {
    const [users, setUsers] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const navigate = useNavigate()

    const filteredUsers = users.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getAllUsers = async () => {
        const accessToken = localStorage.getItem("accessToken")
        try {
            const res = await axios.get(`${import.meta.env.VITE_URL}/api/v1/user/all-user`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            if (res.data.success) {
                setUsers(res.data.users)
            }
        } catch (error) {
            console.log(error);

        }
    }
    useEffect(() => {
        getAllUsers()
    }, [])

    console.log(users);

    return (
        <div className='w-full md:pl-[350px] py-20 px-4 md:pr-10 mx-auto '>
            <h1 className='font-bold text-2xl'>User Management</h1>
            <p>View and manage registered users</p>
            <div className='flex relative w-full md:w-[300px] mt-6'>
                <Search className='absolute left-2 top-2 text-gray-600 w-5' />
                <Input className='pl-10'
                    placeholder='Search Users...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-7'>
                {
                    filteredUsers?.map((user) => {
                        return <div key={user.id} className='bg-pink-100 p-5 rounded-lg overflow-hidden'>
                            <div className='flex items-center gap-3'>
                                <img src={user?.profilePic || UserLogo} alt="" className='rounded-full w-16 h-16 shrink-0 object-cover border-2 border-pink-600' />
                                <div className='min-w-0 flex-1'>
                                    <h1 className='font-semibold text-lg truncate'>{user?.firstName} {user?.lastName}</h1>
                                    <h3 className='text-gray-600 text-sm truncate'>{user?.email}</h3>
                                </div>
                            </div>
                            <div className='flex flex-wrap sm:flex-nowrap gap-3 mt-4'>
                                <Button onClick={() => navigate(`/dashboard/users/${user?.id}`)} variant='outline' className="flex-1"><Edit className="w-4 h-4 mr-2" />Edit</Button>
                                <Button onClick={() => navigate(`/dashboard/users/orders/${user?.id}`)} className="flex-1"><Eye className="w-4 h-4 mr-2"/>Orders</Button>
                            </div>
                        </div>
                    })
                }
            </div>
        </div>
    )
}

export default AdminUsers
