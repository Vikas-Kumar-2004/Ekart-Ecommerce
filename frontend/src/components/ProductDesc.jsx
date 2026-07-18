import React from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useDispatch } from 'react-redux'
import { setCart } from '@/redux/productSlice'
import { toast } from 'sonner'
import { ShoppingCart, Loader2 } from 'lucide-react'
import axios from 'axios'

import { FaWhatsapp } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const ProductDesc = ({ product }) => {
  const navigate = useNavigate()
  const [quantity, setQuantity] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const dispatch = useDispatch()
  const accessToken = localStorage.getItem('accessToken')
  
  const addToCart = async (productId) => {
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_URL}/api/v1/cart/add`, { productId, quantity }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.data.success) {
        const phoneNumber = import.meta.env.VITE_PHONE_NUMBER;
        const productUrl = window.location.href;
        const message = `Hi! I just added *${product.productName}* to my cart. Price: ₹${product.productPrice}. Here is the link: ${productUrl}. I need some help before ordering.`;
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

        toast.success('Product added to cart', {
            description: `${product.productName} (₹${product.productPrice})`,
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
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = import.meta.env.VITE_PHONE_NUMBER;
    const currentUrl = window.location.href;
    const message = `Hi! I'm interested in *${product.productName}*. Price is ₹${product.productPrice}. Here is the link: ${currentUrl}. Can you share more details?`;
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className='flex flex-col gap-4'>
      <h1 className='font-bold text-2xl md:text-4xl text-gray-800'>{product.productName}</h1>
      <p className='text-gray-800'>{product.category} | {product.brand}</p>
      <h2 className='text-pink-500 font-bold text-lg sm:text-xl md:text-2xl break-words'>₹{product.productPrice?.toLocaleString('en-IN')}</h2>
      <p className='line-clamp-12 text-sm md:text-base text-muted-foreground'>{product.productDesc}</p>
      <div className='flex gap-2 items-center'>
        <p className='text-gray-800 font-semibold'>Quantity :</p>
        <Input type="number" className='w-16' value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min={1} />
      </div>
      
      <div className='flex flex-col sm:flex-row gap-3 mt-4 md:mt-0'>
        <Button disabled={loading} onClick={() => addToCart(product.id)} className='bg-pink-600 w-full sm:w-max'>
          {loading ? <><Loader2 className='mr-2 h-4 w-4 animate-spin'/> Please wait</> : <><ShoppingCart className="mr-2 h-4 w-4"/> Add to Cart</>}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleWhatsAppClick} 
          className='border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 w-full sm:w-max'
        >
          <FaWhatsapp className="mr-2 h-5 w-5"/> Inquire on WhatsApp
        </Button>
      </div>
    </div>
  )
}

export default ProductDesc
