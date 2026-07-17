import { ShoppingCart, Menu, X, Home, ShoppingBag, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { setUser } from '@/redux/userSlice'
import { setCart } from '@/redux/productSlice'

const Navbar = () => {
    const { user } = useSelector(store => store.user)
    const { cart } = useSelector(store => store.product)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const admin = user?.role === "admin" ? true : false
    const API = `${import.meta.env.VITE_URL}/api/v1/cart/get`;
    const accessToken = localStorage.getItem('accessToken')

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const logoutHandler = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_URL}/api/v1/user/logout`, {}, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            if (res.data.success) {
                toast.success(res.data.message)
            }
        } catch (error) {
            console.log(error);
        } finally {
            navigate('/')
            setTimeout(() => {
                dispatch(setUser(null))
                dispatch(setCart([]))
                localStorage.removeItem('accessToken')
            }, 100)
        }
    }

    
    const loadCart = async () => {
        if (!accessToken || accessToken === 'null') return;
        try {
            const res = await axios.get(API, {
                headers: { Authorization: `Bearer ${accessToken}` },
            })
            if (res.data.success) {
                dispatch(setCart(res.data.cart));
            }
        } catch (error) {
            console.log(error);

        }
    };
    useEffect(()=>{
        loadCart()
    },[dispatch, accessToken])
    
    return (
        <header className='bg-pink-50 fixed w-full z-50 border-b border-pink-200'>
            <div className='max-w-7xl mx-auto flex justify-between items-center py-3 px-4 md:px-8'>
                {/* logo section */}
                <div>
                    <img src="/Ekart.png" alt="" className='w-[100px]'/>
                    {/* <h1 className='font-bold text-2xl'>Ekart</h1> */}
                </div>
                
                {/* Desktop Nav */}
                <nav className='hidden md:flex gap-10 justify-between items-center'>
                    <ul className='flex gap-7 items-center text-xl font-semibold'>
                        <Link to={'/'}><li>Home</li></Link>
                        <Link to={'/products'}><li>Products</li></Link>
                        {
                            user && <Link to={`/profile/${user.id}`}><li>Hello, {user.name || user.firstName}</li></Link>
                        }
                        {
                            admin && <Link to={'/dashboard/sales'}><li>Dashboard</li></Link>
                        }
                    </ul>
                    <Link to={'/cart'} className='relative'>
                        <ShoppingCart />
                        <span className='bg-pink-500 rounded-full absolute text-white -top-3 -right-5 px-2'>{cart?.items?.length || 0}</span>
                    </Link>
                    {
                        user ? <Button onClick={logoutHandler} className='bg-pink-600 text-white cursor-pointer'>Logout</Button> :
                            <Button onClick={() => navigate('/login')} className='bg-gradient-to-tl from-blue-600 to-purple-600 text-white cursor-pointer'>Login</Button>
                    }
                </nav>

                {/* Mobile Icons & Hamburger */}
                <div className='md:hidden flex items-center gap-4 sm:gap-5'>
                    <Link to={'/'} className='text-gray-700 hover:text-pink-600 transition-colors'><Home size={22} /></Link>
                    <Link to={'/products'} className='text-gray-700 hover:text-pink-600 transition-colors'><ShoppingBag size={22} /></Link>
                    {user ? (
                        <Link to={`/profile/${user.id}`} className='text-gray-700 hover:text-pink-600 transition-colors'><User size={22} /></Link>
                    ) : (
                        <Link to={'/login'} className='text-gray-700 hover:text-pink-600 transition-colors'><User size={22} /></Link>
                    )}
                    <Link to={'/cart'} className='relative text-gray-700 hover:text-pink-600 transition-colors'>
                        <ShoppingCart size={22} />
                        <span className='bg-pink-500 rounded-full absolute text-white -top-2 -right-3 px-1.5 text-[10px]'>{cart?.items?.length || 0}</span>
                    </Link>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-800 ml-1">
                        {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className='md:hidden bg-pink-50 border-b border-pink-200 px-4 pt-4 pb-6 space-y-3 shadow-lg'>
                    <ul className='flex flex-col gap-4 text-lg font-semibold'>
                        {
                            admin && <Link to={'/dashboard/sales'} onClick={() => setIsMobileMenuOpen(false)}><li>Dashboard</li></Link>
                        }
                        <li className="pt-2">
                        {
                            user ? <Button onClick={() => { logoutHandler(); setIsMobileMenuOpen(false); }} className='w-full bg-pink-600 text-white cursor-pointer'>Logout</Button> :
                                <Button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} className='w-full bg-gradient-to-tl from-blue-600 to-purple-600 text-white cursor-pointer'>Login</Button>
                        }
                        </li>
                    </ul>
                </div>
            )}
        </header>
    )
}

export default Navbar
