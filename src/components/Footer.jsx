"use client";

import { useState } from "react";
import { Leaf, Check, Mail } from "lucide-react";

// Inline brand SVGs (Instagram & Facebook removed from lucide-react)
const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
import Image from "next/image";

export default function Footer({ scrollTo, setActiveCategory }) {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState(""); // "" | "loading" | "success" | "error"
  const [newsletterMsg, setNewsletterMsg] = useState("");

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewsletterStatus("success");
        setNewsletterMsg(data.message || "Successfully subscribed!");
        setNewsletterEmail("");
      } else {
        setNewsletterStatus("error");
        setNewsletterMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setNewsletterStatus("error");
      setNewsletterMsg("Connection error. Please try again.");
    }
  };
  return (
    <div>
      {/* ----------------- WHY CUSTOMERS CHOOSE US ----------------- */}
      <section id="whyus" className="py-24 bg-primary text-white px-6 md:px-12 relative overflow-hidden">
        {/* Background designs */}
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full filter blur-2xl pointer-events-none" />
        <div className="absolute left-10 top-10 w-48 h-48 bg-amber-400/10 rounded-full filter blur-xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col gap-5">
            <span className="text-white/80 font-bold tracking-widest text-xs uppercase">Why Choose Us</span>
            <h3 className="text-3xl md:text-4xl font-outfit font-black leading-tight">
              Why Customers Love AM DRIETS
            </h3>
            <p className="text-base text-white/80 leading-relaxed font-medium">
              We focus on preserving the raw flavor, color, and nutritional power of freshly harvested produce. No compromises, no hidden fillers, just pure convenience.
            </p>
            <div className="mt-4">
              <span className="font-playfair italic text-xl sm:text-2xl font-bold">Nature&apos;s Goodness, Preserved.</span>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-white/10 hover:bg-white/15 p-5 rounded-2xl flex items-start gap-3 border border-white/5 transition-all">
              <div className="w-6 h-6 rounded-full bg-white text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">✓</div>
              <div>
                <h5 className="font-outfit font-bold text-sm">100% Natural Ingredients</h5>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">No added sugar, synthetic elements, or fillers. Just raw, whole produce.</p>
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 p-5 rounded-2xl flex items-start gap-3 border border-white/5 transition-all">
              <div className="w-6 h-6 rounded-full bg-white text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">✓</div>
              <div>
                <h5 className="font-outfit font-bold text-sm">No Added Sugar</h5>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">Perfect snack for fitness enthusiasts, weight managers, and children.</p>
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 p-5 rounded-2xl flex items-start gap-3 border border-white/5 transition-all">
              <div className="w-6 h-6 rounded-full bg-white text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">✓</div>
              <div>
                <h5 className="font-outfit font-bold text-sm">No Preservatives</h5>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">Completely clean-label products preserving taste without any chemicals.</p>
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 p-5 rounded-2xl flex items-start gap-3 border border-white/5 transition-all">
              <div className="w-6 h-6 rounded-full bg-white text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">✓</div>
              <div>
                <h5 className="font-outfit font-bold text-sm">Premium Tech Sourced</h5>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">Freeze-drying removes moisture at sub-zero temp, locking in nutrition.</p>
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 p-5 rounded-2xl flex items-start gap-3 border border-white/5 transition-all">
              <div className="w-6 h-6 rounded-full bg-white text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">✓</div>
              <div>
                <h5 className="font-outfit font-bold text-sm">Long Shelf Life</h5>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">Keeps for months without cooling, ready whenever you need a boost.</p>
              </div>
            </div>

            <div className="bg-white/10 hover:bg-white/15 p-5 rounded-2xl flex items-start gap-3 border border-white/5 transition-all">
              <div className="w-6 h-6 rounded-full bg-white text-primary flex items-center justify-center flex-shrink-0 font-bold text-xs">✓</div>
              <div>
                <h5 className="font-outfit font-bold text-sm">Convenient & Travel-Friendly</h5>
                <p className="text-xs text-white/70 mt-1 leading-relaxed">Feather-light bags perfect for hikes, flights, office desk drawers.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ----------------- FOOTER / NEWSLETTER ----------------- */}
      <footer className="bg-[#1a1510] text-[#fdfaf7] pt-20 pb-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/10">
          
          {/* Footer Logo & Brand */}
          <div className="flex flex-col gap-4">
            <div className="relative w-16 h-16 cursor-pointer opacity-90 hover:opacity-100 transition-transform hover:scale-105 bg-white rounded-2xl overflow-hidden shadow-lg p-1">
              <Image 
                src="/logo.jpeg" 
                alt="AM DRIETS Logo" 
                fill 
                sizes="64px"
                className="object-contain p-1.5" 
              />
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-sm mt-2">
              Bringing the goodness of nature to your everyday life—one crunchy bite and one nutritious scoop at a time. Made with love in India.
            </p>
          </div>

          {/* Footer Links - Products */}
          <div>
            <h5 className="font-outfit font-bold text-base text-white uppercase tracking-wider mb-6">Product Categories</h5>
            <ul className="flex flex-col gap-3.5 text-sm text-white/60">
              <li><button onClick={() => { setActiveCategory("slices"); scrollTo("products"); }} className="hover:text-primary transition-colors text-left">Freeze-Dried Slices</button></li>
              <li><button onClick={() => { setActiveCategory("powders"); scrollTo("products"); }} className="hover:text-primary transition-colors text-left">Premium Fruit Powders</button></li>
              <li><button onClick={() => { setActiveCategory("vegetables"); scrollTo("products"); }} className="hover:text-primary transition-colors text-left">Wholesome Vegetable Powders</button></li>
              <li><button onClick={() => scrollTo("products")} className="hover:text-primary transition-colors text-left">Healthy Snacking</button></li>
            </ul>
          </div>

          {/* Footer Links - Contact */}
          <div>
            <h5 className="font-outfit font-bold text-base text-white uppercase tracking-wider mb-6">Contact Us</h5>
            <ul className="flex flex-col gap-4 text-sm text-white/60">
              <li>
                <a
                  href="mailto:info@amdriets.com"
                  className="flex items-center gap-2.5 hover:text-primary transition-colors group"
                >
                  <span className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-primary/20 flex items-center justify-center shrink-0 transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  info@amdriets.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/amdriets"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-primary transition-colors group"
                >
                  <span className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-pink-500/20 flex items-center justify-center shrink-0 transition-colors">
                    <InstagramIcon className="w-3.5 h-3.5" />
                  </span>
                  @amdriets
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/share/1BTvLB7Lek/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-primary transition-colors group"
                >
                  <span className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-blue-500/20 flex items-center justify-center shrink-0 transition-colors">
                    <FacebookIcon className="w-3.5 h-3.5" />
                  </span>
                  AM DRIETS
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h5 className="font-outfit font-bold text-base text-white uppercase tracking-wider mb-6">Newsletter Signup</h5>
            <p className="text-sm text-white/60 leading-relaxed mb-4">Subscribe to receive exclusive discounts, recipes, and wellness updates.</p>
            {newsletterStatus === "success" ? (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-4 py-3 rounded-xl">
                <Check className="w-4 h-4 shrink-0" />
                <span>{newsletterMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full text-xs px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white"
                    required
                  />
                  <button
                    type="submit"
                    disabled={newsletterStatus === "loading"}
                    className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-3 rounded-xl transition-colors disabled:opacity-60 whitespace-nowrap"
                  >
                    {newsletterStatus === "loading" ? "..." : "Join"}
                  </button>
                </div>
                {newsletterStatus === "error" && (
                  <p className="text-xs text-red-400 font-semibold px-1">{newsletterMsg}</p>
                )}
              </form>
            )}
          </div>

        </div>

        {/* Sub-footer copyright */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-center text-sm text-white/40 ">
          <p>© {new Date().getFullYear()} AM DRIETS. All rights reserved.</p>
         
        </div>
      </footer>
    </div>
  );
}
