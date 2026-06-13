"use client";

import { Leaf } from "lucide-react";
import Image from "next/image";

export default function Footer({ scrollTo, setActiveCategory }) {
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

          {/* Footer Links - Support */}
          <div>
            <h5 className="font-outfit font-bold text-base text-white uppercase tracking-wider mb-6">Quick Links</h5>
            <ul className="flex flex-col gap-3.5 text-sm text-white/60">
              <li><button onClick={() => scrollTo("story")} className="hover:text-primary transition-colors text-left">About Our Story</button></li>
              <li><button onClick={() => scrollTo("quality")} className="hover:text-primary transition-colors text-left">Our Quality Standards</button></li>
              <li><button onClick={() => scrollTo("recipes")} className="hover:text-primary transition-colors text-left">Recipes & Usage</button></li>
              <li><a href="#" className="hover:text-primary transition-colors text-left">Contact Support</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h5 className="font-outfit font-bold text-base text-white uppercase tracking-wider mb-6">Newsletter Signup</h5>
            <p className="text-sm text-white/60 leading-relaxed mb-4">Subscribe to receive exclusive discounts, recipes, and wellness updates.</p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full text-xs px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white"
                required
              />
              <button 
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-3 rounded-xl transition-colors"
              >
                Join
              </button>
            </form>
          </div>

        </div>

        {/* Sub-footer copyright */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-white/40 gap-4">
          <p>© {new Date().getFullYear()} AM DRIETS. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">FSSAI License</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
