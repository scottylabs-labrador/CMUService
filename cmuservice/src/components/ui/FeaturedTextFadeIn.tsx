"use client";

import { motion } from "framer-motion";

export function FeaturedTextFadeIn() {
  return (
    <motion.div
      // 1. Start invisible and 20px down
      initial={{ opacity: 0, y: 20 }}
      // 2. Animate to visible and original position
      whileInView={{ opacity: 1, y: 0 }}
      // 3. Trigger the animation once when 50% of it is in view
      viewport={{ once: true, amount: 0.5 }}
      
      // --- THIS IS THE CHANGE ---
      // Made the animation longer (1.2s) and added a small delay (0.3s)
      transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
      // --- END OF CHANGE ---

      className="absolute top-0 md:top-0 left-8 md:left-24 z-10 text-left max-w-sm md:max-w-md"
    >
      <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
        Featured Services
      </h2>
      <p className="text-xl text-gray-600">
        Discover amazing services offered by your fellow CMU students
      </p>
    </motion.div>
  );
}