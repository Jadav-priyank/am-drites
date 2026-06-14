"use client";

import { useRef } from "react";
import Image from "next/image";
import { Eye, Plus, Info } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Products({ 
  products, 
  activeCategory, 
  setActiveCategory, 
  searchQuery, 
  onAddToCart, 
  onQuickView,
  clearSearch
}) {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(".products-title", 
      { y: 40, opacity: 0 }, 
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%"
        }
      }
    );
  }, { scope: containerRef });

  // Filter products by category and search query
  const filteredProducts = products.filter((p) => {
    const matchesCategory = p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.ingredients.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && (searchQuery ? matchesSearch : true);
  });

  const handleTabClick = (e, category) => {
    setActiveCategory(category);
    e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  return (
    <section 
      id="products" 
      ref={containerRef}
      className="py-20 px-6 md:px-12 bg-background relative overflow-hidden scroll-mt-24"
    >
      {/* Category Header */}
      <div className="max-w-7xl mx-auto text-center mb-12 flex flex-col items-center">
        <div className="products-title flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase mb-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          Explore Our Range
          <span className="w-2 h-2 rounded-full bg-primary"></span>
        </div>
        <h3 className="products-title text-3xl md:text-4xl font-outfit font-black text-foreground">
          Nature&apos;s Bounty, Freeze-Dried
        </h3>
        <p className="products-title text-sm md:text-base text-foreground/60 max-w-lg mt-3">
          Pure, nutrient-dense products. Select a category to explore slices, fruit powders, or cooking essentials.
        </p>

        {/* Interactive Category Tabs */}
        <div id="product-tabs" className="flex bg-primary-light/40 border border-primary/5 p-1.5 rounded-full mt-8 gap-1 w-full max-w-lg overflow-x-auto scroll-mt-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button 
            onClick={(e) => handleTabClick(e, "slices")}
            className={`flex-1 shrink-0 whitespace-nowrap py-3 px-5 text-xs font-bold rounded-full transition-all duration-300 ${
              activeCategory === "slices" 
                ? "bg-primary text-white shadow-md shadow-primary/25" 
                : "text-foreground hover:text-primary hover:bg-white/40"
            }`}
          >
            Fruit Slices
          </button>
          <button 
            onClick={(e) => handleTabClick(e, "powders")}
            className={`flex-1 shrink-0 whitespace-nowrap py-3 px-5 text-xs font-bold rounded-full transition-all duration-300 ${
              activeCategory === "powders" 
                ? "bg-primary text-white shadow-md shadow-primary/25" 
                : "text-foreground hover:text-primary hover:bg-white/40"
            }`}
          >
            Fruit Powders
          </button>
          <button 
            onClick={(e) => handleTabClick(e, "vegetables")}
            className={`flex-1 shrink-0 whitespace-nowrap py-3 px-5 text-xs font-bold rounded-full transition-all duration-300 ${
              activeCategory === "vegetables" 
                ? "bg-primary text-white shadow-md shadow-primary/25" 
                : "text-foreground hover:text-primary hover:bg-white/40"
            }`}
          >
            Vegetable Powders
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <div 
            key={product.id}
            onClick={() => onQuickView(product)}
            className="cursor-pointer bg-white border border-primary/5 hover:border-primary/15 rounded-3xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col justify-between"
          >
            <div>
              {/* Product image container */}
              <div className={`w-full aspect-[4/3] rounded-2xl bg-gradient-to-br ${product.bgGradient} relative overflow-hidden flex items-center justify-center p-6 mb-5`}>
                {/* Decorative backdrop blobs */}
                <div className="absolute w-24 h-24 rounded-full bg-white/40 filter blur-md -top-2 -left-2"></div>
                <div className="absolute w-24 h-24 rounded-full bg-primary/5 filter blur-sm -bottom-4 -right-4"></div>
                
                {/* Badges Container */}
                <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                  {/* Tagline badge */}
                  <span className="bg-primary text-white text-[8px] sm:text-[9px] uppercase tracking-wider font-extrabold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm shadow-primary/30">
                    No Added Sugar
                  </span>
                  
                  {/* Floating badge */}
                  <span className="bg-white text-primary text-[8px] sm:text-[10px] font-extrabold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm">
                    {product.tag}
                  </span>
                </div>

                {/* representation utilizing our generated mockups */}
                <div className="relative w-3/5 h-4/5 transform group-hover:scale-110 group-hover:rotate-2 transition-transform duration-500">
                  <Image 
                    src={product.imageFront || "/hero_pouch_mockup.png"} 
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 300px"
                    className={`object-contain transition-opacity duration-500 ease-in-out ${
                      product.imageBack ? "group-hover:opacity-0" : ""
                    }`}
                  />
                  {product.imageBack && (
                    <Image 
                      src={product.imageBack} 
                      alt={`${product.name} Back`}
                      fill
                      sizes="(max-width: 768px) 50vw, 300px"
                      className="object-contain absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out"
                    />
                  )}
                </div>
              </div>

              {/* Rating & Size */}
              <div className="flex items-center justify-between text-xs font-medium text-foreground/50 mb-2 px-1">
                <div className="flex items-center gap-1">
                  <span className="text-primary font-bold">★</span>
                  <span className="text-foreground font-semibold">{product.rating}</span>
                  <span>({product.reviews} reviews)</span>
                </div>
                <span className="bg-primary-light text-primary px-2.5 py-0.5 rounded font-bold text-[10px]">
                  {product.size} Pack
                </span>
              </div>

              {/* Title */}
              <h4 className="font-outfit font-extrabold text-lg text-foreground group-hover:text-primary transition-colors mb-2 px-1">
                {product.name}
              </h4>

              {/* Description */}
              <p className="text-sm text-foreground/60 leading-relaxed mb-6 px-1 line-clamp-2">
                {product.description}
              </p>
            </div>

            {/* Price & Action */}
            <div className="flex items-center justify-between pt-4 border-t border-primary/5 px-1">
              <div>
                <span className="text-[11px] text-foreground/40 font-bold block uppercase tracking-wider">Price</span>
                <span className="text-xl font-outfit font-black text-foreground">₹{product.price}</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Add to Cart Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                  className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-black px-6 py-3 rounded-xl shadow-md shadow-primary/10 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full py-16 text-center flex flex-col items-center">
            <Info className="w-12 h-12 text-primary/40 mb-3" />
            <p className="font-bold text-foreground/75">No products found matching &quot;{searchQuery}&quot;</p>
            <p className="text-sm text-foreground/50 mt-1">Try refining your keyword or select another category above.</p>
            <button 
              onClick={clearSearch}
              className="mt-4 text-xs font-bold text-primary underline"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
