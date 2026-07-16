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
    <div className='bg-gray-50 min-h-screen'>
      {
        cart?.items?.length > 0 ? (
          <div>
            {/* Full width sticky header */}
            <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 shadow-sm pt-[76px]">
              <div className='max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-4'>
                <Button onClick={() => navigate(-1)}><ArrowLeft /></Button>
                <h1 className='text-xl md:text-2xl font-bold text-gray-800'>Shopping Cart</h1>
              </div>
            </div>

            <div className='max-w-7xl mx-auto flex flex-col lg:flex-row gap-7 px-4 md:px-8 py-6'>
              <div className='flex flex-col gap-5 flex-1'>
                {cart?.items?.map((product, index) => {
                  return <Card key={index} className='p-4 md:p-6 mb-2 shadow-sm hover:shadow-md transition-shadow bg-white rounded-xl border border-gray-200'>
                    <div className='flex flex-col sm:flex-row gap-6'>
                      {/* Image */}
                      <div className="shrink-0 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                        <img src={product?.productId?.productImg?.[0]?.url || userLogo} alt={product?.productId?.productName} className='w-full sm:w-32 h-32 object-contain mix-blend-multiply p-2' />
                      </div>

                      {/* Details */}
                      <div className='flex flex-col flex-1 justify-between gap-4 sm:gap-0'>
                        <div className='flex justify-between items-start gap-4'>
                          <div>
                            <h1 className='font-bold text-lg text-gray-800 line-clamp-2 leading-tight'>{product?.productId?.productName}</h1>
                            <p className='text-sm text-gray-500 mt-1 capitalize'>{product?.productId?.category} • {product?.productId?.brand}</p>
                            <h2 className='text-pink-600 font-bold text-lg sm:text-xl mt-2'>₹{product?.productId?.productPrice?.toLocaleString('en-IN')}</h2>
                          </div>
                          <button onClick={() => handleRemove(product?.productId?.id)} className='text-gray-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-full transition-colors shrink-0' title="Remove">
                            <Trash2 className='w-5 h-5' />
                          </button>
                        </div>

                        {/* Bottom row: Quantity and Total */}
                        <div className='flex flex-wrap justify-between items-end mt-auto pt-4 border-t border-gray-100 gap-4'>
                          <div>
                            <p className="text-xs text-gray-500 mb-1 ml-1">Quantity</p>
                            <div className='flex items-center bg-gray-50 rounded-full border border-gray-200'>
                              <button onClick={() => handleUpdateQuantity(product.productId.id, 'decrease')} className='w-9 h-9 flex justify-center items-center rounded-l-full hover:bg-gray-200 text-gray-600 transition-colors font-medium'>-</button>
                              <span className='w-10 text-center font-semibold text-gray-800'>{product.quantity}</span>
                              <button onClick={() => handleUpdateQuantity(product.productId.id, 'increase')} className='w-9 h-9 flex justify-center items-center rounded-r-full hover:bg-gray-200 text-gray-600 transition-colors font-medium'>+</button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500 mb-1">Total</p>
                            <p className='font-bold text-lg sm:text-xl text-gray-900'>₹{((product?.productId?.productPrice) * (product?.quantity)).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                })}
              </div>
              <div className='w-full lg:w-[380px] shrink-0'>
                <Card className="w-full bg-white shadow-sm border border-gray-200 rounded-xl sticky top-24">
                  <CardHeader className="border-b border-gray-100 pb-5">
                    <CardTitle className="text-xl font-bold text-gray-800">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-5">
                    <div className="flex flex-wrap justify-between gap-2 text-gray-600">
                      <span>Subtotal ({cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0} items)</span>
                      <span className="font-medium text-gray-900">₹{cart?.totalPrice?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2 text-gray-600">
                      <span>Shipping</span>
                      <span className="font-medium text-gray-900">{shipping === 0 ? <span className="text-green-600">Free</span> : `₹${shipping.toLocaleString('en-IN')}`}</span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2 text-gray-600">
                      <span>Tax (5%)</span>
                      <span className="font-medium text-gray-900">₹{tax.toLocaleString('en-IN')}</span>
                    </div>
                    <Separator className="bg-gray-200" />
                    <div className="flex flex-wrap justify-between items-center gap-2 font-bold text-lg sm:text-xl text-gray-900">
                      <span>Total Amount</span>
                      <span className="text-pink-600">₹{total.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="space-y-3 pt-4">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Promo code"
                          className="bg-gray-50"
                        />
                        <Button variant="outline" className="shrink-0 bg-white hover:bg-gray-50">Apply</Button>
                      </div>

                      <Button onClick={() => navigate('/address')} size="lg" className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-6 rounded-xl shadow-md transition-transform hover:scale-[1.02]">
                        Proceed to Checkout
                      </Button>

                      <Button variant="ghost" size="lg" className="w-full text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl" asChild>
                        <Link to="/products">Continue Shopping</Link>
                      </Button>
                    </div>

                    <div className="text-xs text-gray-400 space-y-2 pt-4 border-t border-gray-100 mt-2">
                      <p className="flex items-center gap-2">✓ Free shipping on orders over $50</p>
                      <p className="flex items-center gap-2">✓ 30-day return policy</p>
                      <p className="flex items-center gap-2">✓ Secure checkout with SSL encryption</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] pt-24 p-6 text-center">
            {/* Icon */}
            <div className="bg-pink-100 p-6 rounded-full">
              <ShoppingCart className="w-16 h-16 text-pink-600" />
            </div>

            {/* Title */}
            <h2 className="mt-6 text-xl md:text-2xl font-bold text-gray-800">Your Cart is Empty</h2>

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
        )}
    </div>
  )
}

export default Cart
