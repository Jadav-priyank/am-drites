"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function CustomCursor() {
  const coreRef = useRef(null);

  useEffect(() => {
    // Disable on touch devices
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const core = coreRef.current;
    if (!core) return;

    gsap.set(core, { opacity: 0 });

    const xCore = gsap.quickTo(core, "x", { duration: 0.15, ease: "power3.out" });
    const yCore = gsap.quickTo(core, "y", { duration: 0.15, ease: "power3.out" });

    let isVisible = false;

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;

      if (!isVisible) {
        isVisible = true;
        gsap.to(core, { opacity: 1, duration: 0.3 });
      }

      xCore(clientX);
      yCore(clientY);
    };

    const handleMouseLeave = () => {
      isVisible = false;
      gsap.to(core, { opacity: 0, duration: 0.3 });
    };

    const handleMouseDown = () => {
      gsap.to(core, { scale: 0.7, duration: 0.2 });
    };

    const handleMouseUp = () => {
      gsap.to(core, { scale: 1, duration: 0.25 });
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const interactive = target.closest("a, button, input, textarea, select, [role='button'], .hover-target");

      if (interactive) {
        gsap.to(core, {
          scale: 1.5,
          opacity: 0.9,
          duration: 0.3
        });
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target;
      const interactive = target.closest("a, button, input, textarea, select, [role='button'], .hover-target");

      if (interactive) {
        gsap.to(core, {
          scale: 1,
          opacity: 0.6,
          duration: 0.3
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
      {/* Warm Core Glow */}
      <div
        ref={coreRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-100 blur-md bg-[#ff6b00]/80"
        style={{ willChange: "transform, opacity" }}
      />
    </div>
  );
}
