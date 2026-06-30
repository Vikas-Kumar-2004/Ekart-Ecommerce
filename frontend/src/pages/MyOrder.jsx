import { Button } from '@/components/ui/button'
import axios from 'axios'
import { ArrowLeft } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const MyOrder = () => {
  const navigate = useNavigate()
  const [userOrder, setUserOrder] = useState([])
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    getUserOrders()
  }, [])

  console.log(userOrder);

  return (
    <div className='md:pr-20 flex flex-col gap-3 pt-24'>
      <div className="w-full p-4 md:p-6">
        <div className='flex items-center gap-4 mb-6'>
          <Button onClick={() => navigate(-1)}><ArrowLeft /></Button>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders found</h2>
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
                  <div className="self-start sm:self-auto">
                    <span className={`${order.status === 'Paid' ? 'bg-green-500' : order.status === 'Failed' ? 'bg-red-500' : 'bg-orange-300'} text-white px-3 py-1 rounded-lg text-sm font-medium`}>
                      {order.status}
                    </span>
                  </div>
                </div>

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
    </div>
  )
}

export default MyOrder
