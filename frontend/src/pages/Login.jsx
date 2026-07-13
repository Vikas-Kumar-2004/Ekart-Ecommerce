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
import { setUser } from "@/redux/userSlice"
import axios from "axios"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import React, { useState } from 'react'
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"

const Login = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const submitHandler = async(e) => {
        e.preventDefault()
        console.log(formData);
        try {
            setLoading(true)
            const res = await axios.post(`${import.meta.env.VITE_URL}/api/v1/user/login`, formData, {
                headers:{
                    "Content-Type":"application/json"
                }
            })
            if(res.data.success){
               localStorage.setItem("accessToken", res.data.token)
               localStorage.setItem("refreshToken", res.data.refreshToken)
               dispatch(setUser(res.data.user))
               navigate('/')
               toast.success(res.data.message)
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message)
            } else {
                toast.error("An error occurred during login")
            }
            console.log(error);          
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center h-screen bg-pink-100">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>

                </CardHeader>
                <form onSubmit={submitHandler}>
                    <CardContent>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name='email'
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
                                        showPassword ? <EyeOff onClick={() => { setShowPassword(false) }
                                        } className='w-5 h-5 text-gray-700 absolute right-5 bottom-2 cursor-pointer' /> :
                                            <Eye onClick={() => setShowPassword(true)} className='w-5 h-5 text-gray-700 absolute right-5 bottom-2 cursor-pointer' />
                                    }
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <div className="flex justify-end px-6 pb-2 -mt-4">
                        <Link to="/forgot-password" className="text-sm text-pink-600 hover:text-pink-800 font-medium">Forgot Password?</Link>
                    </div>
                    <CardFooter className="flex-col gap-2">
                        <Button disabled={loading} type="submit" className="w-full bg-pink-600 hover:bg-pink-500">
                            {
                                loading ? <><Loader2 className='h-4 w-4 animate-spin mr-2' />Please wait</> : 'Login'
                            }
                        </Button>
                        <p className='text-gray-700 text-sm'>Don't have an account? <Link to={'/signup'} className='hover:underline cursor-pointer text-pink-800'>signup</Link></p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}

export default Login




