import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setUser } from '@/redux/userSlice';
import axios from 'axios';
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import userLogo from '../assets/user.jpg'
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MyOrder from './MyOrder';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.user)
    const dispatch = useDispatch()
    const params = useParams()
    const userId = params.userId
    const [updateUser, setUpdateUser] = useState({
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        phoneNo: user?.phoneNo,
        address: user?.address,
        city: user?.city,
        zipCode: user?.zipCode,
        profilePic: user?.profilePic,
        role: user?.role
    });

    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);

    const handleChange = (e) => {
        setUpdateUser({ ...updateUser, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setUpdateUser({ ...updateUser, profilePic: URL.createObjectURL(selectedFile) }); // preview only
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const accessToken = localStorage.getItem("accessToken");

        try {
            // Use FormData for text + file
            const formData = new FormData();
            formData.append("firstName", updateUser.firstName);
            formData.append("lastName", updateUser.lastName);
            formData.append("email", updateUser.email);
            formData.append("phoneNo", updateUser.phoneNo);
            formData.append("address", updateUser.address);
            formData.append("city", updateUser.city);
            formData.append("zipCode", updateUser.zipCode);
            formData.append("role", updateUser.role);

            if (file) {
                formData.append("file", file); // image file for backend multer
            }

            const res = await axios.put(
                `${import.meta.env.VITE_URL}/api/v1/user/update/${userId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                dispatch(setUser(res.data.user));
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className='pt-20 min-h-screen bg-gray-100 p-4 md:p-8'>
            <div className="max-w-7xl mx-auto mb-6">
                <Button onClick={() => navigate(-1)}><ArrowLeft /></Button>
            </div>
            <Tabs defaultValue="profile" className="max-w-7xl mx-auto items-center">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                </TabsList>
                <TabsContent value="profile">
                    <div className=''>
                        <div className="flex flex-col justify-center items-center bg-gray-100 ">
                            <h1 className='font-bold mb-7 text-2xl text-gray-800'>Update Profile</h1>
                            <div className="w-full flex flex-col md:flex-row gap-10 justify-between items-center md:items-start px-4 md:px-7 max-w-2xl ">
                                {/* Profile Picture */}
                                <div className="flex flex-col items-center mb-4 md:mb-0">
                                    <img
                                        src={updateUser?.profilePic || userLogo}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full object-cover border-4 border-pink-800"
                                    />
                                    <Label className="mt-4 cursor-pointer bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700">
                                        Change Picture
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                    </Label>
                                </div>

                                {/* Profile Form */}
                                <form className="space-y-4 shadow-lg p-5 rounded-lg bg-white w-full md:flex-1" onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="block text-sm font-medium">First Name</Label>
                                            <Input
                                                type="text"
                                                name="firstName"
                                                value={updateUser.firstName}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-3 py-2 mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="block text-sm font-medium">Last Name</Label>
                                            <Input
                                                type="text"
                                                name="lastName"
                                                value={updateUser.lastName}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-3 py-2 mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium">Email</Label>
                                        <Input
                                            type="email"
                                            name="email"
                                            value={updateUser.email}
                                            disabled
                                            className="w-full border rounded-lg px-3 py-2 mt-1 bg-gray-100 cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium">Phone Number</Label>
                                        <Input
                                            type="text"
                                            name="phoneNo"
                                            placeholder='Enter Your Contact Number'
                                            value={updateUser.phoneNo}
                                            onChange={handleChange}
                                            className="w-full border rounded-lg px-3 py-2 mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label className="block text-sm font-medium">Address</Label>
                                        <Input
                                            type="text"
                                            name="address"
                                            placeholder='Enter Your Address'
                                            value={updateUser.address}
                                            onChange={handleChange}
                                            className="w-full border rounded-lg px-3 py-2 mt-1"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label className="block text-sm font-medium">City</Label>
                                            <Input
                                                type="text"
                                                name="city"
                                                placeholder='Enter Your City'
                                                value={updateUser.city}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-3 py-2 mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label className="block text-sm font-medium">Zip Code</Label>
                                            <Input
                                                type="text"
                                                name="zipCode"
                                                placeholder='Enter Your ZipCode'
                                                value={updateUser.zipCode}
                                                onChange={handleChange}
                                                className="w-full border rounded-lg px-3 py-2 mt-1"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full mt-4 bg-pink-600 hover:bg-pink-700  text-white font-semibold py-2 rounded-lg"
                                    >
                                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update Profile"}
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="orders">
                    <MyOrder/>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default Profile
