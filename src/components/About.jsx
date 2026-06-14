"use client";

import { useRef } from "react";
import Image from "next/image";
import { Leaf, MapPin, Award } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function About() {
  const containerRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(".story-animate",
      { x: -50, opacity: 0 },
      {
        x: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%"
        }
      }
    );

    gsap.fromTo(".story-box",
      { scale: 0.9, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.6,
        stagger: 0.15,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 70%"
        }
      }
    );
  }, { scope: containerRef });

  return (
    <div ref={containerRef}>
      {/* ----------------- OUR STORY / MISSION & VISION ----------------- */}
      <section id="story" className="py-24 bg-primary-light/15 px-6 md:px-12 relative overflow-hidden">
        {/* Subtle orange foliage leaf in background */}
        <div className="absolute -right-20 top-10 w-64 h-64 text-primary/[0.03] pointer-events-none">
          <Leaf className="w-full h-full fill-current" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* Story Left: Story Narrative */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <span className="story-animate text-primary font-playfair italic text-lg md:text-xl font-semibold">Our Journey</span>
            <h3 className="story-animate text-3xl md:text-4xl font-outfit font-black text-foreground leading-tight">
              Preserving Nature&apos;s Goodness Since Day One
            </h3>

            <p className="story-animate text-base text-foreground/80 leading-relaxed font-medium">
              At <strong className="font-extrabold text-foreground">AM DRIETS</strong>, we believe healthy food should be convenient, delicious, and as close to nature as possible. We specialize in premium freeze-dried fruits and vegetable powders that preserve the natural taste, color, aroma, and nutritional value of fresh produce.
            </p>

            <p className="story-animate text-base text-foreground/70 leading-relaxed">
              Our journey began with a simple vision: to make nutritious fruits and vegetables available year-round in a convenient form without relying on artificial preservatives, added sugar, or unnecessary additives. Through advanced freeze-drying technology, we transform carefully selected produce into wholesome snacks and versatile powders while maintaining their natural goodness.
            </p>

            {/* Quick Farm Sourced Stamp */}
            <div className="story-animate flex items-center gap-4 bg-white p-4 border border-primary/5 rounded-2xl shadow-sm mt-2 max-w-sm">
              <div className="w-12 h-12 rounded-xl bg-accent-green-light flex items-center justify-center text-accent-green">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h5 className="font-outfit font-bold text-sm text-foreground uppercase tracking-wider">Sourced Locally</h5>
                <p className="text-xs text-foreground/50 mt-0.5">Sourced from quality Indian farms, directly packing the best harvest.</p>
              </div>
            </div>
          </div>

          {/* Story Right: Real product photo grid */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3">

            {[
              { src: "/realfruits.jpg",      label: "Freeze-Dried Fruits"    },
              { src: "/realmango.jpg",        label: "Mango Slices"           },
              { src: "/realkiwi.jpg",         label: "Kiwi Snacks"            },
              { src: "/realstrawberry.jpg",   label: "Strawberry Bites"       },
            ].map(({ src, label }) => (
              <div
                key={src}
                className="story-box relative aspect-square rounded-2xl overflow-hidden shadow-md group"
              >
                <Image
                  src={src}
                  alt={label}
                  fill
                  sizes="(max-width:768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Label overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-white text-xs font-bold">{label}</span>
                </div>
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* ----------------- QUALITY COMMITMENT SECTION ----------------- */}
      <section id="quality" className="py-24 bg-white px-6 md:px-12 relative overflow-hidden border-b border-primary/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-2 text-primary font-bold tracking-widest text-xs uppercase mb-2">
            <Award className="w-4 h-4" />
            Our Quality commitment
          </div>
          <h3 className="text-3xl md:text-4xl font-outfit font-black text-foreground text-center">
            Purity and Quality in Every Pack
          </h3>
          <p className="text-sm md:text-base text-foreground/60 text-center max-w-lg mt-3 mb-16">
            At AM DRIETS, quality is at the center of everything we do. We strive for excellence at every phase.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 w-full">

            <div className="bg-primary-light/10 border border-primary/5 hover:border-primary/15 hover:bg-primary-light/20 p-6 rounded-3xl transition-all duration-300 text-center flex flex-col items-center group">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm mb-4 font-black group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                01
              </div>
              <h4 className="font-outfit font-bold text-base text-foreground">Careful Sourcing</h4>
              <p className="text-sm text-foreground/60 mt-2 leading-relaxed">Selecting only premium fresh fruits and vegetables at peak ripeness.</p>
            </div>

            <div className="bg-primary-light/10 border border-primary/5 hover:border-primary/15 hover:bg-primary-light/20 p-6 rounded-3xl transition-all duration-300 text-center flex flex-col items-center group">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm mb-4 font-black group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                02
              </div>
              <h4 className="font-outfit font-bold text-base text-foreground">Strict Hygiene</h4>
              <p className="text-sm text-foreground/60 mt-2 leading-relaxed">Maintaining world-class hygiene standards and food safety practices.</p>
            </div>

            <div className="bg-primary-light/10 border border-primary/5 hover:border-primary/15 hover:bg-primary-light/20 p-6 rounded-3xl transition-all duration-300 text-center flex flex-col items-center group">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm mb-4 font-black group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                03
              </div>
              <h4 className="font-outfit font-bold text-base text-foreground">Preservative Free</h4>
              <p className="text-sm text-foreground/60 mt-2 leading-relaxed">100% natural produce free from synthetic colors or added sugar.</p>
            </div>

            <div className="bg-primary-light/10 border border-primary/5 hover:border-primary/15 hover:bg-primary-light/20 p-6 rounded-3xl transition-all duration-300 text-center flex flex-col items-center group">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm mb-4 font-black group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                04
              </div>
              <h4 className="font-outfit font-bold text-base text-foreground">Consistent Quality</h4>
              <p className="text-sm text-foreground/60 mt-2 leading-relaxed">Rigorous taste, weight, and shelf-life checks for every batch packed.</p>
            </div>

            <div className="bg-primary-light/10 border border-primary/5 hover:border-primary/15 hover:bg-primary-light/20 p-6 rounded-3xl transition-all duration-300 text-center flex flex-col items-center group">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-primary shadow-sm mb-4 font-black group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                05
              </div>
              <h4 className="font-outfit font-bold text-base text-foreground">Process Focus</h4>
              <p className="text-sm text-foreground/60 mt-2 leading-relaxed">Continuously upgrading tech to refine freezing and packing systems.</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
