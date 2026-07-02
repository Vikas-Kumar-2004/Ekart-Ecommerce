import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { setCart } from '@/redux/productSlice'
import { ArrowLeft, ShoppingCart, Trash2 } from 'lucide-react'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import axios from "axios";
import userLogo from '../assets/user.jpg'
import { toast } from 'sonner'

const Cart = () => {
  const { cart } = useSelector(store => store.product)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const subtotal = cart?.totalPrice || 0;
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = parseFloat((subtotal * 0.05).toFixed(2)) || 0;
  const total = subtotal + shipping + tax;

  const API = `${import.meta.env.VITE_URL}/api/v1/cart`;
  const accessToken = localStorage.getItem("accessToken");

  const loadCart = async () => {
    if (!accessToken || accessToken === 'null') return;
    try {
      const res = await axios.get(`${API}/get`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.data.success) {
        dispatch(setCart(res.data.cart));
      }
    } catch (error) {
      console.log(error);

    }
  };

  const handleUpdateQuantity = async (productId, type) => {
    try {
      const res = await axios.put(`${API}/update`, { productId, type },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (res.data.success) {
        dispatch(setCart(res.data.cart));
      }
    } catch (error) {
      console.log(error);

    }
  };

const handleRemove = async (productId) => {
  try {
    const res = await axios.delete(`${API}/remove`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { productId }   // ✅ use productId, not id
    });
    if (res.data.success) {
      dispatch(setCart(res.data.cart));
      toast.success('Product removed from cart');
    }
  } catch (error) {
    console.log(error);
  }
};


  useEffect(() => {
    loadCart();
  }, [dispatch]);


  console.log(cart);

  return (
    <div className='pt-20 bg-gray-50 min-h-screen'>
      {
        cart?.items?.length > 0 ? <div className='max-w-7xl mx-auto '>
          <div className="flex items-center gap-4 mb-7">
            <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2 -ml-4">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <h1 className='text-2xl font-bold text-gray-800'>Shopping Cart</h1>
          </div>
          <div className='max-w-7xl mx-auto flex gap-7'>
            <div className='flex flex-col gap-5 flex-1'>
              {cart?.items?.map((product, index) => {
                return <Card key={index} className=''>
                  <div className='flex justify-between  items-center pr-7'>
                    <div className='flex items-center w-[350px]'>
                      <img src={product?.productId?.productImg?.[0]?.url || userLogo} alt="" className='w-25 h-25' />
                      <div className='w-[280px]'>
                        <h1 className='font-semibold truncate'>{product?.productId?.productName}</h1>
                        <p>₹{product?.productId?.productPrice}</p>
                      </div>

                    </div>
                    <div className='flex gap-5 items-center'>
                      <Button onClick={() => handleUpdateQuantity( product.productId.id, 'decrease' )} variant='outline'>-</Button>
                      <span>{product.quantity}</span>
                      <Button onClick={() => handleUpdateQuantity( product.productId.id, 'increase' )} variant='outline'>+</Button>
                    </div>
                    <p className='font-semibold'>₹{(product?.productId?.productPrice) * (product?.quantity)}</p>
                    <p onClick={() => handleRemove(product?.productId?.id)} className='flex text-red-500 items-center gap-1 cursor-pointer'><Trash2 className='w-4 h-4' />Remove</p>
                  </div>
                </Card>
              })}
            </div>
            <div>
              <Card className="w-[400px]">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({cart?.items?.length} items)</span>
                    <span>₹{cart?.totalPrice?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>₹{shipping.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (5%)</span>
                    <span>₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="space-y-3 pt-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Promo code"
                      // value={promoCode}
                      // onChange={(e) => setPromoCode(e.target.value)}
                      />
                      <Button variant="outline">Apply</Button>
                    </div>

                    <Button onClick={() => navigate('/address')} size="lg" className="w-full bg-pink-600">
                      PLACE ORDER
                    </Button>

                    <Button variant="outline" size="lg" className="w-full bg-transparent" asChild>
                      <Link to="/products">Continue Shopping</Link>
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground pt-4">
                    <p>• Free shipping on orders over $50</p>
                    <p>• 30-day return policy</p>
                    <p>• Secure checkout with SSL encryption</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div> : <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
          {/* Icon */}
          <div className="bg-pink-100 p-6 rounded-full">
            <ShoppingCart className="w-16 h-16 text-pink-600" />
          </div>

          {/* Title */}
          <h2 className="mt-6 text-2xl font-bold text-gray-800">Your Cart is Empty</h2>

          {/* Message */}
          <p className="mt-2 text-gray-600">
            Looks like you haven’t added anything to your cart yet.
          </p>

          {/* Button */}
          <button
            onClick={() => navigate("/products")}
            className="mt-6 bg-pink-600 text-white px-6 py-3 rounded-xl hover:bg-pink-700 transition"
          >
            Start Shopping
          </button>
        </div>
      }

    </div>
  )
}

export default Cart
