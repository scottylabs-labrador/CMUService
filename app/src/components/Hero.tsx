"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useRef, useEffect, useState } from "react";

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollFade, setScrollFade] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Extended scroll range for ultra-smooth transition
        const scrollProgress = Math.max(
          0,
          Math.min(1, -rect.top / (rect.height * 1.5)),
        );

        // Custom ease-out-expo for very smooth, satisfying deceleration
        const easedProgress =
          scrollProgress === 1 ? 1 : 1 - Math.pow(2, -10 * scrollProgress);

        setScrollFade(easedProgress);
      }
    };

    // Use requestAnimationFrame for buttery smooth updates
    let rafId: number;
    const smoothScroll = () => {
      handleScroll();
      rafId = requestAnimationFrame(smoothScroll);
    };

    rafId = requestAnimationFrame(smoothScroll);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[85vh] w-full overflow-hidden bg-[#F5F5F5] dark:bg-[#0A0A0A] flex items-center pb-20"
    >
      {/* Bottom Gradient Blend - Creates smooth transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent via-background/30 to-background pointer-events-none z-25" />

      {/* Scroll-based Fade Overlay */}
      <div
        className="absolute inset-0 bg-background pointer-events-none z-20 transition-opacity duration-300 ease-out"
        style={{ opacity: scrollFade }}
      />

      {/* Interactive Gradient Orb with Ambient Animation */}
      <div
        className="absolute top-[40%] right-[-10%] md:right-[5%] w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-0 animate-[move-in-circle_8s_linear_infinite] transition-transform duration-100"
        style={{
          transformOrigin: "center center",
          transform: `scale(${1 - scrollFade * 0.3})`,
          opacity: 0.95 - scrollFade * 0.2,
        }}
      >
        {/* Inner animating layer for ambient movement and gradient */}
        <div
          className="w-full h-full animate-[pulse-glow_8s_ease-in-out_infinite]"
          style={{
            background:
              "radial-gradient(circle at center, #FF8800 0%, #FF6600 15%, #FF7700 30%, #FF5500 45%, #FF6699 65%, #FF88AA 80%, transparent 100%)",
          }}
        />
      </div>

      {/* Content Container */}
      <div
        className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 h-full items-center transition-transform duration-100"
        style={{
          transform: `translateY(${scrollFade * 30}px)`,
          opacity: 1 - scrollFade * 0.3,
        }}
      >
        {/* Left Column - Typography */}
        <div className="md:col-span-7 flex flex-col justify-center pt-10 md:pt-0">
          {/* Top Label */}
          <div className="flex items-center gap-4 mb-8 mt-16">
            <span className="text-xs font-bold tracking-widest uppercase text-black dark:text-white">
              The CMU Service Exchange
            </span>
          </div>

          {/* Main Headline - Adjusted size and spacing */}
          <h1 className="text-5xl md:text-7xl font-sans font-bold tracking-tighter leading-[0.95] mb-10 text-black dark:text-white uppercase">
            THE BEGINNING OF <br />
            <span className="italic font-serif font-light">
              SKILL-SHARING
            </span>{" "}
            <br />
            AT <span className="text-[#FF6600]">CMU</span> STARTS <br />
            WITH YOU.
          </h1>

          {/* Bottom Details - Increased spacing from headline */}
          <div className="grid grid-cols-2 gap-8 max-w-md mb-8">
            <div>
              <h3 className="text-sm italic tracking-wide mb-2 text-black/50 dark:text-white/50">
                Start Now
              </h3>
              <p className="text-sm font-medium leading-relaxed">
                Join the community of students exchanging talents.
              </p>
            </div>
            <div>
              <h3 className="text-sm italic tracking-wide mb-2 text-black/50 dark:text-white/50">
                What is it?
              </h3>
              <p className="text-sm font-medium leading-relaxed">
                A premium marketplace for knowledge and services.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Interactive Elements / CTAs */}
        <div className="md:col-span-5 flex flex-col justify-end items-end md:h-full pb-12">
          {/* Floating Action Button / CTA */}
          <Link
            href="/services"
            className="group relative flex items-center justify-center w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-500 mt-10 md:mt-0"
          >
            <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_10s_linear_infinite]" />
            <ArrowUpRight className="w-12 h-12 text-black dark:text-white group-hover:scale-110 transition-transform duration-300" />
            <span className="absolute -bottom-10 text-xs font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Explore
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
