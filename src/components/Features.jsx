"use client";

import { useRef } from "react";
import { Sparkles, Leaf, Clock, ShieldCheck } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Features() {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(".badge-card", 
      { y: 50, opacity: 0 }, 
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      className="py-12 bg-white border-y border-primary/5 px-6 md:px-12"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="badge-card bg-primary-light/25 hover:bg-primary-light/50 border border-primary/5 hover:border-primary/15 p-6 rounded-2xl flex items-start gap-4 transition-all duration-300 group hover:-translate-y-1">
          <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-white flex items-center justify-center shadow-md shadow-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-outfit font-bold text-base text-foreground">100% Natural</h4>
            <p className="text-sm text-foreground/70 mt-1 leading-relaxed">No added sugar, artificial preservatives, or chemical additives. pure fruit goodness.</p>
          </div>
        </div>

        <div className="badge-card bg-primary-light/25 hover:bg-primary-light/50 border border-primary/5 hover:border-primary/15 p-6 rounded-2xl flex items-start gap-4 transition-all duration-300 group hover:-translate-y-1">
          <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-white flex items-center justify-center shadow-md shadow-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-outfit font-bold text-base text-foreground">Nutrition Locked</h4>
            <p className="text-sm text-foreground/70 mt-1 leading-relaxed">Advanced freeze-drying technology locks in natural vitamins, colors, and rich aromas.</p>
          </div>
        </div>

        <div className="badge-card bg-primary-light/25 hover:bg-primary-light/50 border border-primary/5 hover:border-primary/15 p-6 rounded-2xl flex items-start gap-4 transition-all duration-300 group hover:-translate-y-1">
          <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-white flex items-center justify-center shadow-md shadow-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-outfit font-bold text-base text-foreground">Convenient Pack</h4>
            <p className="text-sm text-foreground/70 mt-1 leading-relaxed">Lightweight, travel-friendly packs with long shelf life for nutrition on the go.</p>
          </div>
        </div>

        <div className="badge-card bg-primary-light/25 hover:bg-primary-light/50 border border-primary/5 hover:border-primary/15 p-6 rounded-2xl flex items-start gap-4 transition-all duration-300 group hover:-translate-y-1">
          <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-white flex items-center justify-center shadow-md shadow-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-outfit font-bold text-base text-foreground">Made In India</h4>
            <p className="text-sm text-foreground/70 mt-1 leading-relaxed">Sourced responsibly from Indian farms, prepared with hygiene and care.</p>
          </div>
        </div>

      </div>
    </section>
  );
}
