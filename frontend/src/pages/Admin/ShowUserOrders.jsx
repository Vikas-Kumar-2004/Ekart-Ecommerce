import { Button } from '@/components/ui/button'
import axios from 'axios'
import { ArrowLeft } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const ShowUserOrders = () => {
  const params = useParams()
  const navigate = useNavigate()
  const [userOrder, setUserOrder] = useState([])
  const [loading, setLoading] = useState(true)

  const getUserOrders = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken')
      const res = await axios.get(`${import.meta.env.VITE_URL}/api/v1/orders/user-order/${params.userId}`, {
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
    <div className='w-full md:pl-[350px] px-4 md:pr-10 py-20 flex flex-col gap-3'>
      <div className="w-full p-6">
        <div className='flex items-center gap-4 mb-6'>
          <Button onClick={()=>navigate(-1)}><ArrowLeft /></Button>
          <h1 className="text-2xl font-bold ">User Orders</h1>
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
            <p className="text-gray-500 mb-6">This user hasn't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6 w-full">
            {userOrder?.map((order) => (
              <div
                key={order.id}
                className="shadow-lg rounded-2xl p-5 border border-gray-200"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold whitespace-nowrap">Order ID:</h2>
                    <p className="text-gray-600 font-mono text-sm break-all">{order.id}</p>
                  </div>
                  <p className="text-sm text-gray-500 whitespace-nowrap bg-gray-50 px-3 py-1 rounded-full">
                    Amount:{" "}
                    <span className="font-bold text-gray-900">
                      {order.currency} {order.amount.toFixed(2)}
                    </span>
                  </p>
                </div>

                {/* User Info */}
                <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-100'>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-700 font-medium">
                      User: <span className="font-normal">{order.user?.name || "Unknown"}</span>
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      Email: {order.user?.email || "N/A"}
                    </p>
                  </div>
                  <span className={`${order.status === 'Paid' ? 'bg-green-500' : order.status === 'Failed' ? 'bg-red-500' : 'bg-orange-300'} text-white px-3 py-1 text-sm font-medium rounded-full shadow-sm`}>
                    {order.status}
                  </span>
                </div>

                {/* Products */}
                <div>
                  <h3 className="font-medium mb-3 text-gray-800">Products:</h3>
                  <ul className="space-y-3">
                    {order.products?.map((product, index) => (
                      <li
                        key={index}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-3 rounded-lg gap-4"
                      >
                        <div className="flex gap-4 items-center w-full sm:w-auto flex-1 min-w-0">
                          <div className="w-12 h-12 bg-gray-200 rounded-md shrink-0 flex items-center justify-center text-gray-500 font-bold text-lg uppercase shadow-sm border border-gray-200">
                            {product.productName ? product.productName.charAt(0) : "P"}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span onClick={() => navigate(`/products/${product?.productId}`)} className='truncate text-sm font-semibold text-gray-800 cursor-pointer hover:underline'>{product.productName || "Unknown Product"}</span>
                            <span className='text-xs text-gray-500 font-mono truncate'>ID: {product?.productId}</span>
                          </div>
                        </div>
                        <span className="font-medium whitespace-nowrap bg-white px-3 py-1.5 rounded-md shadow-sm border border-gray-100 text-sm">
                          ₹{product.price} x {product.quantity}
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

export default ShowUserOrders
