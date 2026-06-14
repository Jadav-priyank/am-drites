"use client";

import { useState, useRef, useEffect } from "react";
import { X, Mail, Lock, User, Loader2, ShieldCheck, RefreshCw, ArrowLeft } from "lucide-react";

// ─── OTP Input ────────────────────────────────────────────────────────────────
function OtpInput({ value, onChange }) {
  const inputs = useRef([]);

  const handleKey = (e, idx) => {
    if (e.key === "Backspace" && !e.target.value && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handleChange = (e, idx) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    const arr = value.split("");
    arr[idx] = v;
    const next = arr.join("").padEnd(6, "").slice(0, 6);
    onChange(next);
    if (v && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) { onChange(pasted.padEnd(6, "").slice(0, 6)); inputs.current[Math.min(pasted.length, 5)]?.focus(); }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[idx] || ""}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKey(e, idx)}
          className="w-11 h-12 text-center text-lg font-black rounded-xl border-2 border-primary/20 bg-primary-light/5
                     focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
                     transition-all duration-150 text-foreground"
        />
      ))}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function AuthModal({ isOpen, setIsOpen, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState("login");

  // Signup steps: 'form' | 'otp'
  const [signupStep, setSignupStep] = useState("form");

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp]           = useState("");
  const [otpTimer, setOtpTimer] = useState(0); // seconds until resend allowed
  const timerRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [info, setInfo]       = useState("");

  if (!isOpen) return null;

  // ── Timer helpers ──────────────────────────────────────────────────────────
  const startTimer = (secs = 60) => {
    setOtpTimer(secs);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setOtpTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  // ── Tab switch ─────────────────────────────────────────────────────────────
  const switchTab = (tab) => {
    setActiveTab(tab);
    setSignupStep("form");
    setError(""); setInfo("");
    setOtp(""); setFormData({ name: "", email: "", password: "" });
    clearInterval(timerRef.current);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      onAuthSuccess(data.user);
      setIsOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Signup Step 1: send OTP ────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setInfo("");
    try {
      const res  = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      setSignupStep("otp");
      setInfo(`A 6-digit code was sent to ${formData.email}`);
      setOtp("");
      startTimer(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Signup Step 2: verify OTP ──────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.replace(/\s/g, "").length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      onAuthSuccess(data.user);
      setIsOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-verify when all 6 digits entered
  useEffect(() => {
    if (otp.replace(/\s/g, "").length === 6 && signupStep === "otp" && !loading) {
      handleVerifyOtp();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // ── Resend OTP ─────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (otpTimer > 0) return;
    setLoading(true); setError(""); setInfo("");
    try {
      const res  = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend OTP");
      setOtp("");
      setInfo("A new code has been sent.");
      startTimer(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
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
          {["login", "signup"].map((tab) => (
            <button
              key={tab}
              onClick={() => switchTab(tab)}
              className={`flex-1 py-4 text-center font-outfit font-bold text-sm transition-colors capitalize
                ${activeTab === tab
                  ? "bg-primary-light/10 text-primary border-b-2 border-primary"
                  : "text-foreground/50 hover:bg-primary-light/5"}`}
            >
              {tab === "login" ? "Login" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Close */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-black/5 text-foreground/50 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Body */}
        <div className="p-6 sm:p-8">

          {/* ── LOGIN ─────────────────────────────────────────────────────── */}
          {activeTab === "login" && (
            <>
              <div className="mb-6 text-center">
                <h3 className="font-outfit font-extrabold text-2xl text-foreground">Welcome Back</h3>
                <p className="text-sm text-foreground/50 mt-1">Sign in to access your orders and saved items.</p>
              </div>
              {error && <ErrorBanner msg={error} />}
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <IconInput icon={<Mail className="w-4 h-4" />} type="email"    name="email"    placeholder="Email Address" value={formData.email}    onChange={handleChange} />
                <IconInput icon={<Lock className="w-4 h-4" />} type="password" name="password" placeholder="Password"      value={formData.password} onChange={handleChange} minLength={6} />
                <SubmitBtn loading={loading} label="Sign In" />
              </form>
            </>
          )}

          {/* ── SIGNUP STEP 1: form ────────────────────────────────────────── */}
          {activeTab === "signup" && signupStep === "form" && (
            <>
              <div className="mb-6 text-center">
                <h3 className="font-outfit font-extrabold text-2xl text-foreground">Create Account</h3>
                <p className="text-sm text-foreground/50 mt-1">Join us to preserve nature&apos;s goodness in your meals.</p>
              </div>
              {error && <ErrorBanner msg={error} />}
              <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                <IconInput icon={<User className="w-4 h-4" />} type="text"     name="name"     placeholder="Full Name"     value={formData.name}     onChange={handleChange} />
                <IconInput icon={<Mail className="w-4 h-4" />} type="email"    name="email"    placeholder="Email Address" value={formData.email}    onChange={handleChange} />
                <IconInput icon={<Lock className="w-4 h-4" />} type="password" name="password" placeholder="Password (min 6 chars)" value={formData.password} onChange={handleChange} minLength={6} />
                <SubmitBtn loading={loading} label="Send Verification Code" icon={<ShieldCheck className="w-4 h-4" />} />
              </form>
            </>
          )}

          {/* ── SIGNUP STEP 2: OTP ────────────────────────────────────────── */}
          {activeTab === "signup" && signupStep === "otp" && (
            <>
              {/* Back button */}
              <button
                onClick={() => { setSignupStep("form"); setError(""); setInfo(""); setOtp(""); clearInterval(timerRef.current); }}
                className="flex items-center gap-1 text-xs text-foreground/40 hover:text-primary transition-colors mb-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <div className="mb-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-primary mx-auto mb-3">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="font-outfit font-extrabold text-2xl text-foreground">Verify Your Email</h3>
                <p className="text-sm text-foreground/50 mt-1 leading-relaxed">
                  Enter the 6-digit code sent to<br />
                  <span className="font-semibold text-foreground/70">{formData.email}</span>
                </p>
              </div>

              {error && <ErrorBanner msg={error} />}
              {info  && !error && <InfoBanner  msg={info}  />}

              <div className="flex flex-col gap-5">
                <OtpInput value={otp} onChange={setOtp} />

                <SubmitBtn
                  loading={loading}
                  label={loading ? "Verifying…" : "Verify & Create Account"}
                  onClick={handleVerifyOtp}
                  type="button"
                />

                {/* Resend */}
                <div className="text-center text-xs text-foreground/50">
                  Didn&apos;t receive it?{" "}
                  {otpTimer > 0 ? (
                    <span className="font-semibold text-foreground/40">Resend in {otpTimer}s</span>
                  ) : (
                    <button
                      onClick={handleResend}
                      disabled={loading}
                      className="inline-flex items-center gap-1 text-primary font-semibold hover:underline disabled:opacity-50"
                    >
                      <RefreshCw className="w-3 h-3" /> Resend Code
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────────
function IconInput({ icon, ...props }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-foreground/30">
        {icon}
      </div>
      <input
        {...props}
        required
        className="w-full pl-10 pr-4 py-3 rounded-xl bg-primary-light/5 border border-primary/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-base text-foreground transition-all"
      />
    </div>
  );
}

function SubmitBtn({ loading, label, icon, type = "submit", onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className="mt-1 w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (<>{icon}{label}</>)}
    </button>
  );
}

function ErrorBanner({ msg }) {
  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs text-center font-medium">
      {msg}
    </div>
  );
}

function InfoBanner({ msg }) {
  return (
    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-xs text-center font-medium">
      {msg}
    </div>
  );
}
