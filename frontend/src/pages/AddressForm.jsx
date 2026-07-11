import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
// import Stepper from "@/components/Stepper";
import { addAddress, deleteAddress, setCart, setSelectedAddress } from "@/redux/productSlice";
import axios from "axios";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const AddressForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const { cart, addresses, selectedAddress } = useSelector((store) => store.product);
  const [showForm, setShowForm] = useState(addresses.length > 0 ? false : true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Dummy payment form state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiId, setUpiId] = useState("");

  const subtotal = cart?.totalPrice || 0;
  const shipping = subtotal > 50 ? 0 : 10;
  const tax = parseFloat((subtotal * 0.05).toFixed(2)) || 0;
  const total = subtotal + shipping + tax;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    dispatch(addAddress(formData));
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    });
    setShowForm(false);
  };

  console.log('cart', cart);

  useEffect(() => {
    // Razorpay script removed as we are using Dummy Payment modal
  }, []);

  const accessToken = localStorage.getItem("accessToken")
  //       products: cart?.items?.map(item => ({
  //         productId: item.productId.id,   // rename _id to productId
  //         quantity: item.quantity,
  //       })),
  //       tax: tax,
  //       shipping: shipping,
  //       amount: total,
  //       currency: "INR"
  //     }, {
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`
  //       }
  //     });

  //     if (!data.success) return alert("Something went wrong");

  //     // Step 2: Razorpay Checkout
  //     const options = {
  //       key: import.meta.env.VITE_RAZORPAY_KEY_ID, // replace with your Razorpay Key ID
  //       amount: data.order.amount,
  //       currency: data.order.currency,
  //       name: "Ekart",
  //       description: "Order Payment",
  //       order_id: data.order.id,
  //       handler: async function (response) {
  //         console.log('response', response);

  //         // Step 3: Verify payment
  //         const verifyRes = await axios.post(`${import.meta.env.VITE_URL}/api/v1/orders/verify-payment`, response, {
  //           headers: {
  //             Authorization: `Bearer ${accessToken}`
  //           }
  //         });

  //         if (verifyRes.data.success) {
  //           toast.success("✅ Payment Successful!");
  //           navigate("/order-success"); // redirect after payment success
  //           dispatch(setCart({ items: [], totalPrice: 0 }));
  //         } else {
  //           toast.error("❌ Payment Verification Failed");
  //         }
  //       },
  //       prefill: {
  //         name: formData.fullName,
  //         email: formData.email,
  //         contact: formData.phone,
  //       },
  //       theme: {
  //         color: "#F472B6", // pink theme
  //       },
  //     };

  //     const rzp = new window.Razorpay(options);
  //     rzp.open();
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Something went wrong while processing payment");
  //   }
  // }
  const [createdOrder, setCreatedOrder] = useState(null);

  const handleCreateOrder = async () => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_URL}/api/v1/orders/create-order`, {
        products: cart?.items?.map(item => ({
          productId: item.productId.id,
          quantity: item.quantity,
          price: item.productId.productPrice,
        })),
        tax,
        shipping,
        amount: total,
        currency: "INR",
      }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!data.success) return toast.error("Something went wrong");

      setCreatedOrder(data.order);
      toast.success("Order has been created successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create order");
    }
  };

  const handlePayNowClick = () => {
    if (!createdOrder) return;
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
      const rzpOrderId = createdOrder.id;

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
        dispatch(setCart({ items: [], totalPrice: 0 }));
        setShowPaymentModal(false);
        navigate("/order-success");
      } else {
        toast.error("❌ Payment Verification Failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error verifying payment");
    }
  };


  return (
    <div className="max-w-7xl mx-auto flex flex-col p-10 w-full relative">
      <div className="w-full self-start mb-6">
        <Button onClick={() => navigate(-1)} variant="ghost" className="flex items-center gap-2 -ml-4">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>
      {/* <Stepper currentStep={1} /> Step 2: Address */}

      <div className="grid grid-cols-2 items-start gap-20 mt-4 max-w-7xl mx-auto w-full">
        {/* LEFT SIDE */}
        <div className="space-y-4 p-6 bg-white">
          {showForm ? (
            // Address Input Form
            <>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  required
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  required
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  required
                  placeholder="123 Street, Area"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    required
                    placeholder="Kolkata"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    required
                    placeholder="West Bengal"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zip">Zip Code</Label>
                  <Input
                    id="zip"
                    name="zip"
                    required
                    placeholder="700001"
                    value={formData.zip}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    required
                    placeholder="India"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">
                Save & Continue
              </Button>
            </>
          ) : (
            // Saved Addresses List
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Saved Addresses</h2>
              {addresses.map((addr, index) => (
                <div
                  key={index}
                  className={`border p-4 rounded-md cursor-pointer relative ${selectedAddress === index
                    ? "border-pink-600 bg-pink-50"
                    : "border-gray-300"
                    }`}
                  onClick={() => dispatch(setSelectedAddress(index))}
                >
                  <p className="font-medium">{addr.fullName}</p>
                  <p>{addr.phone}</p>
                  <p>{addr.email}</p>
                  <p>
                    {addr.address}, {addr.city}, {addr.state}, {addr.zip}, {addr.country}
                  </p>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent selecting when deleting
                      dispatch(deleteAddress(index));
                    }}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}

              {!createdOrder ? (
                <>
                  <Button
                    variant="outline"
                    className="w-full mb-4"
                    onClick={() => setShowForm(true)}
                  >
                    + Add New Address
                  </Button>
                  <Button
                    disabled={selectedAddress === null}
                    onClick={handleCreateOrder}
                    className="w-full bg-pink-600 hover:bg-pink-700"
                  >
                    Create Order
                  </Button>
                </>
              ) : (
                <div className="w-full space-y-4">
                  <div className="bg-pink-50 border border-pink-200 text-pink-700 p-4 rounded-lg flex flex-col items-center justify-center space-y-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-semibold text-center">Order Created Successfully!</p>
                    <p className="text-sm text-center">Your order status is currently <span className="font-bold">Pending</span>.</p>
                  </div>
                  <Button
                    onClick={handlePayNowClick}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-6 text-lg"
                  >
                    Pay Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      dispatch(setCart({ items: [], totalPrice: 0 }));
                      navigate('/orders');
                    }}
                    className="w-full py-6 text-lg text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    Pay Later
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT SIDE (Order Summary) */}
        <div>
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0} items)</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{shipping.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>₹{tax.toLocaleString("en-IN")}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="text-sm text-muted-foreground pt-4">
                <p>• Free shipping on orders over ₹50</p>
                <p>• 30-day return policy</p>
                <p>• Secure checkout with SSL encryption</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dummy Payment Modal */}
      {showPaymentModal && createdOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Complete Payment</h2>
            
            <form onSubmit={handleDummyPaymentSubmit} className="space-y-5">
              <div className="bg-pink-50/50 border border-pink-100 p-4 rounded-lg text-sm space-y-2 text-gray-700">
                <p><span className="font-semibold text-gray-900">Name:</span> {formData.fullName || "User"}</p>
                <p className="line-clamp-2" title={cart?.items?.map(p => p.productId.productName).join(', ')}>
                  <span className="font-semibold text-gray-900">Products:</span> {cart?.items?.map(p => p.productId.productName).join(', ')}
                </p>
                <div className="pt-2 mt-2 border-t border-pink-100 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Net Amount:</span>
                  <span className="text-xl font-black text-pink-600">₹{(createdOrder.amount / 100).toLocaleString('en-IN')}</span>
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

              <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white shadow-md py-6 text-lg font-bold mt-4 transition-all hover:scale-[1.02]">
                Submit Payment
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressForm;
