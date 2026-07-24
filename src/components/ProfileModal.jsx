"use client";

import { useState } from "react";
import { X, Mail, Phone, MapPin, Plus, Trash2, Edit3, CheckCircle2, User, Loader2, Info, ShoppingBag, ChevronRight, ArrowLeft, Printer, Truck, FileText, Check } from "lucide-react";
import { toast } from "sonner";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry"
];

import { useEffect } from "react";

export default function ProfileModal({ isOpen, setIsOpen, user, onUpdateUser, initialTab = "addresses" }) {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Profile Tab switcher state
  const [activeTab, setActiveTab] = useState("addresses"); // "addresses" | "orders"
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Address Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pinCode: "",
    isDefault: false
  });

  // Fetch orders when orders tab is active
  const fetchUserOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders || []);
      } else {
        toast.error(data.error || "Failed to load order history");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server for orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === "orders") {
      fetchUserOrders();
    }
  }, [isOpen, activeTab]);

  // Reset tab on modal close/open
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || "addresses");
      setSelectedOrder(null);
      setShowForm(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleOpenAdd = () => {
    setFormData({
      name: user.name || "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pinCode: "",
      isDefault: false
    });
    setIsEditing(false);
    setEditAddressId(null);
    setShowForm(true);
  };

  const handleOpenEdit = (addr) => {
    setFormData({
      name: addr.name,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 || "",
      city: addr.city,
      state: addr.state,
      pinCode: addr.pinCode,
      isDefault: addr.isDefault
    });
    setIsEditing(true);
    setEditAddressId(addr._id);
    setShowForm(true);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Please enter recipient name.";
    if (!formData.phone.trim() || formData.phone.length < 10) return "Please enter a valid 10-digit phone number.";
    if (!formData.addressLine1.trim()) return "Please enter street address/building details.";
    if (!formData.city.trim()) return "Please enter city.";
    if (!formData.state) return "Please select a state.";
    if (!formData.pinCode.trim() || formData.pinCode.length !== 6) return "Please enter a valid 6-digit PIN code.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }

    setLoading(true);
    try {
      const endpoint = "/api/user/addresses";
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing 
        ? { addressId: editAddressId, ...formData }
        : formData;

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(isEditing ? "Address updated successfully!" : "Address saved to profile!");
        onUpdateUser({ ...user, addresses: data.addresses });
        setShowForm(false);
      } else {
        toast.error(data.error || "Failed to save address.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/user/addresses?id=${addressId}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Address deleted successfully.");
        onUpdateUser({ ...user, addresses: data.addresses });
      } else {
        toast.error(data.error || "Failed to delete address.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error communicating with database.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addr) => {
    if (addr.isDefault) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          addressId: addr._id, 
          isDefault: true 
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Default address updated.");
        onUpdateUser({ ...user, addresses: data.addresses });
      } else {
        toast.error(data.error || "Failed to update default address.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating default address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div 
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg md:max-w-xl lg:max-w-2xl bg-white h-full flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-primary/5 flex items-center justify-between bg-primary-light/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
              <User className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h4 className="font-outfit font-black text-lg md:text-xl text-foreground leading-tight">My Profile</h4>
              <span className="text-xs md:text-sm text-foreground/50 font-bold uppercase tracking-wide">Manage account & addresses</span>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-black/5 rounded-full text-foreground/50 hover:text-primary transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex w-full border-b border-primary/5 bg-slate-50 shrink-0">
          <button
            onClick={() => { setActiveTab("addresses"); setSelectedOrder(null); }}
            className={`flex-1 py-3.5 text-center font-outfit font-black text-sm md:text-base tracking-wide transition-all ${
              activeTab === "addresses"
                ? "bg-white text-primary border-b-2 border-primary"
                : "text-foreground/40 hover:bg-white/50"
            }`}
          >
            Saved Addresses
          </button>
          <button
            onClick={() => { setActiveTab("orders"); setSelectedOrder(null); }}
            className={`flex-1 py-3.5 text-center font-outfit font-black text-sm md:text-base tracking-wide transition-all ${
              activeTab === "orders"
                ? "bg-white text-primary border-b-2 border-primary"
                : "text-foreground/40 hover:bg-white/50"
            }`}
          >
            Order History
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-7 flex flex-col gap-6">
          
          {activeTab === "addresses" && (
            <>
              {/* User Personal Details */}
              <div className="bg-primary-light/20 border border-primary/5 p-4.5 md:p-5 rounded-2xl flex flex-col gap-2.5">
                <span className="text-xs md:text-sm font-bold text-primary uppercase tracking-widest leading-none block mb-1">Account Info</span>
                <div className="flex items-center justify-between text-sm md:text-base font-bold">
                  <span className="text-foreground/50">Full Name</span>
                  <span className="text-foreground">{user?.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm md:text-base font-bold">
                  <span className="text-foreground/50">Email Address</span>
                  <span className="text-foreground truncate max-w-[240px] md:max-w-[340px]">{user?.email}</span>
                </div>
              </div>

              {/* Form to Add / Edit Address */}
              {showForm ? (
                <div className="border border-primary/10 rounded-2xl p-5 md:p-6 bg-primary-light/5 flex flex-col gap-4.5 animate-in slide-in-from-top-3">
                  <div className="flex justify-between items-center border-b border-primary/5 pb-2.5">
                    <span className="text-sm md:text-base font-bold text-foreground">
                      {isEditing ? "Edit Saved Address" : "Add New Delivery Address"}
                    </span>
                    <button 
                      onClick={() => setShowForm(false)}
                      className="text-foreground/40 hover:text-red-500 text-xs md:text-sm font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                    {/* Recipient Name */}
                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="text-xs md:text-sm font-bold text-foreground/70">Recipient Full Name *</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. Rahul Sharma"
                        required
                        className="w-full px-3.5 py-2.5 md:py-3 rounded-xl bg-white border border-primary/10 focus:border-primary focus:outline-none text-sm md:text-base font-semibold text-foreground"
                      />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="text-xs md:text-sm font-bold text-foreground/70">10-Digit Contact Number *</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. 9876543210"
                        maxLength={10}
                        required
                        className="w-full px-3.5 py-2.5 md:py-3 rounded-xl bg-white border border-primary/10 focus:border-primary focus:outline-none text-sm md:text-base font-semibold text-foreground"
                      />
                    </div>

                    {/* Address Line 1 */}
                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="text-xs md:text-sm font-bold text-foreground/70">House/Flat No., Building, Street *</label>
                      <input 
                        type="text" 
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleInputChange}
                        placeholder="e.g. Flat 302, Green Meadows"
                        required
                        className="w-full px-3.5 py-2.5 md:py-3 rounded-xl bg-white border border-primary/10 focus:border-primary focus:outline-none text-sm md:text-base font-semibold text-foreground"
                      />
                    </div>

                    {/* Address Line 2 */}
                    <div className="flex flex-col gap-1.5 col-span-2">
                      <label className="text-xs md:text-sm font-bold text-foreground/70">Area, Locality, Landmark (Optional)</label>
                      <input 
                        type="text" 
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleInputChange}
                        placeholder="e.g. Near St. Mary Church"
                        className="w-full px-3.5 py-2.5 md:py-3 rounded-xl bg-white border border-primary/10 focus:border-primary focus:outline-none text-sm md:text-base font-semibold text-foreground"
                      />
                    </div>

                    {/* City */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs md:text-sm font-bold text-foreground/70">City *</label>
                      <input 
                        type="text" 
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Pune"
                        required
                        className="w-full px-3.5 py-2.5 md:py-3 rounded-xl bg-white border border-primary/10 focus:border-primary focus:outline-none text-sm md:text-base font-semibold text-foreground"
                      />
                    </div>

                    {/* State */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs md:text-sm font-bold text-foreground/70">State *</label>
                      <select 
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2.5 md:py-3 rounded-xl bg-white border border-primary/10 focus:border-primary focus:outline-none text-sm md:text-base font-semibold text-foreground cursor-pointer"
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    {/* PIN Code */}
                    <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                      <label className="text-xs md:text-sm font-bold text-foreground/70">PIN Code *</label>
                      <input 
                        type="text" 
                        name="pinCode"
                        value={formData.pinCode}
                        onChange={handleInputChange}
                        placeholder="e.g. 411001"
                        maxLength={6}
                        required
                        className="w-full px-3.5 py-2.5 md:py-3 rounded-xl bg-white border border-primary/10 focus:border-primary focus:outline-none text-sm md:text-base font-semibold text-foreground"
                      />
                    </div>

                    {/* Default Toggle Checkbox */}
                    <div className="flex items-center gap-2.5 col-span-2 mt-2">
                      <input 
                        type="checkbox" 
                        id="isDefault"
                        name="isDefault"
                        checked={formData.isDefault}
                        onChange={handleInputChange}
                        className="w-4.5 h-4.5 rounded text-primary border-primary/20 focus:ring-primary cursor-pointer accent-primary"
                      />
                      <label htmlFor="isDefault" className="text-xs md:text-sm font-bold text-foreground/70 cursor-pointer select-none">
                        Set as my default delivery address
                      </label>
                    </div>

                    {/* Save Button */}
                    <button 
                      type="submit"
                      disabled={loading}
                      className="col-span-2 bg-primary hover:bg-primary-hover text-white text-sm md:text-base font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-70 mt-2 cursor-pointer"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <span>Save Address</span>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                /* Addresses List */
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm font-bold text-foreground/50 uppercase tracking-wider">Saved Addresses</span>
                    <button 
                      onClick={handleOpenAdd}
                      className="text-xs md:text-sm font-bold text-primary flex items-center gap-1.5 hover:underline cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Address
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    {user?.addresses && user.addresses.length > 0 ? (
                      user.addresses.map((addr) => (
                        <div 
                          key={addr._id} 
                          className={`border p-4.5 md:p-5 rounded-2xl flex flex-col gap-3.5 transition-all relative ${addr.isDefault ? "border-primary bg-primary-light/5 shadow-xs" : "border-primary/5 bg-white hover:border-primary/25"}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-outfit font-black text-base md:text-lg text-foreground">{addr.name}</span>
                                {addr.isDefault && (
                                  <span className="text-[10px] md:text-xs font-bold bg-primary text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider select-none">
                                    Default
                                  </span>
                                )}
                              </div>
                              <span className="text-xs md:text-sm text-foreground/50 font-bold block mt-1">Phone: {addr.phone}</span>
                            </div>

                            {/* Actions Row */}
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleOpenEdit(addr)}
                                className="p-2 hover:bg-primary-light rounded-lg text-foreground/40 hover:text-primary transition-colors cursor-pointer"
                                title="Edit Address"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(addr._id)}
                                className="p-2 hover:bg-red-50 rounded-lg text-foreground/40 hover:text-red-500 transition-colors cursor-pointer"
                                title="Delete Address"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Address detail strings */}
                          <p className="text-sm md:text-base text-foreground/80 leading-relaxed font-semibold">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                            <br />
                            {addr.city}, {addr.state} - {addr.pinCode}
                          </p>

                          {/* Default Toggle Quick Action */}
                          {!addr.isDefault && (
                            <button 
                              onClick={() => handleSetDefault(addr)}
                              className="text-xs md:text-sm font-bold text-foreground/40 hover:text-primary mt-1 text-left flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4 text-foreground/20 hover:text-primary" />
                              <span>Set as default</span>
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 border border-dashed border-primary/10 rounded-2xl bg-slate-50/50">
                        <MapPin className="w-10 h-10 text-foreground/20 mx-auto mb-2" />
                        <p className="text-sm md:text-base font-bold text-foreground/60">No saved addresses yet</p>
                        <p className="text-xs md:text-sm text-foreground/40 mt-1 max-w-[240px] mx-auto leading-relaxed">Save delivery details here to enjoy instant checkouts on your future organic fruit snacks.</p>
                        <button 
                          onClick={handleOpenAdd}
                          className="mt-4 bg-primary text-white text-xs md:text-sm font-bold px-5 py-3 rounded-full shadow-md hover:bg-primary-hover transition-all cursor-pointer"
                        >
                          Add First Address
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "orders" && (
            <div className="flex flex-col gap-5">
              {!selectedOrder ? (
                <>
                  <span className="text-xs md:text-sm font-bold text-foreground/50 uppercase tracking-wider block">Your Past Orders</span>
                  {ordersLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <span className="text-xs md:text-sm font-bold text-foreground/45 uppercase tracking-wide">Loading orders...</span>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-primary/10 rounded-2xl bg-slate-50/50">
                      <ShoppingBag className="w-10 h-10 text-foreground/20 mx-auto mb-2" />
                      <p className="text-sm md:text-base font-bold text-foreground/60">No orders yet</p>
                      <p className="text-xs md:text-sm text-foreground/40 mt-1 max-w-[240px] mx-auto leading-relaxed">You haven&apos;t placed any orders yet. Visit our shop to get started!</p>
                      <button 
                        onClick={() => { setIsOpen(false); }}
                        className="mt-4 bg-primary text-white text-xs md:text-sm font-bold px-5 py-3 rounded-full shadow-md hover:bg-primary-hover transition-all cursor-pointer"
                      >
                        Explore Snacks
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {orders.map((order) => (
                        <div
                          key={order._id}
                          onClick={() => setSelectedOrder(order)}
                          className="border border-primary/5 hover:border-primary/25 p-4.5 md:p-5 rounded-2xl bg-white hover:bg-primary-light/5 cursor-pointer transition-all flex flex-col gap-3 relative shadow-xs"
                        >
                          <div className="flex justify-between items-center text-sm md:text-base">
                            <span className="font-mono text-foreground/50 font-bold">
                              #AMD-{order._id.substring(order._id.length - 8).toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-extrabold uppercase tracking-wide border ${
                              order.status === "Delivered" || order.status === "Completed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              order.status === "Pending" ? "bg-amber-50 text-amber-600 border-amber-100" :
                              order.status === "Processing" ? "bg-blue-50 text-blue-600 border-blue-100" :
                              order.status === "Shipped" ? "bg-purple-50 text-purple-600 border-purple-100" :
                              order.status === "Out for Delivery" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                              "bg-rose-50 text-rose-600 border-rose-100"
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-end">
                            <div>
                              <span className="text-xs text-foreground/40 font-bold block">Ordered On</span>
                              <span className="text-sm md:text-base font-semibold text-foreground/80">
                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                })}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-foreground/40 font-bold block">Grand Total</span>
                              <span className="text-base md:text-lg font-black text-foreground">₹{order.totalAmount}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-primary hover:underline self-end mt-1">
                            <span>Inspect & Track Order</span>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Detailed Order Inspection View */
                <div className="flex flex-col gap-5.5 animate-in slide-in-from-right duration-200">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="flex items-center gap-2 text-xs md:text-sm font-bold text-foreground/50 hover:text-primary transition-colors self-start cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Order History</span>
                  </button>

                  <div className="border-b border-primary/5 pb-3">
                    <h5 className="font-outfit font-black text-lg md:text-xl text-foreground leading-tight">
                      Order Details
                    </h5>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs md:text-sm text-foreground/50 font-bold font-mono">
                        #AMD-{selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}
                      </span>
                      <span className="text-xs md:text-sm text-foreground/50 font-bold">
                        Placed on: {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>

                  {/* VISUAL SHIPMENT TRACKING STEP TIMELINE */}
                  <div className="bg-primary-light/10 border border-primary/5 p-4.5 md:p-5 rounded-2xl">
                    <span className="text-xs md:text-sm font-bold text-primary uppercase tracking-widest leading-none block mb-4">Delivery Progress</span>
                    
                    {selectedOrder.status === "Cancelled" ? (
                      <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-500 text-xs md:text-sm font-bold text-center">
                        ⚠️ Order was Cancelled
                      </div>
                    ) : (
                      <div className="relative flex justify-between items-center w-full px-2">
                        {/* Status tracker line */}
                        <div className="absolute left-0 top-[14px] w-full h-[3px] bg-slate-200 -z-0">
                          <div 
                            className="h-full bg-primary transition-all duration-500" 
                            style={{ 
                              width: `${
                                selectedOrder.status === "Pending" ? "0%" :
                                selectedOrder.status === "Processing" ? "33.3%" :
                                selectedOrder.status === "Shipped" || selectedOrder.status === "Out for Delivery" ? "66.6%" :
                                selectedOrder.status === "Delivered" || selectedOrder.status === "Completed" ? "100%" : "0%"
                              }` 
                            }}
                          />
                        </div>

                        {/* Milestones steps */}
                        {["Placed", "Processing", "Shipped", "Delivered"].map((step, idx) => {
                          const currentStepIdx = 
                            selectedOrder.status === "Pending" ? 0 :
                            selectedOrder.status === "Processing" ? 1 :
                            selectedOrder.status === "Shipped" || selectedOrder.status === "Out for Delivery" ? 2 :
                            selectedOrder.status === "Delivered" || selectedOrder.status === "Completed" ? 3 : 0;
                          
                          const isCompleted = idx <= currentStepIdx;
                          const isActive = idx === currentStepIdx;

                          return (
                            <div key={step} className="flex flex-col items-center z-10 relative">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                                isCompleted 
                                  ? "bg-primary border-primary text-white shadow shadow-primary/20" 
                                  : "bg-white border-slate-200 text-slate-400"
                              }`}>
                                {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                              </div>
                              <span className={`text-xs font-bold mt-1.5 ${isActive ? "text-primary font-black" : isCompleted ? "text-foreground/75" : "text-foreground/35"}`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Shipment Tracking details */}
                  {selectedOrder.courierPartner && (
                    <div className="bg-slate-50 border border-primary/5 p-4.5 rounded-2xl flex items-start gap-3">
                      <Truck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-foreground/40 uppercase block leading-none">Shipment Tracking</span>
                        <div className="text-sm font-bold text-foreground leading-tight mt-1">
                          {selectedOrder.courierPartner} - <span className="font-mono text-primary select-all">{selectedOrder.trackingNumber}</span>
                        </div>
                        {selectedOrder.trackingUrl && (
                          <a 
                            href={selectedOrder.trackingUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs md:text-sm font-bold text-primary hover:underline block mt-1.5"
                          >
                            Track shipment online →
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Delivery Location address preview */}
                  <div className="flex flex-col gap-1.5 text-xs md:text-sm">
                    <span className="text-xs font-bold text-foreground/50 uppercase tracking-wide">Delivered To</span>
                    <div className="font-bold text-foreground text-sm md:text-base">{selectedOrder.shippingAddress?.name}</div>
                    <p className="text-foreground/70 leading-relaxed font-semibold text-xs md:text-sm">
                      {selectedOrder.shippingAddress?.addressLine1}
                      {selectedOrder.shippingAddress?.addressLine2 && `, ${selectedOrder.shippingAddress.addressLine2}`}
                      <br />
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pinCode}
                    </p>
                  </div>

                  {/* Items Summary list */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-xs font-bold text-foreground/50 uppercase tracking-wide">Snack Items</span>
                    <div className="flex flex-col gap-2.5">
                      {selectedOrder.items?.map((item) => (
                        <div key={item._id || item.id} className="flex justify-between items-center text-xs md:text-sm bg-slate-50/50 p-3 rounded-xl border border-primary/5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center text-primary font-outfit font-black text-xs shrink-0">
                              {item.size}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground text-sm leading-none">{item.name}</span>
                              <span className="text-xs text-foreground/40 mt-0.5">₹{item.price} each</span>
                            </div>
                          </div>
                          <span className="font-bold text-foreground/70 text-sm">Qty: {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Calculation / Invoice button */}
                  <div className="border-t border-primary/5 pt-4 flex flex-col gap-3 mt-auto">
                    <div className="flex justify-between items-center text-xs md:text-sm font-bold">
                      <span className="text-foreground/50">Status</span>
                      <span className="text-foreground uppercase">{selectedOrder.paymentStatus} ({selectedOrder.paymentMethod})</span>
                    </div>
                    <div className="flex justify-between items-center text-base md:text-lg font-bold border-b border-primary/5 pb-4">
                      <span className="text-foreground/50">Amount Paid</span>
                      <span className="text-base md:text-lg font-black text-primary">₹{selectedOrder.totalAmount}</span>
                    </div>

                    <button
                      onClick={() => window.open(`/orders/invoice/${selectedOrder._id}`, "_blank")}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 md:py-4 rounded-xl text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all mt-1"
                    >
                      <Printer className="w-4 h-4 md:w-5 md:h-5" />
                      <span>Print Tax Invoice</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer text */}
        <div className="p-4 border-t border-primary/5 bg-primary-light/5 text-center text-xs md:text-sm text-foreground/40 font-bold flex items-center justify-center gap-1.5">
          <Info className="w-4 h-4" />
          <span>Need help? Contact support at care@amdriets.com</span>
        </div>

      </div>
    </div>
  );
}
