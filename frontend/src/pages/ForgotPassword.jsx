import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import axios from 'axios'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const ForgotPassword = () => {
    const [formData, setFormData] = useState({
        email: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const changeHandler = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const submitHandler = async (e) => {
        e.preventDefault()

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Passwords do not match!")
            return
        }

        try {
            setLoading(true)
            const res = await axios.post(
                `${import.meta.env.VITE_URL}/api/v1/user/change-password/${formData.email}`,
                {
                    newPassword: formData.newPassword,
                    confirmPassword: formData.confirmPassword
                }
            )

            if (res.data.success) {
                toast.success("Password Reset Successfully!")
                navigate('/login')
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message)
            } else {
                toast.error("Failed to reset password. Please try again.")
            }
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center h-screen bg-pink-100">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>Reset Password</CardTitle>
                    <CardDescription>
                        Enter your email and create a new password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="m@example.com"
                                value={formData.email}
                                onChange={changeHandler}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                name="newPassword"
                                placeholder="••••••••"
                                value={formData.newPassword}
                                onChange={changeHandler}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={changeHandler}
                                required
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                    <Button onClick={submitHandler} disabled={loading} type="submit" className="w-full bg-pink-600 hover:bg-pink-500">
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Please wait</>
                        ) : 'Reset Password'}
                    </Button>
                    <p className='text-gray-700 text-sm'>
                        Remember your password?{' '}
                        <Link to={'/login'} className='hover:underline cursor-pointer text-pink-800'>Login</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}

export default ForgotPassword
