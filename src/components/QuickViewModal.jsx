"use client";

import Image from "next/image";
import { X, Leaf } from "lucide-react";

export default function QuickViewModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in"
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-3xl rounded-[32px] overflow-hidden shadow-2xl z-10 grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto animate-in scale-in duration-300">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-primary-light rounded-full text-foreground/50 hover:text-primary z-20 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Col: Image & Branding */}
        <div className={`md:col-span-5 bg-gradient-to-br ${product.bgGradient} p-8 flex flex-col items-center justify-center min-h-[250px] md:min-h-full relative`}>
          <span className="absolute top-6 left-6 bg-white text-primary text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm">
            AM DRIETS
          </span>

          <div className="relative w-4/5 h-[180px] md:h-[220px] hover:scale-105 transition-transform duration-300">
            <Image 
              src={product.category === "slices" ? "/bowl_freeze_dried.png" : "/hero_pouch_mockup.png"} 
              alt={product.name}
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Right Col: Product Details */}
        <div className="md:col-span-7 p-8 md:p-10 flex flex-col justify-between">
          <div>
            <span className="text-primary font-bold text-xs uppercase tracking-wider block mb-2">
              {product.category === "slices" ? "Freeze-Dried Slices" : product.category === "powders" ? "Fruit Powder" : "Vegetable Powder"}
            </span>
            <h3 className="font-outfit font-black text-2xl text-foreground mb-3 leading-tight">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-3 text-xs font-semibold text-foreground/60 mb-5">
              <div className="flex items-center gap-1">
                <span className="text-primary">★</span>
                <span className="text-foreground">{product.rating}</span>
                <span>({product.reviews} customer reviews)</span>
              </div>
              <span>•</span>
              <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded font-bold text-[10px] uppercase">
                {product.size} pack
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-foreground/70 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Ingredients & Nutrition */}
            <div className="bg-primary-light/30 border border-primary/5 rounded-2xl p-4 mb-6">
              <h5 className="font-outfit font-bold text-sm text-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-primary fill-current" />
                Ingredients & Nutrition
              </h5>
              <p className="text-xs text-foreground/70 leading-relaxed">
                <strong className="text-foreground font-bold">Ingredients: </strong> {product.ingredients}
              </p>
              
              {/* Quick Nutrition Info Grid */}
              <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-primary/5 text-center">
                <div>
                  <span className="text-[9px] text-foreground/40 font-bold block uppercase">Cals</span>
                  <span className="text-xs font-outfit font-black text-foreground">{product.nutrition.calories}</span>
                </div>
                <div>
                  <span className="text-[9px] text-foreground/40 font-bold block uppercase">Carbs</span>
                  <span className="text-xs font-outfit font-black text-foreground">{product.nutrition.carbs}</span>
                </div>
                <div>
                  <span className="text-[9px] text-foreground/40 font-bold block uppercase">Sugar</span>
                  <span className="text-xs font-outfit font-black text-foreground">{product.nutrition.sugar}</span>
                </div>
                <div>
                  <span className="text-[9px] text-foreground/40 font-bold block uppercase">Protein</span>
                  <span className="text-xs font-outfit font-black text-foreground">{product.nutrition.protein}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price & Action */}
          <div className="flex items-center justify-between pt-5 border-t border-primary/5">
            <div>
              <span className="text-[11px] text-foreground/40 font-bold block uppercase tracking-wider">Total Price</span>
              <span className="text-2xl font-outfit font-black text-primary">₹{product.price}</span>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="bg-primary hover:bg-primary-hover text-white text-xs font-black px-6 py-4 rounded-xl shadow-lg shadow-primary/20 transition-colors"
              >
                Add to Cart
              </button>
              <button 
                onClick={onClose}
                className="border border-primary/10 hover:bg-primary-light text-foreground text-xs font-bold px-4 py-4 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
