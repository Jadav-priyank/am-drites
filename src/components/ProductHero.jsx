"use client";

import dynamic from "next/dynamic";
import { useRef, useState, useEffect, useCallback } from "react";
import { Leaf, ArrowRight, ShoppingBag } from "lucide-react";
import Image from "next/image";

// Dynamic import keeps Three.js out of SSR bundle
const ProductScene = dynamic(() => import("./ProductScene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-[#e07b39]/30 border-t-[#e07b39] animate-spin" />
    </div>
  ),
});

export default function ProductHero({ scrollTo }) {
  const sectionRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Detect mobile
  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Normalised mouse position (–1 → +1) relative to section
  const handleMouseMove = useCallback((e) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: -((e.clientY - rect.top) / rect.height - 0.5) * 2,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos({ x: 0, y: 0 });
  }, []);

  return (
    <section
      id="product-hero"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="product-hero-section"
      style={{
        position: "relative",
        width: "100%",
        minHeight: isMobile ? "100svh" : "100vh",
        overflow: "hidden",
        background:
          "radial-gradient(ellipse 80% 70% at 50% 40%, #fdf3e7 0%, #fcecd8 35%, #fae0c4 65%, #f8d8b8 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── SOFT BACKGROUND ORBS ─────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "-5%",
            width: "40vw",
            height: "40vw",
            background:
              "radial-gradient(circle, rgba(224,123,57,0.12) 0%, transparent 70%)",
            filter: "blur(60px)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            right: "-5%",
            width: "45vw",
            height: "45vw",
            background:
              "radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 70%)",
            filter: "blur(80px)",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            right: "20%",
            width: "20vw",
            height: "20vw",
            background:
              "radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)",
            filter: "blur(40px)",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* ── FULL-SECTION 3D CANVAS ────────────────────────────────────── */}
      {mounted && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
          }}
        >
          <ProductScene mousePos={mousePos} isMobile={isMobile} />
        </div>
      )}

      {/* ── CONTENT OVERLAY ──────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: "100%",
          minHeight: "inherit",
          pointerEvents: "none", // canvas handles mouse
        }}
      >
        {/* ── TOP: BRAND BADGE ─────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: isMobile ? "24px" : "36px",
            padding: "8px 20px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(224,123,57,0.18)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            animation: "fadeSlideDown 0.8s ease both",
          }}
        >
          <Leaf
            size={15}
            style={{ color: "#c85e1f", fill: "#c85e1f" }}
          />
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#c85e1f",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            Nature's Goodness, Preserved
          </span>
        </div>

        {/* ── SPACER: makes room for the 3D model in the middle ─────── */}
        <div style={{ flex: 1 }} />

        {/* ── BOTTOM TEXT + CTA ─────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: isMobile ? "14px" : "18px",
            paddingBottom: isMobile ? "36px" : "64px",
            paddingLeft: "24px",
            paddingRight: "24px",
            textAlign: "center",
            animation: "fadeSlideUp 0.9s 0.25s ease both",
          }}
        >
          {/* Product label */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "999px",
              background: "rgba(200,94,31,0.10)",
              border: "1px solid rgba(200,94,31,0.20)",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#e07b39",
                display: "inline-block",
                animation: "pulse 2s ease infinite",
              }}
            />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#c85e1f",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Freeze-Dried Strawberry Slices
            </span>
          </div>

          {/* Main heading */}
          <h1
            style={{
              fontSize: isMobile ? "clamp(28px, 7vw, 40px)" : "clamp(36px, 4vw, 58px)",
              fontWeight: 900,
              color: "#1a1008",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              fontFamily: "'Outfit', system-ui, sans-serif",
              maxWidth: "640px",
              margin: 0,
              textShadow: "0 2px 20px rgba(255,255,255,0.6)",
            }}
          >
            AM{" "}
            <span
              style={{
                color: "#e07b39",
                position: "relative",
                display: "inline-block",
              }}
            >
              DRIETS
              <span
                style={{
                  position: "absolute",
                  bottom: "2px",
                  left: 0,
                  width: "100%",
                  height: "6px",
                  background:
                    "linear-gradient(90deg, #e07b39 0%, #fbbf24 100%)",
                  borderRadius: "999px",
                  opacity: 0.35,
                }}
              />
            </span>
          </h1>

          {/* Sub-heading */}
          <p
            style={{
              fontSize: isMobile ? "14px" : "16px",
              color: "#5a3a1a",
              maxWidth: "480px",
              lineHeight: 1.65,
              margin: 0,
              fontWeight: 500,
              opacity: 0.85,
            }}
          >
            Bringing the goodness of nature to your everyday life — one
            crunchy bite and one nutritious scoop at a time.
          </p>

          {/* CTA Buttons — re-enable pointer events */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              marginTop: "4px",
              pointerEvents: "auto",
            }}
          >
            <button
              id="hero-shop-btn"
              onClick={() => scrollTo?.("products")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 28px",
                borderRadius: "999px",
                background:
                  "linear-gradient(135deg, #e07b39 0%, #c85e1f 100%)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
                boxShadow:
                  "0 8px 32px rgba(224,123,57,0.40), 0 2px 8px rgba(0,0,0,0.10)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                letterSpacing: "0.02em",
                minWidth: isMobile ? "220px" : "auto",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                e.currentTarget.style.boxShadow =
                  "0 12px 40px rgba(224,123,57,0.55), 0 4px 12px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow =
                  "0 8px 32px rgba(224,123,57,0.40), 0 2px 8px rgba(0,0,0,0.10)";
              }}
            >
              <ShoppingBag size={16} />
              Shop Now
              <ArrowRight size={15} style={{ marginLeft: "2px" }} />
            </button>

            <button
              id="hero-story-btn"
              onClick={() => scrollTo?.("story")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 28px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.65)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                color: "#7c3d12",
                fontWeight: 700,
                fontSize: "14px",
                border: "1px solid rgba(224,123,57,0.25)",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
                transition: "all 0.2s ease",
                letterSpacing: "0.02em",
                minWidth: isMobile ? "220px" : "auto",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.9)";
                e.currentTarget.style.borderColor = "rgba(224,123,57,0.5)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.65)";
                e.currentTarget.style.borderColor = "rgba(224,123,57,0.25)";
                e.currentTarget.style.transform = "";
              }}
            >
              Our Story
            </button>
          </div>

          {/* Trust badges */}
          <div
            style={{
              display: "flex",
              gap: isMobile ? "12px" : "24px",
              marginTop: "8px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {["100% Natural", "No Preservatives", "Freeze-Dried"].map(
              (badge) => (
                <span
                  key={badge}
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#92400e",
                    opacity: 0.75,
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    letterSpacing: "0.05em",
                  }}
                >
                  <span style={{ color: "#e07b39", fontSize: "14px" }}>✦</span>
                  {badge}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── CSS ANIMATIONS ─────────────────────────────────────────────── */}
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(0.85); }
        }
        #product-hero button {
          font-family: 'Outfit', system-ui, sans-serif;
        }
      `}</style>
    </section>
  );
}
