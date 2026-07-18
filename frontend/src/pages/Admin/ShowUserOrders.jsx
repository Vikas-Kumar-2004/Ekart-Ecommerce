import { Button } from '@/components/ui/button'
import axios from 'axios'
import { ArrowLeft } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

const ShowUserOrders = () => {
  const params = useParams()
  const navigate = useNavigate()
  const [userOrder, setUserOrder] = useState([])
  const [loading, setLoading] = useState(true)
  const accessToken = localStorage.getItem('accessToken')

  const getUserOrders = async () => {
    try {
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

  const updateStatus = async (orderId, newStatus) => {
    try {
        const { data } = await axios.put(
            `${import.meta.env.VITE_URL}/api/v1/orders/status/${orderId}`,
            { status: newStatus },
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (data.success) {
            toast.success(`Status updated to ${newStatus}`);
            getUserOrders(); // Refresh to get updated status
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const statusColors = {
      Pending: "bg-yellow-100 text-yellow-700",
      Paid: "bg-blue-100 text-blue-700",
      Processing: "bg-purple-100 text-purple-700",
      Shipped: "bg-orange-100 text-orange-700",
      Delivered: "bg-green-100 text-green-700",
      Failed: "bg-red-100 text-red-700"
  };

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
                  <select 
                      className={`px-3 py-1 text-sm font-bold border-none outline-none cursor-pointer rounded-full shadow-sm ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                  >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                  </select>
                </div>

                {/* Products */}
                <div>
                  <h3 className="font-medium mb-3 text-gray-800">Products:</h3>
                  <ul className="space-y-3">
                    {(order.products || []).map((product, index) => (
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
