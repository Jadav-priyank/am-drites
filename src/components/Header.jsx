"use client";

import { useState } from "react";
import { Search, User, ShoppingBag, Menu, X, Leaf } from "lucide-react";

export default function Header({ 
  cartItemCount, 
  setCartOpen, 
  searchQuery, 
  setSearchQuery, 
  searchOpen, 
  setSearchOpen,
  scrollTo,
  setActiveCategory
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    scrollTo(sectionId);
  };

  return (
    <>
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 bg-background/85 backdrop-blur-md border-b border-primary/5 py-4 px-6 md:px-12 flex items-center justify-between z-40 transition-all duration-300">
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick("hero")} 
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transform group-hover:rotate-12 transition-transform duration-300">
            <Leaf className="text-white w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-xl font-outfit font-extrabold tracking-wide text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
              AM <span className="text-primary">DRIETS</span>
            </h1>
            <p className="text-[9px] font-semibold text-primary/70 uppercase tracking-widest -mt-1 font-outfit">Nature Preserved</p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-foreground/80">
          <button onClick={() => scrollTo("products")} className="hover:text-primary transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary hover:after:w-full after:transition-all duration-300">Products</button>
          <button onClick={() => scrollTo("story")} className="hover:text-primary transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary hover:after:w-full after:transition-all duration-300">Our Story</button>
          <button onClick={() => scrollTo("quality")} className="hover:text-primary transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary hover:after:w-full after:transition-all duration-300">Our Promise</button>
          <button onClick={() => scrollTo("recipes")} className="hover:text-primary transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary hover:after:w-full after:transition-all duration-300">Recipes</button>
          <button onClick={() => scrollTo("whyus")} className="hover:text-primary transition-colors cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-primary hover:after:w-full after:transition-all duration-300">Why Us</button>
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
            {searchOpen && (
              <div className="absolute right-0 mt-3 p-3 bg-white border border-primary/10 shadow-2xl rounded-2xl w-72 flex items-center gap-2 transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
                <input 
                  type="text" 
                  placeholder="Search slices, powders..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    scrollTo("products");
                  }}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-primary-light/50 border border-primary/5 focus:outline-none focus:border-primary text-foreground font-medium"
                  autoFocus
                />
                <button onClick={() => { setSearchQuery(""); setSearchOpen(false); }} className="text-foreground/40 hover:text-primary">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Account Icon */}
          <button className="hidden sm:flex p-2.5 rounded-full hover:bg-primary-light text-foreground/80 hover:text-primary transition-colors" aria-label="Account">
            <User className="w-5 h-5" />
          </button>

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
            className="md:hidden p-2 rounded-lg text-foreground hover:text-primary transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[76px] bg-background/95 backdrop-blur-md z-30 py-8 px-6 flex flex-col gap-6 animate-in slide-in-from-top-5">
          <button onClick={() => handleNavClick("products")} className="text-left text-lg font-bold hover:text-primary py-2 border-b border-primary/5">Products</button>
          <button onClick={() => handleNavClick("story")} className="text-left text-lg font-bold hover:text-primary py-2 border-b border-primary/5">Our Story</button>
          <button onClick={() => handleNavClick("quality")} className="text-left text-lg font-bold hover:text-primary py-2 border-b border-primary/5">Our Promise</button>
          <button onClick={() => handleNavClick("recipes")} className="text-left text-lg font-bold hover:text-primary py-2 border-b border-primary/5">Recipes</button>
          <button onClick={() => handleNavClick("whyus")} className="text-left text-lg font-bold hover:text-primary py-2 border-b border-primary/5">Why Us</button>
          <button 
            onClick={() => handleNavClick("products")}
            className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl text-center shadow-lg shadow-primary/25 mt-4"
          >
            Shop Now
          </button>
        </div>
      )}
    </>
  );
}
