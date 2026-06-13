"use client";

import { useState } from "react";
import { X, Mail, Lock, User, Loader2 } from "lucide-react";

export default function AuthModal({ isOpen, setIsOpen, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState("login"); // 'login' or 'signup'
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = activeTab === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload = activeTab === "login" 
        ? { email: formData.email, password: formData.password }
        : formData;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      onAuthSuccess(data.user);
      setIsOpen(false);
      setFormData({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl z-10 animate-in zoom-in-95 duration-200 overflow-hidden border border-primary/10">
        
        {/* Header Tabs */}
        <div className="flex w-full border-b border-primary/10">
          <button 
            onClick={() => { setActiveTab("login"); setError(""); }}
            className={`flex-1 py-4 text-center font-outfit font-bold text-sm transition-colors ${activeTab === "login" ? "bg-primary-light/10 text-primary border-b-2 border-primary" : "text-foreground/50 hover:bg-primary-light/5"}`}
          >
            Login
          </button>
          <button 
            onClick={() => { setActiveTab("signup"); setError(""); }}
            className={`flex-1 py-4 text-center font-outfit font-bold text-sm transition-colors ${activeTab === "signup" ? "bg-primary-light/10 text-primary border-b-2 border-primary" : "text-foreground/50 hover:bg-primary-light/5"}`}
          >
            Sign Up
          </button>
        </div>

        {/* Close button */}
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/5 text-foreground/50 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Form Body */}
        <div className="p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h3 className="font-outfit font-extrabold text-2xl text-foreground">
              {activeTab === "login" ? "Welcome Back" : "Create Account"}
            </h3>
            <p className="text-sm text-foreground/50 mt-1">
              {activeTab === "login" 
                ? "Sign in to access your orders and saved items." 
                : "Join us to preserve nature's goodness in your meals."}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {activeTab === "signup" && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-foreground/30" />
                </div>
                <input 
                  type="text" 
                  name="name"
                  placeholder="Full Name" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-primary-light/5 border border-primary/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-base text-foreground transition-all"
                />
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-foreground/30" />
              </div>
              <input 
                type="email" 
                name="email"
                placeholder="Email Address" 
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-primary-light/5 border border-primary/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-base text-foreground transition-all"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-foreground/30" />
              </div>
              <input 
                type="password" 
                name="password"
                placeholder="Password" 
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-primary-light/5 border border-primary/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-base text-foreground transition-all"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="mt-2 w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all text-sm flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (activeTab === "login" ? "Sign In" : "Create Account")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
