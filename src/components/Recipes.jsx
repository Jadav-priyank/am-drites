"use client";

import Image from "next/image";
import { Heart } from "lucide-react";

export default function Recipes({ scrollTo }) {
  return (
    <section id="recipes" className="py-24 bg-background px-6 md:px-12 relative">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Recipes Left Content */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <span className="text-primary font-bold tracking-widest text-xs uppercase">Delicious Recipes</span>
          <h3 className="text-3xl md:text-4xl font-outfit font-black text-foreground leading-tight">
            Made with pure, real ingredients.
          </h3>
          <p className="text-base text-foreground/75 leading-relaxed">
            Our products are incredibly versatile. Add nutritional power to your daily meals without complex prep. Perfect for healthy snacking, smoothies, baking, breakfast bowls, desserts, travel, and everyday nutrition.
          </p>

          {/* Quick recipes highlights grid */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="border border-primary/5 bg-white p-4 rounded-2xl flex flex-col gap-1.5 shadow-sm hover:border-primary/10 transition-colors">
              <span className="text-primary text-xs font-black uppercase tracking-wider">Smoothies</span>
              <p className="text-xs text-foreground/50">Add 1 scoop of Mango or Strawberry powder for a luscious natural flavor boost.</p>
            </div>
            <div className="border border-primary/5 bg-white p-4 rounded-2xl flex flex-col gap-1.5 shadow-sm hover:border-primary/10 transition-colors">
              <span className="text-primary text-xs font-black uppercase tracking-wider">Snacking</span>
              <p className="text-xs text-foreground/50">Munch on crisp Kiwi or Banana slices directly out of the packet.</p>
            </div>
            <div className="border border-primary/5 bg-white p-4 rounded-2xl flex flex-col gap-1.5 shadow-sm hover:border-primary/10 transition-colors">
              <span className="text-primary text-xs font-black uppercase tracking-wider">Baking</span>
              <p className="text-xs text-foreground/50">Incorporate Beetroot powder into dough or Strawberry powder in frostings.</p>
            </div>
            <div className="border border-primary/5 bg-white p-4 rounded-2xl flex flex-col gap-1.5 shadow-sm hover:border-primary/10 transition-colors">
              <span className="text-primary text-xs font-black uppercase tracking-wider">Bowls</span>
              <p className="text-xs text-foreground/50">Top your morning Greek yogurt or oats with colorful Apple and Strawberry slices.</p>
            </div>
          </div>

          <button 
            onClick={() => scrollTo("products")}
            className="self-center lg:self-start mt-4 border border-primary text-primary hover:bg-primary hover:text-white text-xs font-black px-6 py-3.5 rounded-full shadow-lg shadow-primary/5 transition-all duration-300"
          >
            Explore Slices & Powders
          </button>
        </div>

        {/* Recipes Right Media */}
        <div className="lg:col-span-7 relative flex items-center justify-center">
          {/* Main recipe image box */}
          <div className="bg-white border border-primary/5 p-4 rounded-3xl shadow-xl w-full max-w-xl group">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden relative mb-4">
              <Image 
                src="/recipe_smoothie_bowl.png" 
                alt="Smoothie Bowl Recipe" 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700" 
              />
            </div>
            <div className="flex items-center justify-between px-2">
              <div>
                <h4 className="font-outfit font-bold text-base text-foreground">Anti-Oxidant Berry Breakfast Bowl</h4>
                <p className="text-xs text-foreground/50 mt-0.5">Prep time: 2 mins • 100% Vegan & Gluten Free</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary">
                <Heart className="w-5 h-5 fill-current" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
