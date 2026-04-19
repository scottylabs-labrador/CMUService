"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

const items = [
  {
    id: 1,
    title: "Discover",
    subtitle: "Find what you need",
    description: "Explore a wide range of services offered by your peers.",
    color: "from-orange-400 to-red-500",
    image: "/discover.webp",
  },
  {
    id: 2,
    title: "Connect",
    subtitle: "Meet the community",
    description: "Chat directly with students and build lasting connections.",
    color: "from-pink-400 to-purple-500",
    image: "/connect.jpg",
  },
  {
    id: 3,
    title: "Exchange",
    subtitle: "Share your skills",
    description: "Offer your own expertise and trade services with others.",
    color: "from-blue-400 to-cyan-500",
    image: "/exchange.jpg",
  },
  {
    id: 4,
    title: "Grow",
    subtitle: "Expand your horizons",
    description: "Learn new things and help the campus community thrive.",
    color: "from-emerald-400 to-green-500",
    image: "/grow.jpg",
  },
];

export default function ScrollJourney() {
  const targetRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0vw", "-200vw"]);

  return (
    <section ref={targetRef} className="relative h-[500vh] bg-background">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* Horizontal scroll hint - visual indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 text-muted-foreground animate-pulse">
          <span className="text-sm">Scroll to explore</span>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </div>

        <div
          ref={scrollContainerRef}
          className="overflow-x-auto overflow-y-hidden w-full h-full no-scrollbar scroll-smooth"
          style={{
            cursor: "grab",
            scrollBehavior: "smooth",
          }}
          onMouseDown={(e) => {
            const el = scrollContainerRef.current;
            if (!el) return;
            el.style.cursor = "grabbing";
            const startX = e.pageX - el.offsetLeft;
            const scrollLeft = el.scrollLeft;

            const handleMouseMove = (e: MouseEvent) => {
              const x = e.pageX - el.offsetLeft;
              const walk = (x - startX) * 2;
              el.scrollLeft = scrollLeft - walk;
            };

            const handleMouseUp = () => {
              el.style.cursor = "grab";
              document.removeEventListener("mousemove", handleMouseMove);
              document.removeEventListener("mouseup", handleMouseUp);
            };

            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
          }}
        >
          <motion.div
            style={{ x }}
            className="flex gap-10 px-10 h-full items-center"
          >
            {/* Intro Text */}
            <div className="flex h-[60vh] w-[40vw] flex-col justify-center shrink-0">
              <h2 className="text-5xl font-bold uppercase leading-tight md:text-7xl">
                Your <br />
                <span className="text-primary">Journey</span>
              </h2>
              <p className="mt-6 text-xl text-muted-foreground max-w-md">
                Scroll or drag to explore how CMU Service connects you with the
                campus community.
              </p>
            </div>

            {/* Cards */}
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative h-[60vh] w-[35vw] shrink-0 overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 transition-all hover:scale-[1.02] hover:shadow-2xl flex flex-col"
              >
                {/* Image upper portion */}
                <div className="relative w-full h-[55%] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-20 transition-opacity group-hover:opacity-30`}
                  />
                </div>
                {/* Text lower portion */}
                <div className="flex flex-col justify-center p-8 flex-1">
                  <div className="mb-3">
                    <span className="inline-block rounded-full bg-neutral-200 dark:bg-neutral-800 px-3 py-1 text-xs font-medium">
                      0{item.id}
                    </span>
                  </div>
                  <h3 className="mb-1 text-3xl font-bold">{item.title}</h3>
                  <p className="text-lg font-medium text-foreground/80">
                    {item.subtitle}
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}

            {/* Outro Text */}
            <div className="flex h-[60vh] w-[40vw] ml-[30vw] flex-col justify-center shrink-0 items-center text-center">
              <h2 className="text-4xl font-bold uppercase md:text-6xl">
                Ready to <br />
                Start?
              </h2>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
