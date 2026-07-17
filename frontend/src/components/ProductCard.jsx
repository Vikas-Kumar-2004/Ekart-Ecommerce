import React from 'react'
import { Button } from './ui/button'
import { useDispatch, useSelector } from 'react-redux'
import { setCart } from '@/redux/productSlice'
import { Skeleton } from './ui/skeleton'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import { ShoppingCart } from 'lucide-react'

const ProductCard = ({ product, loading }) => {
    // const { carts } = useSelector(store => store.cart)
    const { cart } = useSelector(store => store.product)
    const { productImg, productPrice, productName } = product
    const accessToken = localStorage.getItem('accessToken')
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const addToCart = async (productId) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_URL}/api/v1/cart/add`, { productId }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if(res.data.success){
                const phoneNumber = import.meta.env.PHONE_NUMBER;
                const productUrl = window.location.origin + `/products/${product.id}`;
                const message = `Hi! I just added *${productName}* to my cart. Price: ₹${productPrice}. Here is the link: ${productUrl}. I need some help before ordering.`;
                const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

                toast.success('Product added to cart', {
                    description: `${productName} (₹${productPrice})`,
                    action: {
                        label: 'WhatsApp Help',
                        onClick: () => window.open(whatsappUrl, "_blank")
                    },
                    duration: 5000,
                });
                dispatch(setCart(res.data.cart));
                navigate('/cart');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div 
            className='shadow-lg rounded-lg overflow-hidden h-max cursor-pointer hover:shadow-xl transition-shadow flex flex-col group'
            onClick={() => navigate(`/products/${product.id}`)}
        >
            <div className="w-full h-full aspect-square overflow-hidden bg-gray-100">
                {
                    loading ? <Skeleton className='rounded-lg w-full h-full' /> : <img
                        src={productImg[0]?.url}
                        alt={productName}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                }

            </div>
            {
                loading ? <div className='px-3 space-y-2 my-3'>
                    <Skeleton className='w-[200px] h-4' />
                    <Skeleton className='w-[100px] h-4' />
                    <Skeleton className='w-full h-10 mt-2' />
                </div> :
                    <div className='p-3 flex flex-col flex-1 justify-between'>
                        <div>
                            <h1 className='font-semibold line-clamp-2 h-11 text-gray-800 group-hover:text-pink-600 transition-colors'>{productName}</h1>
                            <h2 className='font-bold text-lg mt-1 mb-3'>₹{productPrice?.toLocaleString('en-IN')}</h2>
                        </div>
                        <Button 
                            onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product.id);
                            }} 
                            className='bg-pink-600 hover:bg-pink-700 w-full shadow-sm'
                        >
                            <ShoppingCart className="w-4 h-4 mr-2"/>Add to Cart
                        </Button>
                    </div>
            }

        </div>
    )
}

export default ProductCard
