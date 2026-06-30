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
               navigate('/')
               dispatch(setUser(res.data.user))
               localStorage.setItem("accessToken", res.data.token)
               toast.success(res.data.message)
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
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>

                </CardHeader>
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
                                <Link
                                    to="#"
                                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                >
                                    Forgot your password?
                                </Link>
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
                    <Button onClick={submitHandler} type="submit" className="w-full bg-pink-600 hover:bg-pink-500">
                         {
                            loading ? <><Loader2 className='h-4 w-4 animate-spin mr-2' />Please wait</> : 'Login'
                        }
                    </Button>
                    {/* <Button variant="outline" className="w-full">
                        Login with Google
                    </Button> */}
                    <p className='text-gray-700 text-sm'>Don't have an account? <Link to={'/signup'} className='hover:underline cursor-pointer text-pink-800'>signup</Link></p>
                </CardFooter>
            </Card>
        </div>
    )
}

export default Login




