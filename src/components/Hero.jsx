"use client";

import { useRef } from "react";
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
      className="relative bg-gradient-to-b from-primary-light/40 to-background overflow-hidden
                 flex items-center justify-center
                 min-h-[92svh] lg:min-h-0
                 px-6 md:px-12 lg:px-24
                 pt-10 pb-16 lg:pt-10 lg:pb-20"
    >
      {/* Abstract Background Orbs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/5 right-1/10 w-96 h-96 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none" />

      {/* Fruits WebGL animation — absolute background on ALL screens */}
      <ThreeHeroAnimation />

      {/* Content grid — single col on mobile, 12-col on desktop */}
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center z-10">

        {/* Hero content — full width on mobile, left 6 cols on desktop */}
        <div className="lg:col-span-6 flex flex-col gap-5 text-center lg:text-left">

          {/* Eyebrow */}
          <span className="hero-text inline-flex items-center justify-center lg:justify-start gap-2 text-primary font-playfair italic text-lg font-semibold">
            <Leaf className="w-5 h-5 fill-current" />
            Keep it natural.
          </span>

          {/* Headline */}
          <h2 className="hero-text text-4xl sm:text-5xl md:text-6xl font-outfit font-black tracking-tight text-foreground leading-[1.05]">
            AM <br className="hidden sm:inline" />
            <span className="text-primary relative inline-block">
              DRIETS
              <span className="absolute bottom-1.5 left-0 w-full h-[6px] bg-primary/20 rounded-full" />
            </span>
          </h2>

          {/* Sub-text */}
          <p className="hero-text text-base md:text-lg text-foreground/80 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Bringing the goodness of nature to your everyday life—one crunchy bite and one nutritious scoop at a time.
          </p>

          {/* CTAs */}
          <div className="hero-text flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mt-1">
            <button
              onClick={() => scrollTo("products")}
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white text-sm font-extrabold px-8 py-4 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-2 group transition-all duration-300"
            >
              Shop Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>
            <button
              onClick={() => scrollTo("story")}
              className="w-full sm:w-auto border border-primary/20 hover:border-primary bg-white/80 backdrop-blur-sm hover:bg-primary-light text-foreground hover:text-primary text-sm font-bold px-8 py-4 rounded-full transition-all duration-300"
            >
              Our Story
            </button>
          </div>
        </div>

        {/* Right placeholder — DESKTOP ONLY, gives the fruits room on lg+ */}
        <div className="hidden lg:flex lg:col-span-6 h-[450px] pointer-events-none select-none items-center justify-center relative">
          <div className="absolute w-[400px] h-[400px] bg-gradient-to-tr from-primary/10 to-amber-400/25 rounded-full filter blur-xl opacity-60" />
        </div>

      </div>
    </section>
  );
}
