"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Search, User, ShoppingBag, Menu, X, Leaf } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Header({ 
  cartItemCount, 
  setCartOpen, 
  searchQuery, 
  setSearchQuery, 
  searchOpen, 
  setSearchOpen,
  scrollTo,
  setActiveCategory,
  isLoggedIn,
  user,
  setAuthModalOpen,
  handleLogout
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useGSAP(() => {
    // Initial desktop nav load animation
    gsap.fromTo(
      ".desktop-nav-link",
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.2 }
    );
  }, { scope: headerRef });

  useGSAP(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      gsap.fromTo(
        ".mobile-link",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [mobileMenuOpen]);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    scrollTo(sectionId);
  };

  return (
    <>
      {/* HEADER NAVBAR */}
      <header ref={headerRef} className="sticky top-0 bg-background/85 backdrop-blur-md border-b border-primary/5 py-4 px-6 md:px-12 flex items-center justify-between z-40 transition-all duration-300">
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick("hero")} 
          className="cursor-pointer group relative w-32 h-10 md:w-36 md:h-12"
        >
          <Image 
            src="/logo.jpeg" 
            alt="AM DRIETS Logo" 
            fill 
            className="object-contain object-left transform group-hover:scale-105 transition-transform duration-300"
            priority
          />
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-foreground/80">
          <button onClick={() => scrollTo("products")} className="desktop-nav-link hover:text-primary transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary hover:after:w-full after:transition-all duration-300">Products</button>
          <button onClick={() => scrollTo("story")} className="desktop-nav-link hover:text-primary transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary hover:after:w-full after:transition-all duration-300">Our Story</button>
          <button onClick={() => scrollTo("quality")} className="desktop-nav-link hover:text-primary transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary hover:after:w-full after:transition-all duration-300">Our Promise</button>
          <button onClick={() => scrollTo("recipes")} className="desktop-nav-link hover:text-primary transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary hover:after:w-full after:transition-all duration-300">Recipes</button>
          <button onClick={() => scrollTo("whyus")} className="desktop-nav-link hover:text-primary transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary hover:after:w-full after:transition-all duration-300">Why Us</button>
        </nav>

        {/* Icons & CTA */}
        <div className="flex items-center gap-3 md:gap-5">
          {/* Search Toggle */}
          <div className="relative">
            <button 
              onClick={() => setSearchOpen(!searchOpen)} 
              className="p-2.5 rounded-full hover:bg-primary-light text-foreground/80 hover:text-primary transition-colors relative"
              aria-label="Toggle Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile search bar — fixed, full-width, centered below header */}
            {searchOpen && (
              <div className="lg:hidden fixed left-4 right-4 top-[72px] z-50 p-3 bg-white border border-primary/10 shadow-2xl rounded-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <input 
                  type="text" 
                  placeholder="Search slices, powders..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); scrollTo("products"); }}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-primary-light/50 border border-primary/5 focus:outline-none focus:border-primary text-foreground font-medium"
                  autoFocus
                />
                <button onClick={() => { setSearchQuery(""); setSearchOpen(false); }} className="text-foreground/40 hover:text-primary flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Desktop search bar — absolute dropdown, right-aligned */}
            {searchOpen && (
              <div className="hidden lg:flex absolute right-0 mt-3 w-72 p-3 bg-white border border-primary/10 shadow-2xl rounded-2xl items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <input 
                  type="text" 
                  placeholder="Search slices, powders..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); scrollTo("products"); }}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-primary-light/50 border border-primary/5 focus:outline-none focus:border-primary text-foreground font-medium"
                  autoFocus
                />
                <button onClick={() => { setSearchQuery(""); setSearchOpen(false); }} className="text-foreground/40 hover:text-primary flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Account Icon */}
          {isLoggedIn ? (
            <div className="hidden lg:flex items-center gap-2 group relative">
              <button className="p-2.5 rounded-full bg-primary-light/50 text-primary transition-colors flex items-center justify-center font-bold text-xs w-10 h-10 uppercase border border-primary/20">
                {user?.name?.charAt(0) || <User className="w-5 h-5" />}
              </button>
              <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-primary/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-2 flex flex-col">
                <p className="text-xs font-bold text-foreground px-3 py-2 border-b border-primary/5 mb-1 truncate">{user?.name}</p>
                <button onClick={handleLogout} className="text-xs text-left px-3 py-2 text-foreground/60 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setAuthModalOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-full border border-primary/20 text-foreground/80 hover:bg-primary-light hover:text-primary transition-colors text-sm font-semibold"
            >
              <User className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}

          {/* Cart Icon */}
          <button 
            onClick={() => setCartOpen(true)}
            className="p-2.5 rounded-full hover:bg-primary-light text-foreground/80 hover:text-primary transition-colors relative"
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-background animate-bounce">
                {cartItemCount}
              </span>
            )}
          </button>

          {/* CTA Shop Button */}
          <button 
            onClick={() => scrollTo("products")}
            className="hidden lg:flex items-center justify-center bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-3 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-300"
          >
            Shop Now
          </button>

          {/* Mobile Menu Icon */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="lg:hidden p-2 rounded-lg text-foreground hover:text-primary transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Menu */}
      {mobileMenuOpen && (
        <div ref={mobileMenuRef} className="lg:hidden fixed inset-0 top-[76px] bg-background/95 backdrop-blur-md z-30 py-8 px-6 flex flex-col gap-6">
          <button onClick={() => handleNavClick("products")} className="mobile-link text-left text-lg font-bold hover:text-primary py-2 border-b border-primary/5">Products</button>
          <button onClick={() => handleNavClick("story")} className="mobile-link text-left text-lg font-bold hover:text-primary py-2 border-b border-primary/5">Our Story</button>
          <button onClick={() => handleNavClick("quality")} className="mobile-link text-left text-lg font-bold hover:text-primary py-2 border-b border-primary/5">Our Promise</button>
          <button onClick={() => handleNavClick("recipes")} className="mobile-link text-left text-lg font-bold hover:text-primary py-2 border-b border-primary/5">Recipes</button>
          <button onClick={() => handleNavClick("whyus")} className="mobile-link text-left text-lg font-bold hover:text-primary py-2 border-b border-primary/5">Why Us</button>
          
          {/* Auth in Mobile Menu */}
          {isLoggedIn ? (
            <div className="mobile-link flex flex-col gap-2 border-t border-primary/10 pt-4 mt-2">
              <span className="text-sm font-semibold text-foreground/60">Signed in as {user?.name}</span>
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-left text-lg font-bold text-red-500 hover:text-red-600 py-2">Logout</button>
            </div>
          ) : (
            <button onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }} className="mobile-link text-left text-lg font-bold hover:text-primary py-2 border-t border-primary/10 pt-4 mt-2">Login / Sign Up</button>
          )}

          <button 
            onClick={() => handleNavClick("products")}
            className="mobile-link w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl text-center shadow-lg shadow-primary/25 mt-4"
          >
            Shop Now
          </button>
        </div>
      )}
    </>
  );
}
