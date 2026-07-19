import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { useDispatch } from "react-redux"
import { setUser } from "@/redux/userSlice"
import { setCart } from "@/redux/productSlice"

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const submitHandler = async (e) => {
        e.preventDefault()
        console.log(formData);
        try {
            setLoading(true)
            const res = await axios.post(`${import.meta.env.VITE_URL}/api/v1/user/register`, formData, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (res.data.success) {
                dispatch(setUser(res.data.user))
                localStorage.setItem("accessToken", res.data.user.token)
                localStorage.setItem("refreshToken", res.data.user.refreshToken)
                toast.success(res.data.message)

                const pendingItemStr = localStorage.getItem('pendingCartItem');
                if (pendingItemStr) {
                    try {
                        const pendingItem = JSON.parse(pendingItemStr);
                        const cartRes = await axios.post(`${import.meta.env.VITE_URL}/api/v1/cart/add`, pendingItem, {
                            headers: { Authorization: `Bearer ${res.data.user.token}` }
                        });
                        if (cartRes.data.success) {
                            try { dispatch(setCart(cartRes.data.cart)); } catch (e) {}
                            localStorage.removeItem('pendingCartItem');
                            toast.success("Item added to cart automatically");
                            navigate('/cart', { replace: true });
                            return;
                        }
                    } catch (err) {
                        console.error("Failed to add pending item", err);
                        localStorage.removeItem('pendingCartItem');
                    }
                } else {
                    const redirectUrl = localStorage.getItem('redirectUrl');
                    if (redirectUrl) {
                        localStorage.removeItem('redirectUrl');
                        if (redirectUrl === 'profile') {
                            navigate(`/profile/${res.data.user.id}`, { replace: true });
                        } else {
                            navigate(redirectUrl, { replace: true });
                        }
                        return;
                    }
                }

                navigate('/', { replace: true })
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center h-screen bg-pink-100">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Create your account</CardTitle>
                    <CardDescription>
                        Enter given details below to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-3">
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='grid gap-2'>
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    name='firstName'
                                    type="text"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div className='grid gap-2'>
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>                      
                            </div>
                            <div className='relative'>
                                <Input
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder='Create a password'
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                />
                                {
                                    showPassword ? <EyeOff onClick={() => { setShowPassword(false), console.log('clicked') }
                                    } className='w-5 h-5 text-gray-700 absolute right-5 bottom-2' /> :
                                        <Eye onClick={() => setShowPassword(true)} className='w-5 h-5 text-gray-700 absolute right-5 bottom-2' />

                                }
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button type="submit" onClick={submitHandler} className="w-full cursor-pointer bg-pink-600 hover:bg-pink-500">
                        {
                            loading ? <><Loader2 className='h-4 w-4 animate-spin mr-2' />Please wait</> : 'Signup'
                        }
                    </Button>
                    <p className='text-gray-700 text-sm'>Already have an account? <Link to={'/login'} replace className='hover:underline  cursor-pointer text-pink-800'>Login</Link></p>
                </CardFooter>
            </Card>
        </div>
    )
}

export default Signup
