"use client";

import Image from "next/image";
import { X, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";

export default function CartDrawer({ 
  isOpen, 
  setIsOpen, 
  cart, 
  updateQuantity, 
  removeFromCart, 
  cartTotal, 
  cartItemCount,
  clearCart
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div 
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-right duration-350">
        {/* Drawer Header */}
        <div className="p-6 border-b border-primary/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h4 className="font-outfit font-black text-lg text-foreground">Your Cup ({cartItemCount} items)</h4>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-primary-light rounded-full text-foreground/50 hover:text-primary transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Items list */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-4 items-center justify-between bg-primary-light/10 p-3 rounded-2xl border border-primary/5">
              <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center p-2 border border-primary/5 relative">
                <Image 
                  src={item.category === "slices" ? "/bowl_freeze_dried.png" : "/hero_pouch_mockup.png"}
                  alt={item.name}
                  fill
                  className="object-contain p-1"
                />
              </div>

              <div className="flex-1">
                <h5 className="font-outfit font-bold text-xs text-foreground leading-tight line-clamp-1">{item.name}</h5>
                <span className="text-[10px] text-foreground/40 font-semibold">{item.size} • ₹{item.price} each</span>
                
                {/* Quantity counter */}
                <div className="flex items-center gap-2 mt-2">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-6 h-6 rounded bg-white border border-primary/10 flex items-center justify-center text-foreground hover:bg-primary-light hover:text-primary transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-foreground w-4 text-center">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-6 h-6 rounded bg-white border border-primary/10 flex items-center justify-center text-foreground hover:bg-primary-light hover:text-primary transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end gap-3">
                <span className="font-outfit font-black text-sm text-foreground">₹{item.price * item.quantity}</span>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-foreground/30 hover:text-red-500 transition-colors p-1"
                  title="Remove product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {cart.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-primary-light/50 rounded-full flex items-center justify-center text-primary mb-4 animate-pulse">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-outfit font-black text-base text-foreground/75">Your cup is empty</p>
              <p className="text-xs text-foreground/50 max-w-[200px] mt-1.5 leading-relaxed">Add nutritious slices or powders to start preserving nature&apos;s goodness in your meals.</p>
              <button 
                onClick={() => setIsOpen(false)}
                className="mt-6 bg-primary text-white text-xs font-bold px-6 py-3 rounded-full shadow-md shadow-primary/25 hover:bg-primary-hover"
              >
                Start Shopping
              </button>
            </div>
          )}
        </div>

        {/* Drawer Checkout details */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-primary/5 bg-primary-light/10">
            <div className="flex items-center justify-between text-sm font-semibold mb-2">
              <span className="text-foreground/60">Subtotal</span>
              <span className="text-foreground">₹{cartTotal}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-foreground/50 mb-6">
              <span>Shipping</span>
              <span>{cartTotal >= 499 ? "FREE" : "Calculated at checkout"}</span>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  alert(`Checkout order of total ₹${cartTotal}! (Mock purchase success)`);
                  clearCart();
                  setIsOpen(false);
                }}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl text-center shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-all text-sm"
              >
                Proceed to Checkout
              </button>
              <button 
                onClick={clearCart}
                className="w-full text-center text-xs font-bold text-foreground/40 hover:text-red-500 py-1 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
