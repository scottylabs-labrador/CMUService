// src/components/ui/CMUFuturisticBackground.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

const CMUFuturisticBackground = () => {
  const bubbleVariants = {
    initial: (i: number) => ({
      y: "110%", // Start below the viewport
      x: `${Math.random() * 100}vw`,
      scale: 0,
      opacity: 0,
    }),
    animate: (i: number) => ({
      y: "-20%", // Move up and out of the viewport
      x: `${Math.random() * 100}vw`,
      scale: [0, 1.2, 1],
      opacity: [0, 0.7, 0.5, 0],
      transition: {
        duration: Math.random() * 20 + 25, // Slower, more varied duration
        repeat: Infinity,
        repeatType: "loop" as const, // Fix for type inference
        delay: i * 5, // Staggered start
        ease: "linear",
      },
    }),
  };

  const bubbles = [
    // Red/Yellow bubbles
    {
      size: "45vw",
      color:
        "radial-gradient(circle, rgba(255,200,200,0.6) 0%, rgba(190,30,45,0.4) 70%)",
    },
    {
      size: "40vw",
      color:
        "radial-gradient(circle, rgba(255,255,200,0.6) 0%, rgba(255,210,0,0.4) 70%)",
    },
    {
      size: "50vw",
      color:
        "radial-gradient(circle, rgba(255,210,210,0.5) 0%, rgba(190,30,45,0.35) 70%)",
    },
    {
      size: "35vw",
      color:
        "radial-gradient(circle, rgba(255,255,210,0.5) 0%, rgba(255,210,0,0.35) 70%)",
    },
  ];

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-white">
      <div className="absolute top-20 left-0 right-0 bottom-0 overflow-hidden">
        {bubbles.map((bubble, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={bubbleVariants}
            initial="initial"
            animate="animate"
            style={{
              position: "absolute",
              width: bubble.size,
              height: bubble.size,
              borderRadius: "50%",
              background: bubble.color,
              // Remove top/left from here, it's handled by framer-motion
              filter: "blur(50px)",
              willChange: "transform, opacity",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export { CMUFuturisticBackground };
