import { Button } from '@/components/ui/button'
import axios from 'axios'
import { ArrowLeft, MapPin, FileText } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateInvoice } from '../utils/invoiceGenerator'
import OrderTracker from '../components/OrderTracker'

import { toast } from 'sonner'

const MyOrder = ({ hideBackButton = false }) => {
  const navigate = useNavigate()
  const [userOrder, setUserOrder] = useState([])
  const [loading, setLoading] = useState(true)
  const [trackingOrderIds, setTrackingOrderIds] = useState({})

  const toggleTrackOrder = (orderId) => {
    setTrackingOrderIds(prev => ({ ...prev, [orderId]: !prev[orderId] }))
  }

  // Dummy payment form state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");

  const getUserOrders = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      const res = await axios.get(`${import.meta.env.VITE_URL}/api/v1/orders/myorder`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      if (res.data.success) {
        setUserOrder(res.data.orders || [])
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayNowClick = (order) => {
    setSelectedOrder(order);
    setPaymentMethod("UPI");
    setUpiId("");
    setShowPaymentModal(true);
  };

  const handleDummyPaymentSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === "UPI" && !upiId.trim()) {
      toast.error("Please enter a valid UPI ID");
      return;
    }
    
    try {
      const accessToken = localStorage.getItem("accessToken");
      const rzpOrderId = selectedOrder.razorpayOrderId || selectedOrder.id;

      const verifyRes = await axios.post(
        `${import.meta.env.VITE_URL}/api/v1/orders/verify-payment`,
        {
          razorpay_order_id: rzpOrderId,
          razorpay_payment_id: "pay_dummy_" + Math.floor(Math.random() * 1000000),
          razorpay_signature: "dummy_signature_bypass",
          paymentFailed: false,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (verifyRes.data.success) {
        toast.success("✅ Payment Successful!");
        setShowPaymentModal(false);
        getUserOrders();
      } else {
        toast.error("❌ Payment Verification Failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error verifying payment");
    }
  };

  useEffect(() => {
    getUserOrders()
  }, [])

  console.log(userOrder);

  return (
    <div className='md:pr-20 flex flex-col gap-3 pt-24'>
      <div className="w-full p-4 md:p-6">
        <div className='flex items-center gap-4 mb-6'>
          {!hideBackButton && (
            <Button onClick={() => navigate(-1)}><ArrowLeft /></Button>
          )}
          <h1 className="text-xl md:text-2xl font-bold">Orders</h1>
        </div>

        {loading ? (
          <p className="text-gray-600 text-lg">Loading orders...</p>
        ) : userOrder.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 text-pink-400 opacity-80">
              <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">No orders found</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
            <Button onClick={() => navigate('/products')} className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-5 rounded-lg text-lg">Browse Products</Button>
          </div>
        ) : (
          <div className="space-y-6 w-full">
            {userOrder?.map((order) => (
              <div
                key={order.id}
                className="shadow-lg rounded-2xl p-4 md:p-5 border border-gray-200"
              >
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-4">
                  <h2 className="text-base md:text-lg font-semibold break-all">
                    Order ID:{" "}
                    <span className="text-gray-600">{order.id}</span>
                  </h2>
                  <p className="text-sm md:text-base text-gray-500 whitespace-nowrap">
                    Amount:{" "}
                    <span className="font-bold text-black">
                      {order.currency} {order.amount.toFixed(2)}
                    </span>
                  </p>
                </div>

                {/* User Info */}
                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-gray-100 pb-4 mb-4'>
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">User:</span>{" "}
                      {order.user?.name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500 break-all">
                      Email: {order.user?.email || "N/A"}
                    </p>
                  </div>
                  <div className="self-start sm:self-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <span className={`${order.status === 'Paid' ? 'bg-green-500' : order.status === 'Failed' ? 'bg-red-500' : 'bg-orange-300'} text-white px-3 py-1 rounded-lg text-sm font-medium`}>
                      {order.status}
                    </span>
                    {order.status === 'Pending' && (
                      <Button onClick={() => handlePayNowClick(order)} size="sm" className="bg-pink-600 hover:bg-pink-700 shadow-sm">
                        Pay Now
                      </Button>
                    )}
                    {order.status !== 'Pending' && order.status !== 'Failed' && (
                      <div className="flex gap-2">
                        <Button onClick={() => toggleTrackOrder(order.id)} size="sm" variant="outline" className="border-pink-600 text-pink-600 hover:bg-pink-50 flex gap-2">
                          <MapPin className="w-4 h-4" />
                          {trackingOrderIds[order.id] ? 'Hide Tracking' : 'Track Order'}
                        </Button>
                        
                        {order.status === 'Delivered' && (
                          <Button onClick={() => generateInvoice(order)} size="sm" className="bg-pink-100 text-pink-700 hover:bg-pink-200 shadow-sm flex gap-2 border border-pink-200">
                            <FileText className="w-4 h-4" />
                            Invoice
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tracker UI */}
                {trackingOrderIds[order.id] && (
                  <div className="mb-6">
                    <OrderTracker status={order.status} />
                  </div>
                )}

                {/* Products */}
                <div>
                  <h3 className="font-medium mb-3">Products:</h3>
                  <ul className="space-y-3">
                    {order.products.map((product, index) => (
                      <li
                        key={index}
                        className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4 bg-gray-50 p-3 rounded-lg"
                      >
                        <span onClick={() => navigate(`/products/${product?.productId}`)} className='w-full md:w-[40%] lg:w-[300px] line-clamp-2 cursor-pointer hover:underline font-medium text-sm md:text-base'>
                          {product.productName}
                        </span>
                        <span className="text-xs text-gray-400 break-all md:w-[30%]">
                          ID: {product?.productId}
                        </span>
                        <span className="font-semibold text-sm md:text-base text-gray-700 whitespace-nowrap">
                          ₹{product.price} <span className="font-normal text-gray-500">x {product.quantity}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dummy Payment Modal */}
      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Complete Payment</h2>
            
            <form onSubmit={handleDummyPaymentSubmit} className="space-y-5">
              <div className="bg-pink-50/50 border border-pink-100 p-4 rounded-lg text-sm space-y-2 text-gray-700">
                <p><span className="font-semibold text-gray-900">Name:</span> {selectedOrder.user?.name || "User"}</p>
                <p className="line-clamp-2" title={selectedOrder.products.map(p => p.productName).join(', ')}>
                  <span className="font-semibold text-gray-900">Products:</span> {selectedOrder.products.map(p => p.productName).join(', ')}
                </p>
                <div className="pt-2 mt-2 border-t border-pink-100 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Net Amount:</span>
                  <span className="text-xl font-black text-pink-600">₹{selectedOrder.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                <select 
                  className="w-full p-3 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="UPI">UPI</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="NetBanking">Net Banking</option>
                </select>
              </div>

              {paymentMethod === "UPI" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">UPI Number / ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 9876543210@ybl" 
                    className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    required
                  />
                </div>
              )}

              <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 shadow-md py-6 text-lg font-bold mt-4 transition-all hover:scale-[1.02]">
                Submit Payment
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyOrder
