"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, Lock, ShieldCheck, ShoppingBag, CreditCard, 
  Truck, ChevronRight, Loader2, CheckCircle2, AlertCircle, Info, Home, UserCheck, Plus
} from "lucide-react";
import { toast } from "sonner";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
];

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const router = useRouter();
  
  // User Session State
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Cart State
  const [cart, setCart] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  // Saved Address Selection State
  const [selectedAddressId, setSelectedAddressId] = useState(""); // address ID or "new"
  const [saveToProfile, setSaveToProfile] = useState(false);

  // Form State
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pinCode: ""
  });
  
  // Inline Auth State (For guest/logged-out users)
  const [authMode, setAuthMode] = useState("login"); // "login" | "signup"
  const [authFormData, setAuthFormData] = useState({ name: "", email: "", password: "" });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // Order Details
  const [paymentMethod, setPaymentMethod] = useState("COD"); // "COD" | "ONLINE"
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [appliedCouponMinAmount, setAppliedCouponMinAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  
  // Available Coupons State
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [userHasOrders, setUserHasOrders] = useState(false);

  const fetchAvailableCoupons = async () => {
    setCouponsLoading(true);
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      if (res.ok && data.success) {
        setAvailableCoupons(data.coupons || []);
        setUserHasOrders(!!data.userHasOrders);
      }
    } catch (err) {
      console.error("Failed to fetch available coupons:", err);
    } finally {
      setCouponsLoading(false);
    }
  };

  // Check user session
  const checkSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setIsLoggedIn(true);
        fetchAvailableCoupons();
        
        // Find default or first address to prefill
        const addresses = data.user.addresses || [];
        const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
          setShippingAddress({
            name: defaultAddr.name || "",
            phone: defaultAddr.phone || "",
            addressLine1: defaultAddr.addressLine1 || "",
            addressLine2: defaultAddr.addressLine2 || "",
            city: defaultAddr.city || "",
            state: defaultAddr.state || "",
            pinCode: defaultAddr.pinCode || ""
          });
        } else {
          setSelectedAddressId("new");
          setShippingAddress(prev => ({
            ...prev,
            name: data.user.name || prev.name
          }));
        }
      }
    } catch (err) {
      console.error("Session check failed:", err);
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    checkSession();

    // Load Cart from LocalStorage
    const storedCart = localStorage.getItem("am_driets_cart");
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        setCart(parsed);
        const total = parsed.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setCartTotal(total);
      } catch (e) {
        console.error("Failed to parse cart:", e);
      }
    }
  }, []);

  const handleAuthChange = (e) => {
    setAuthFormData({ ...authFormData, [e.target.name]: e.target.value });
    setAuthError("");
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload = authMode === "login" 
        ? { email: authFormData.email, password: authFormData.password }
        : authFormData;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Login success, fetch full session with addresses
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      if (meData.user) {
        setUser(meData.user);
        setIsLoggedIn(true);
        fetchAvailableCoupons();
        const addresses = meData.user.addresses || [];
        const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
          setShippingAddress({
            name: defaultAddr.name || "",
            phone: defaultAddr.phone || "",
            addressLine1: defaultAddr.addressLine1 || "",
            addressLine2: defaultAddr.addressLine2 || "",
            city: defaultAddr.city || "",
            state: defaultAddr.state || "",
            pinCode: defaultAddr.pinCode || ""
          });
        } else {
          setSelectedAddressId("new");
          setShippingAddress(prev => ({
            ...prev,
            name: meData.user.name || prev.name
          }));
        }
      }
      toast.success(authMode === "login" ? "Welcome back!" : "Account created successfully!");
    } catch (err) {
      setAuthError(err.message);
      toast.error(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateQuantity = (id, delta) => {
    const updatedCart = cart.map((item) => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);

    setCart(updatedCart);
    localStorage.setItem("am_driets_cart", JSON.stringify(updatedCart));
    
    const newTotal = updatedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setCartTotal(newTotal);

    // Dynamic Coupon Validation Adjustment on quantity change
    if (appliedCoupon) {
      if (newTotal < appliedCouponMinAmount) {
        setDiscount(0);
        setAppliedCoupon("");
        setAppliedCouponMinAmount(0);
        setCouponError(`Coupon removed. Minimum order of ₹${appliedCouponMinAmount} not met.`);
        toast.warning(`Coupon removed. Minimum order of ₹${appliedCouponMinAmount} not met.`);
      } else {
        // Re-validate to update percentage discount dynamically
        fetch(`/api/coupons/validate?code=${appliedCoupon}&cartTotal=${newTotal}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setDiscount(data.discount);
            }
          })
          .catch((err) => console.error("Error updating dynamic coupon discount:", err));
      }
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await fetch(`/api/coupons/validate?code=${code}&cartTotal=${cartTotal}`);
      const data = await res.json();
      
      if (res.ok && data.success) {
        setDiscount(data.discount);
        setAppliedCoupon(data.code);
        setAppliedCouponMinAmount(data.minOrderAmount || 0);
        setCouponError("");
        toast.success(`Coupon '${data.code}' applied! ₹${data.discount} discount added.`);
      } else {
        setCouponError(data.error || "Invalid coupon code.");
        setDiscount(0);
        setAppliedCoupon("");
        setAppliedCouponMinAmount(0);
      }
    } catch (err) {
      console.error(err);
      setCouponError("Error validating coupon. Please try again.");
      setDiscount(0);
      setAppliedCoupon("");
      setAppliedCouponMinAmount(0);
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon("");
    setAppliedCouponMinAmount(0);
    setCouponCode("");
    setCouponError("");
    toast.info("Coupon removed.");
  };

  // Math variables
  const shippingFee = cartTotal >= 499 ? 0 : 50;
  const grandTotal = Math.max(0, cartTotal + shippingFee - discount);

  // Validate form details
  const validateForm = () => {
    if (!shippingAddress.name.trim()) {
      toast.error("Please enter full name for delivery.");
      return false;
    }
    if (!shippingAddress.phone.trim() || shippingAddress.phone.length < 10) {
      toast.error("Please enter a valid 10-digit contact number.");
      return false;
    }
    if (!shippingAddress.addressLine1.trim()) {
      toast.error("Please enter shipping address line 1.");
      return false;
    }
    if (!shippingAddress.city.trim()) {
      toast.error("Please enter delivery city.");
      return false;
    }
    if (!shippingAddress.state) {
      toast.error("Please select shipping state.");
      return false;
    }
    if (!shippingAddress.pinCode.trim() || shippingAddress.pinCode.length !== 6) {
      toast.error("Please enter a valid 6-digit PIN code.");
      return false;
    }
    return true;
  };

  const saveAddressToProfileIfChecked = async () => {
    if (isLoggedIn && selectedAddressId === "new" && saveToProfile) {
      try {
        await fetch("/api/user/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...shippingAddress, isDefault: false })
        });
      } catch (err) {
        console.error("Failed to auto-save address to user profile:", err);
      }
    }
  };

  // Handle Order Placement
  const handlePlaceOrder = async () => {
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      if (paymentMethod === "COD") {
        // Place COD order directly
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: cart.map(item => ({
              id: item.id,
              name: item.name,
              category: item.category,
              price: item.price,
              quantity: item.quantity,
              size: item.size
            })),
            totalAmount: grandTotal,
            paymentMethod: "COD",
            shippingAddress
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to place COD order");
        }

        await saveAddressToProfileIfChecked();
        toast.success("Order placed successfully via COD!");
        setCreatedOrder(data.order);
        // Clear Cart
        localStorage.removeItem("am_driets_cart");
        setCart([]);
      } else {
        // Online Payment via Razorpay
        const orderRes = await fetch("/api/razorpay/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ totalAmount: grandTotal })
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) {
          throw new Error(orderData.error || "Failed to initiate online order");
        }

        const loaded = await loadRazorpay();
        if (!loaded) {
          throw new Error("Razorpay payment gateway failed to load. Please try again.");
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: "AM DRIETS",
          description: "Premium Freeze-Dried Slices & Powders",
          order_id: orderData.order.id,
          handler: async function (response) {
            setSubmitting(true);
            try {
              const verifyRes = await fetch("/api/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    category: item.category,
                    price: item.price,
                    quantity: item.quantity,
                    size: item.size
                  })),
                  totalAmount: grandTotal,
                  paymentMethod: "UPI",
                  shippingAddress
                })
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) {
                throw new Error(verifyData.error || "Payment verification failed");
              }

              await saveAddressToProfileIfChecked();
              toast.success("Online payment successful! Order confirmed.");
              setCreatedOrder(verifyData.order);
              // Clear Cart
              localStorage.removeItem("am_driets_cart");
              setCart([]);
            } catch (err) {
              toast.error(err.message || "Something went wrong during payment verification.");
            } finally {
              setSubmitting(false);
            }
          },
          prefill: {
            name: shippingAddress.name,
            contact: shippingAddress.phone,
            email: user?.email || ""
          },
          theme: {
            color: "#ff6b00"
          },
          config: {
            display: {
              blocks: {
                upi: {
                  name: "Pay via UPI / VPA",
                  instruments: [
                    {
                      method: "upi",
                      flows: ["qr", "collect", "intent"]
                    }
                  ]
                }
              },
              sequence: ["block.upi", "block.other"],
              preferences: {
                show_default_blocks: true
              }
            }
          },
          modal: {
            ondismiss: function () {
              setSubmitting(false);
              toast.info("Payment cancelled.");
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          toast.error(response.error.description || "Payment failed. Please try again.");
          setSubmitting(false);
        });
        rzp.open();
      }
    } catch (err) {
      toast.error(err.message || "An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  // If order was successfully placed, show success UI
  if (createdOrder) {
    const deliveryDaysMax = 5;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + deliveryDaysMax);
    const dateString = estimatedDate.toLocaleDateString("en-IN", {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
      <div className="min-h-screen bg-background font-sans flex flex-col items-center justify-center p-4 py-12 md:py-20 select-none">
        <div className="max-w-2xl w-full bg-white rounded-3xl p-6 md:p-10 border border-primary/10 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-accent-green-light rounded-full flex items-center justify-center text-accent-green mb-6 animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <span className="text-xs font-bold text-accent-green bg-accent-green-light px-3 py-1 rounded-full uppercase tracking-wider">
            Order Confirmed
          </span>

          <h2 className="font-outfit font-black text-3xl md:text-4xl text-foreground mt-4 leading-tight">
            Thank you, {createdOrder.shippingAddress?.name}!
          </h2>
          <p className="text-sm md:text-base text-foreground/60 mt-2 max-w-md">
            Your order has been received and is being prepared with nature&apos;s finest freeze-dried goodness.
          </p>

          <div className="w-full bg-primary-light/30 border border-primary/5 rounded-2xl p-5 mt-8 text-left grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-bold text-foreground/40 uppercase tracking-wide">Order reference</span>
              <p className="font-outfit font-black text-lg text-primary mt-0.5">
                AMD-{createdOrder._id?.substring(createdOrder._id.length - 8).toUpperCase() || Date.now()}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-foreground/40 uppercase tracking-wide">Estimated Delivery</span>
              <p className="font-outfit font-bold text-sm text-foreground mt-0.5">
                {dateString}
              </p>
            </div>
            <div className="md:col-span-2 border-t border-primary/5 pt-3">
              <span className="text-[11px] font-bold text-foreground/40 uppercase tracking-wide">Delivering to</span>
              <p className="text-xs font-bold text-foreground/80 mt-1">
                {createdOrder.shippingAddress?.addressLine1}
                {createdOrder.shippingAddress?.addressLine2 && `, ${createdOrder.shippingAddress.addressLine2}`}
                <br />
                {createdOrder.shippingAddress?.city}, {createdOrder.shippingAddress?.state} - {createdOrder.shippingAddress?.pinCode}
              </p>
            </div>
            <div className="md:col-span-2 border-t border-primary/5 pt-3 flex items-center justify-between text-xs font-bold">
              <span className="text-foreground/50">Total Paid ({createdOrder.paymentMethod})</span>
              <span className="text-base font-black text-foreground">₹{createdOrder.totalAmount}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
            <Link
              href="/"
              className="flex-1 bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all text-sm flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col justify-between">
      {/* Checkout Navbar */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-primary/5 py-4 px-4 md:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 text-foreground/60 group-hover:text-primary group-hover:-translate-x-1 transition-all" />
            <span className="font-outfit font-black text-xl text-primary tracking-tight">AM DRIETS</span>
          </Link>
          <div className="flex items-center gap-2 text-foreground/40 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </header>

      {/* Main Checkout Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Delivery / Auth */}
        <section className="lg:col-span-7 flex flex-col gap-6 w-full">
          
          {/* Step indicator */}
          <div className="flex items-center gap-2 text-xs font-bold text-foreground/40 mb-2">
            <span className="text-primary font-black">1. Cart</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary font-black">2. Delivery details</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>3. Payment</span>
          </div>

          {/* Session check loader */}
          {sessionLoading ? (
            <div className="bg-white rounded-3xl p-10 border border-primary/5 shadow-xl flex flex-col items-center justify-center min-h-[300px]">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-sm font-semibold text-foreground/60">Loading secure connection...</p>
            </div>
          ) : !isLoggedIn ? (
            /* Inline login/register component */
            <div className="bg-white rounded-3xl border border-primary/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
              <div className="flex w-full border-b border-primary/5 bg-primary-light/10">
                <button 
                  onClick={() => { setAuthMode("login"); setAuthError(""); }}
                  className={`flex-1 py-4 text-center font-outfit font-black text-sm transition-all ${authMode === "login" ? "bg-white text-primary border-t-2 border-primary" : "text-foreground/40 hover:bg-white/50"}`}
                >
                  Sign In to Continue
                </button>
                <button 
                  onClick={() => { setAuthMode("signup"); setAuthError(""); }}
                  className={`flex-1 py-4 text-center font-outfit font-black text-sm transition-all ${authMode === "signup" ? "bg-white text-primary border-t-2 border-primary" : "text-foreground/40 hover:bg-white/50"}`}
                >
                  Create New Account
                </button>
              </div>

              <div className="p-6 md:p-8">
                <div className="mb-6">
                  <h3 className="font-outfit font-black text-xl text-foreground">
                    {authMode === "login" ? "Sign In to Checkout" : "Create Account First"}
                  </h3>
                  <p className="text-xs text-foreground/50 mt-1 leading-relaxed">
                    {authMode === "login" 
                      ? "Keep track of your order, delivery milestones, and earn reward points on your purchase." 
                      : "Quickly sign up in seconds to secure your order and make future purchases instant."}
                  </p>
                </div>

                {authError && (
                  <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-semibold text-center flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                  {authMode === "signup" && (
                    <div className="relative">
                      <input 
                        type="text" 
                        name="name"
                        placeholder="Full Name" 
                        value={authFormData.name}
                        onChange={handleAuthChange}
                        required
                        className="w-full pl-4 pr-4 py-3 rounded-xl bg-primary-light/5 border border-primary/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-sm font-semibold text-foreground transition-all"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <input 
                      type="email" 
                      name="email"
                      placeholder="Email Address" 
                      value={authFormData.email}
                      onChange={handleAuthChange}
                      required
                      className="w-full pl-4 pr-4 py-3 rounded-xl bg-primary-light/5 border border-primary/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-sm font-semibold text-foreground transition-all"
                    />
                  </div>

                  <div className="relative">
                    <input 
                      type="password" 
                      name="password"
                      placeholder="Password" 
                      value={authFormData.password}
                      onChange={handleAuthChange}
                      required
                      minLength={6}
                      className="w-full pl-4 pr-4 py-3 rounded-xl bg-primary-light/5 border border-primary/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-sm font-semibold text-foreground transition-all"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={authLoading}
                    className="mt-2 w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all text-sm flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {authLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      authMode === "login" ? "Sign In & Continue" : "Create Account & Continue"
                    )}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Logged In Checkout Details */
            <div className="flex flex-col gap-6">
              
              {/* Account summary panel */}
              <div className="bg-white rounded-2xl border border-primary/5 p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-foreground/40 font-bold block uppercase leading-none">Logged in as</span>
                    <span className="font-outfit font-black text-sm text-foreground">{user?.name} ({user?.email})</span>
                  </div>
                </div>
                <button 
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    setUser(null);
                    setIsLoggedIn(false);
                    toast.info("Logged out.");
                  }}
                  className="text-xs font-bold text-foreground/40 hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </div>

              {/* Delivery Address Card */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-primary/10 shadow-xl flex flex-col gap-6">
                <div>
                  <h3 className="font-outfit font-black text-xl text-foreground flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
                    <span>Delivery Address</span>
                  </h3>
                  <p className="text-xs text-foreground/50 mt-1">
                    {user?.addresses && user.addresses.length > 0 
                      ? "Select one of your saved addresses or enter a new one below." 
                      : "Enter the location where you want your fresh freeze-dried snacks delivered."}
                  </p>
                </div>

                {/* Saved Address Selection Cards */}
                {isLoggedIn && user?.addresses && user.addresses.length > 0 && (
                  <div className="flex flex-col gap-3.5 border-b border-primary/5 pb-6">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">Your Saved Addresses</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {user.addresses.map((addr) => (
                        <div 
                          key={addr._id}
                          onClick={() => {
                            setSelectedAddressId(addr._id);
                            setShippingAddress({
                              name: addr.name || "",
                              phone: addr.phone || "",
                              addressLine1: addr.addressLine1 || "",
                              addressLine2: addr.addressLine2 || "",
                              city: addr.city || "",
                              state: addr.state || "",
                              pinCode: addr.pinCode || ""
                            });
                          }}
                          className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between min-h-[120px] ${selectedAddressId === addr._id ? "border-primary bg-primary-light/20 shadow-xs" : "border-primary/5 bg-slate-50/50 hover:border-primary/20"}`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-outfit font-black text-sm text-foreground leading-tight">{addr.name}</span>
                            {addr.isDefault && (
                              <span className="text-[8px] font-bold bg-primary text-white px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 select-none">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-foreground/60 leading-relaxed font-semibold mt-1 flex-1">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                            <br />
                            {addr.city}, {addr.state} - {addr.pinCode}
                          </p>
                          <span className="text-[10px] text-foreground/40 font-bold block mt-2">Phone: {addr.phone}</span>
                        </div>
                      ))}

                      {/* Add New Address Card trigger */}
                      <div 
                        onClick={() => {
                          setSelectedAddressId("new");
                          setShippingAddress({
                            name: user.name || "",
                            phone: "",
                            addressLine1: "",
                            addressLine2: "",
                            city: "",
                            state: "",
                            pinCode: ""
                          });
                        }}
                        className={`p-4 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[120px] ${selectedAddressId === "new" ? "border-primary bg-primary-light/20" : "border-primary/10 bg-white hover:border-primary/35 text-foreground/40 hover:text-primary"}`}
                      >
                        <Plus className="w-6 h-6 mb-1.5" />
                        <span className="text-xs font-bold font-outfit">Use a New Address</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summarized preview of selected address when using a saved address */}
                {isLoggedIn && selectedAddressId !== "new" && (
                  <div className="bg-primary-light/10 border border-primary/5 rounded-2xl p-4 flex flex-col gap-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-primary uppercase tracking-widest leading-none">Selected shipping location</span>
                      <button 
                        onClick={() => {
                          setSelectedAddressId("new");
                          setShippingAddress({
                            name: user.name || "",
                            phone: "",
                            addressLine1: "",
                            addressLine2: "",
                            city: "",
                            state: "",
                            pinCode: ""
                          });
                        }}
                        className="text-[10px] font-bold text-foreground/40 hover:text-primary transition-all"
                      >
                        Deliver to another address
                      </button>
                    </div>
                    <div className="font-outfit font-black text-sm text-foreground mt-1">
                      {shippingAddress.name} ({shippingAddress.phone})
                    </div>
                    <p className="text-xs text-foreground/60 leading-relaxed font-semibold">
                      {shippingAddress.addressLine1}
                      {shippingAddress.addressLine2 && `, ${shippingAddress.addressLine2}`}
                      <br />
                      {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pinCode}
                    </p>
                  </div>
                )}

                {/* Form fields only shown if:
                    1. User is guest/not logged in
                    2. User is logged in but has selected "new" (Use a New Address) */}
                {(!isLoggedIn || selectedAddressId === "new") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-foreground/60">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        placeholder="e.g. Rahul Sharma" 
                        value={shippingAddress.name}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-3 rounded-xl bg-primary-light/5 border border-primary/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-sm font-semibold text-foreground transition-all"
                      />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-foreground/60">Phone Number (10 digits)</label>
                      <input 
                        type="tel" 
                        name="phone"
                        placeholder="e.g. 9876543210" 
                        value={shippingAddress.phone}
                        onChange={handleAddressChange}
                        maxLength={10}
                        className="w-full px-4 py-3 rounded-xl bg-primary-light/5 border border-primary/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-sm font-semibold text-foreground transition-all"
                      />
                    </div>

                    {/* Address Line 1 */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-foreground/60">Flat / House No. / Building / Street</label>
                      <input 
                        type="text" 
                        name="addressLine1"
                        placeholder="e.g. Flat 302, Green Meadows, MG Road" 
                        value={shippingAddress.addressLine1}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-3 rounded-xl bg-primary-light/5 border border-primary/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-sm font-semibold text-foreground transition-all"
                      />
                    </div>

                    {/* Address Line 2 */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-xs font-bold text-foreground/60">Locality / Landmark / Area (Optional)</label>
                      <input 
                        type="text" 
                        name="addressLine2"
                        placeholder="e.g. Near St. Mary School" 
                        value={shippingAddress.addressLine2}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-3 rounded-xl bg-primary-light/5 border border-primary/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-sm font-semibold text-foreground transition-all"
                      />
                    </div>

                    {/* City */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground/60">City</label>
                      <input 
                        type="text" 
                        name="city"
                        placeholder="e.g. Mumbai" 
                        value={shippingAddress.city}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-3 rounded-xl bg-primary-light/5 border border-primary/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-sm font-semibold text-foreground transition-all"
                      />
                    </div>

                    {/* State */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground/60">State</label>
                      <select 
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-3 rounded-xl bg-primary-light/5 border border-primary/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-sm font-semibold text-foreground transition-all cursor-pointer"
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    {/* PIN Code */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-foreground/60">PIN Code (6 digits)</label>
                      <input 
                        type="text" 
                        name="pinCode"
                        placeholder="e.g. 400001" 
                        value={shippingAddress.pinCode}
                        onChange={handleAddressChange}
                        maxLength={6}
                        className="w-full px-4 py-3 rounded-xl bg-primary-light/5 border border-primary/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-sm font-semibold text-foreground transition-all"
                      />
                    </div>

                    {/* Checkbox to save new address to profile */}
                    {isLoggedIn && (
                      <div className="flex items-center gap-2 md:col-span-2 mt-2">
                        <input 
                          type="checkbox" 
                          id="saveToProfile"
                          checked={saveToProfile}
                          onChange={(e) => setSaveToProfile(e.target.checked)}
                          className="w-4 h-4 rounded text-primary border-primary/20 focus:ring-primary cursor-pointer accent-primary"
                        />
                        <label htmlFor="saveToProfile" className="text-xs font-bold text-foreground/60 cursor-pointer select-none">
                          Save this delivery address to my profile for future orders
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-primary/10 shadow-xl flex flex-col gap-6">
                <div>
                  <h3 className="font-outfit font-black text-xl text-foreground flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <span>Select Payment Option</span>
                  </h3>
                  <p className="text-xs text-foreground/50 mt-1">
                    Choose how you want to settle the payment securely.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* COD Option */}
                  <label 
                    onClick={() => setPaymentMethod("COD")}
                    className={`p-5 rounded-2xl border-2 flex flex-col gap-2 cursor-pointer transition-all ${paymentMethod === "COD" ? "border-primary bg-primary-light/20" : "border-primary/10 bg-white hover:border-primary/30"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-outfit font-black text-sm text-foreground">Cash On Delivery (COD)</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "COD" ? "border-primary" : "border-foreground/20"}`}>
                        {paymentMethod === "COD" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                    </div>
                    <span className="text-xs text-foreground/50 leading-relaxed">
                      Pay via Cash or digital scanner when your packages arrive at your doorstep.
                    </span>
                  </label>

                  {/* Razorpay Option */}
                  <label 
                    onClick={() => setPaymentMethod("ONLINE")}
                    className={`p-5 rounded-2xl border-2 flex flex-col gap-2 cursor-pointer transition-all ${paymentMethod === "ONLINE" ? "border-primary bg-primary-light/20" : "border-primary/10 bg-white hover:border-primary/30"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-outfit font-black text-sm text-foreground">Pay Online Securely</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === "ONLINE" ? "border-primary" : "border-foreground/20"}`}>
                        {paymentMethod === "ONLINE" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                    </div>
                    <span className="text-xs text-foreground/50 leading-relaxed">
                      Fast, direct checkouts via Razorpay supporting UPI, Cards, Netbanking & Wallets.
                    </span>
                  </label>
                </div>

                {paymentMethod === "COD" ? (
                  <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2.5 text-amber-800 text-xs">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-semibold">
                      Please note: We require standard validation upon checkout. Delivery takes 3-5 days. Keep cash or scanner ready on arrival.
                    </span>
                  </div>
                ) : (
                  <div className="p-3.5 bg-accent-green-light border border-accent-green/10 rounded-xl flex items-start gap-2.5 text-accent-green text-xs">
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-semibold">
                      Your transaction is 256-bit encrypted. Razorpay secures your payment fields. Total protection.
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Right Side: Order Summary */}
        <aside className="lg:col-span-5 w-full sticky top-24">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-primary/10 shadow-xl flex flex-col gap-6">
            <h3 className="font-outfit font-black text-xl text-foreground flex items-center gap-2 border-b border-primary/5 pb-4">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <span>Order Summary</span>
            </h3>

            {/* Cart Items List */}
            <div className="flex flex-col gap-4 max-h-[260px] overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-light/20 flex items-center justify-center p-1 border border-primary/5 relative shrink-0">
                      <Image 
                        src={item.imageFront || "/hero_pouch_mockup.png"}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-contain p-0.5"
                      />
                    </div>
                    <div className="flex flex-col">
                      <h5 className="font-bold text-foreground line-clamp-1 leading-tight">{item.name}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-foreground/40 font-bold">{item.size}</span>
                        <span className="text-[10px] text-foreground/20 font-bold">•</span>
                        <div className="flex items-center gap-1 bg-primary-light/60 border border-primary/5 rounded-lg px-1.5 py-0.5">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-3.5 h-3.5 rounded-md hover:bg-white flex items-center justify-center text-foreground/60 hover:text-primary transition-all font-black text-[9px] cursor-pointer"
                          >
                            -
                          </button>
                          <span className="text-[9px] font-bold text-foreground/80 min-w-[10px] text-center">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-3.5 h-3.5 rounded-md hover:bg-white flex items-center justify-center text-foreground/60 hover:text-primary transition-all font-black text-[9px] cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="font-outfit font-black text-foreground shrink-0">₹{item.price * item.quantity}</span>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="text-center py-10 flex flex-col items-center">
                  <ShoppingBag className="w-8 h-8 text-foreground/20 mb-2" />
                  <p className="text-xs font-semibold text-foreground/40">No items in your checkout cup.</p>
                </div>
              )}
            </div>

            {/* Promo code field */}
            <div className="border-t border-primary/5 pt-4">
              <span className="text-[11px] font-bold text-foreground/50 block mb-2">Have a Promo Code?</span>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-accent-green-light border border-accent-green/20 px-3.5 py-2.5 rounded-xl text-accent-green text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Coupon &apos;{appliedCoupon}&apos; Active</span>
                  </div>
                  <button 
                    onClick={removeCoupon}
                    className="text-foreground/40 hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter code (e.g. NATURAL10)" 
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                    className="flex-1 px-3 py-2 border border-primary/10 focus:border-primary focus:outline-none rounded-xl text-xs font-semibold uppercase"
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    className="bg-foreground text-white hover:bg-foreground/80 px-4 rounded-xl text-xs font-bold transition-all"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && <span className="text-[10px] font-bold text-red-500 mt-1 block">{couponError}</span>}

              {/* Available Coupons list */}
              {availableCoupons.length > 0 && (
                <div className="mt-4 border-t border-primary/5 pt-3 flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider block">Available Coupons</span>
                  <div className="flex flex-col gap-2">
                    {availableCoupons.map((coupon) => {
                      const isFirstOrderRestrictionFailed = coupon.isFirstOrderOnly && userHasOrders;
                      const isEligible = cartTotal >= coupon.minOrderAmount && !isFirstOrderRestrictionFailed;
                      const isApplied = appliedCoupon === coupon.code;
                      
                      return (
                        <div 
                          key={coupon._id}
                          className={`p-2.5 rounded-xl border border-dashed text-xs flex items-center justify-between transition-all ${
                            isApplied 
                              ? "bg-accent-green-light border-accent-green text-accent-green"
                              : isEligible 
                                ? "bg-primary-light/30 border-primary/25 hover:border-primary" 
                                : "bg-slate-50/50 border-foreground/10 opacity-70"
                          }`}
                        >
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-outfit font-black tracking-wide uppercase text-foreground">
                                {coupon.code}
                              </span>
                              {coupon.isFirstOrderOnly && (
                                <span className="text-[9px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-600 px-1.5 py-0.5 rounded-full uppercase leading-none">
                                  First Order Only
                                </span>
                              )}
                              {isApplied && (
                                <span className="text-[9px] font-bold bg-accent-green text-white px-1.5 py-0.5 rounded-full uppercase leading-none">
                                  Applied
                                </span>
                              )}
                            </div>
                            {isFirstOrderRestrictionFailed ? (
                              <span className="text-[10px] text-red-500 font-bold leading-tight mt-0.5">
                                First order only (ineligible: you have previous orders)
                              </span>
                            ) : (
                              <span className="text-[10px] text-foreground/60 font-semibold leading-tight mt-0.5">
                                {coupon.discountType === "percentage" ? (
                                  `Save ${coupon.discount}% ${coupon.maxDiscountLimit > 0 ? `(Up to ₹${coupon.maxDiscountLimit})` : ""} on orders above ₹${coupon.minOrderAmount}`
                                ) : (
                                  `Save ₹${coupon.discount} on orders above ₹${coupon.minOrderAmount}`
                                )}
                              </span>
                            )}
                          </div>
                          
                          <div className="shrink-0 pl-2">
                            {isApplied ? (
                              <span className="text-[10px] font-black text-accent-green uppercase">Active</span>
                            ) : isFirstOrderRestrictionFailed ? (
                              <span className="text-[9px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md border border-red-100 uppercase">
                                Ineligible
                              </span>
                            ) : isEligible ? (
                              <button 
                                onClick={async () => {
                                  setCouponCode(coupon.code);
                                  try {
                                    const res = await fetch(`/api/coupons/validate?code=${coupon.code}&cartTotal=${cartTotal}`);
                                    const data = await res.json();
                                    if (res.ok && data.success) {
                                      setDiscount(data.discount);
                                      setAppliedCoupon(data.code);
                                      setAppliedCouponMinAmount(data.minOrderAmount || 0);
                                      setCouponError("");
                                      toast.success(`Coupon '${data.code}' applied! ₹${data.discount} discount added.`);
                                    } else {
                                      setCouponError(data.error || "Failed to apply coupon.");
                                    }
                                  } catch (err) {
                                    console.error(err);
                                    setCouponError("Error applying coupon.");
                                  }
                                }}
                                className="bg-primary hover:bg-primary-hover text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-xs transition-all cursor-pointer"
                              >
                                Apply
                              </button>
                            ) : (
                              <span className="text-[9px] font-bold text-foreground/40 bg-black/5 px-2 py-1 rounded-md">
                                Needs ₹{coupon.minOrderAmount - cartTotal} more
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {cartTotal < 499 ? (
              <div className="bg-amber-50 text-amber-800 text-[10px] font-bold p-3 rounded-xl border border-amber-100/50 text-center animate-in fade-in duration-200">
                Add <span className="text-primary">₹{499 - cartTotal}</span> more to qualify for <span className="text-primary">FREE Shipping</span>! (Free shipping above ₹499)
              </div>
            ) : (
              <div className="bg-emerald-50 text-emerald-800 text-[10px] font-bold p-3 rounded-xl border border-emerald-100/50 text-center animate-in fade-in duration-200">
                🎉 Congratulations! You qualify for <span className="text-accent-green font-black">FREE Shipping</span>!
              </div>
            )}

            {/* Calculations */}
            <div className="border-t border-primary/5 pt-4 flex flex-col gap-3 text-sm font-semibold">
              <div className="flex items-center justify-between text-foreground/60">
                <span>Items Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex items-center justify-between text-foreground/60">
                <span>Shipping Charges</span>
                <span>{shippingFee === 0 ? <span className="text-accent-green font-bold">FREE</span> : `₹${shippingFee}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-accent-green">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              {/* Grand Total */}
              <div className="flex items-center justify-between text-foreground border-t border-primary/5 pt-4 text-base font-black font-outfit">
                <span>Total Amount Due</span>
                <span className="text-xl text-primary">₹{grandTotal}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button 
              disabled={cart.length === 0 || submitting || !isLoggedIn}
              onClick={handlePlaceOrder}
              className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-all text-sm flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing secure order...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    Place Order ({paymentMethod === "COD" ? "Cash on Delivery" : "Pay via Razorpay"})
                  </span>
                </>
              )}
            </button>

            <Link 
              href="/#products"
              className="w-full border border-primary/20 hover:border-primary text-primary hover:bg-primary-light/10 font-bold py-3.5 rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
            >
              Shop More / Add Products
            </Link>
            
            {!isLoggedIn && (
              <p className="text-[11px] font-bold text-center text-red-500">
                ⚠️ Please sign in on the left to complete your checkout.
              </p>
            )}

            <div className="text-[11px] text-center text-foreground/30 font-bold flex items-center justify-center gap-1.5">
              <span>Nature&apos;s goodness, preserved with standard safety.</span>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer copyright */}
      <footer className="border-t border-primary/5 py-4 text-center text-xs text-foreground/30 font-semibold mt-12 bg-white/40">
        <p>© {new Date().getFullYear()} AM DRIETS. All rights reserved.</p>
      </footer>
    </div>
  );
}
