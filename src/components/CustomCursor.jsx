"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function CustomCursor() {
  const spotlightRef = useRef(null);
  const coreRef = useRef(null);

  useEffect(() => {
    // Disable on touch devices
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const spotlight = spotlightRef.current;
    const core = coreRef.current;

    if (!spotlight || !core) return;

    gsap.set([spotlight, core], { opacity: 0 });

    // GSAP quickTo for smooth ambient spotlight movement
    const xSpotlight = gsap.quickTo(spotlight, "x", { duration: 0.6, ease: "power2.out" });
    const ySpotlight = gsap.quickTo(spotlight, "y", { duration: 0.6, ease: "power2.out" });

    const xCore = gsap.quickTo(core, "x", { duration: 0.15, ease: "power3.out" });
    const yCore = gsap.quickTo(core, "y", { duration: 0.15, ease: "power3.out" });

    let isVisible = false;

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;

      if (!isVisible) {
        isVisible = true;
        gsap.to([spotlight, core], { opacity: 1, duration: 0.4 });
      }

      xSpotlight(clientX);
      ySpotlight(clientY);
      xCore(clientX);
      yCore(clientY);
    };

    const handleMouseLeave = () => {
      isVisible = false;
      gsap.to([spotlight, core], { opacity: 0, duration: 0.4 });
    };

    const handleMouseDown = () => {
      gsap.to(spotlight, { scale: 0.85, duration: 0.2 });
      gsap.to(core, { scale: 0.7, duration: 0.2 });
    };

    const handleMouseUp = () => {
      gsap.to(spotlight, { scale: 1, duration: 0.25 });
      gsap.to(core, { scale: 1, duration: 0.25 });
    };

    // Expand spotlight gently over interactive components
    const handleMouseOver = (e) => {
      const target = e.target;
      const interactive = target.closest("a, button, input, textarea, select, [role='button'], .hover-target");

      if (interactive) {
        gsap.to(spotlight, {
          scale: 1.6,
          opacity: 0.8,
          duration: 0.35,
          ease: "power2.out"
        });
        gsap.to(core, {
          scale: 1.4,
          opacity: 0.9,
          duration: 0.35
        });
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      const interactive = target.closest("a, button, input, textarea, select, [role='button'], .hover-target");

      if (interactive) {
        gsap.to(spotlight, {
          scale: 1,
          opacity: 0.5,
          duration: 0.35,
          ease: "power2.out"
        });
        gsap.to(core, {
          scale: 1,
          opacity: 0.6,
          duration: 0.35
        });
      }
    };

    window.addEventListener("pointermove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      window.removeEventListener("pointermove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  return (
    <div className="hidden md:block pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Soft Ambient Radial Spotlight Glow */}
      <div
        ref={spotlightRef}
        className="fixed top-0 left-0 w-80 h-80 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-50 blur-3xl bg-[radial-gradient(circle,rgba(255,107,0,0.18)_0%,rgba(255,107,0,0.06)_50%,transparent_70%)]"
        style={{ willChange: "transform, opacity" }}
      />
      {/* Subtle Warm Core Glow */}
      <div
        ref={coreRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-60 blur-md bg-[#ff6b00]/40"
        style={{ willChange: "transform, opacity" }}
      />
    </div>
  );
}
