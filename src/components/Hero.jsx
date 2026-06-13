"use client";

import { useRef } from "react";
import Image from "next/image";
import { Leaf, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ThreeHeroAnimation from "./ThreeHeroAnimation";

export default function Hero({ scrollTo }) {
  const containerRef = useRef(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    tl.fromTo(".hero-text", 
      { y: 60, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 }
    );
  }, { scope: containerRef });

  return (
    <section 
      id="hero" 
      ref={containerRef}
      className="relative bg-gradient-to-b from-primary-light/40 to-background pt-10 pb-20 px-6 md:px-12 lg:px-24 flex items-center justify-center overflow-hidden"
    >
      {/* Abstract Background Orbs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/5 right-1/10 w-96 h-96 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none" />
      
      {/* 3D Interactive WebGL Animation */}
      <ThreeHeroAnimation />

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
        
        {/* Hero Left Content */}
        <div className="lg:col-span-6 flex flex-col gap-6 text-center lg:text-left">
          <span className="hero-text inline-flex items-center justify-center lg:justify-start gap-2 text-primary font-playfair italic text-lg md:text-xl font-semibold">
            <Leaf className="w-5 h-5 fill-current" />
            Keep it real.
          </span>
          <h2 className="hero-text text-4xl sm:text-5xl md:text-6xl font-outfit font-black tracking-tight text-foreground leading-[1.05]">
            KEEP IT <br className="hidden sm:inline" />
            <span className="text-primary relative inline-block">
              NATURAL.
              <span className="absolute bottom-1.5 left-0 w-full h-[6px] bg-primary/20 rounded-full"></span>
            </span>
          </h2>
          <p className="hero-text text-base md:text-lg text-foreground/80 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Bringing the goodness of nature to your everyday life—one crunchy bite and one nutritious scoop at a time.
          </p>
          
          <div className="hero-text flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-2">
            <button 
              onClick={() => scrollTo("products")}
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white text-sm font-extrabold px-8 py-4 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-2 group transition-all duration-300"
            >
              Shop Slices & Powders
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>
            <button 
              onClick={() => scrollTo("story")}
              className="w-full sm:w-auto border border-primary/20 hover:border-primary bg-white hover:bg-primary-light text-foreground hover:text-primary text-sm font-bold px-8 py-4 rounded-full transition-all duration-300"
            >
              Our Story
            </button>
          </div>
        </div>

        {/* Hero Right Media placeholder for 3D Pouch Alignment */}
        <div className="lg:col-span-6 relative flex items-center justify-center h-[350px] sm:h-[450px] pointer-events-none select-none">
          {/* Background warm orb */}
          <div className="absolute w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] bg-gradient-to-tr from-primary/10 to-amber-400/25 rounded-full filter blur-xl opacity-60" />
          
          {/* Orange Fabric / Swoosh element from the reference image */}
          <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-60 sm:w-80 h-32 bg-primary rounded-tl-[100px] rounded-br-[60px] transform rotate-12 opacity-95 -z-10 shadow-2xl overflow-hidden shadow-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
