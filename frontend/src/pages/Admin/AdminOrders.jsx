import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;
    const accessToken = localStorage.getItem("accessToken");

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_URL}/api/v1/orders/all`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (data.success) setOrders(data.orders);
        } catch (error) {
            console.error("❌ Failed to fetch admin orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [accessToken]);

    const updateStatus = async (orderId, newStatus) => {
        try {
            const { data } = await axios.put(
                `${import.meta.env.VITE_URL}/api/v1/orders/status/${orderId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            if (data.success) {
                toast.success(`Status updated to ${newStatus}`);
                fetchOrders(); // Refresh to get updated status
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-gray-500">Loading all orders...</div>;
    }

    // Pagination Logic
    const totalPages = Math.ceil(orders.length / ordersPerPage);
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

    const handlePrev = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div className="w-full md:pl-[350px] py-20 px-4 md:pr-10 mx-auto ">
            <h1 className="text-3xl font-bold mb-6">Admin - All Orders</h1>

            {(!orders || orders.length === 0) ? (
                <p className="text-gray-500">No orders found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {currentOrders.map((order) => (
                        <div key={order?.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                            {/* Header: Order ID & Status */}
                            <div className="flex justify-between items-start mb-4 gap-2">
                                <div className="flex-1 min-w-0">
                                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Order ID</span>
                                    <p className="font-mono text-sm text-gray-800 break-all mt-0.5">{order?.id}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusColors[order?.status] || "bg-gray-100 text-gray-700"}`}>
                                    {order?.status}
                                </span>
                            </div>

                            {/* User Details */}
                            <div className="mb-4 flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold shrink-0">
                                    {order?.user?.name ? order.user.name.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-gray-900 truncate">{order?.user?.name || "Unknown User"}</p>
                                    <p className="text-xs text-gray-500 truncate">{order?.user?.email || "N/A"}</p>
                                </div>
                            </div>

                            {/* Products List */}
                            <div className="mb-4 flex-1">
                                <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block mb-2">Products</span>
                                <div className="space-y-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                                    {order?.products?.map((p, idx) => (
                                        <div key={idx} className="flex justify-between items-start gap-2 text-sm">
                                            <span className="text-gray-700 line-clamp-2 flex-1" title={p?.productName}>{p?.productName}</span>
                                            <span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">× {p?.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer: Date & Amount */}
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-auto">
                                <div>
                                    <span className="text-gray-500 text-xs block">Date</span>
                                    <span className="text-sm font-medium text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-gray-500 text-xs block">Total Amount</span>
                                    <span className="text-lg font-bold text-pink-600">₹{order.amount.toLocaleString("en-IN")}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-8 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                    <Button
                        variant="outline"
                        onClick={handlePrev}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="text-sm text-gray-600 font-medium">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    )
}

export default AdminOrders
