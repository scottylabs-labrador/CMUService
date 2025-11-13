"use client";

import { motion } from "framer-motion"; // Make sure motion is imported
import React from "react";

export interface ThreeDMarqueeProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  cols?: number;
}

export const ThreeDMarquee = <T extends any>({
  items,
  renderItem,
  className = "",
  cols = 4,
}: ThreeDMarqueeProps<T>) => {
  // Handle the case where there are no items
  if (!items || items.length === 0) {
    return null;
  }

  // Define a minimum number of items per column for a "full" look
  const minItemsPerColumn = 5;
  const minTotalItems = minItemsPerColumn * cols;

  let paddedItems = [...items];

  // Keep repeating the list until it's long enough
  while (paddedItems.length < minTotalItems) {
    paddedItems = paddedItems.concat(items);
  }

  // Create the columns using the new 'paddedItems' list
  const columns: T[][] = Array.from({ length: cols }, () => []);
  paddedItems.forEach((item, i) => {
    columns[i % cols].push(item);
  });

  const renderItems = (itemsInGroup: T[], keyPrefix: string) => {
    return itemsInGroup.map((item, itemIdx) => (
      <motion.div
        key={`${keyPrefix}-${itemIdx}`}
        whileHover={{ y: -10 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative"
      >
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700" />
        {renderItem(item, itemIdx)}
      </motion.div>
    ));
  };

  return (
    <section
      className={`mx-auto block h-[600px] max-sm:h-[400px] 
        overflow-hidden rounded-2xl bg-white dark:bg-black ${className}`}
    >
      {/* --- THIS IS THE FIX --- */}
      {/* 1. Convert this <div> to a motion.div */}
      <motion.div
        // 2. Start it as invisible
        initial={{ opacity: 0 }}
        // 3. Animate it to visible
        animate={{ opacity: 1 }}
        // 4. Give it a short delay and duration to hide the layout "jump"
        transition={{ duration: 0.5, delay: 0.2 }}
        // --- END OF FIX ---
        className="flex w-full h-full items-center justify-center"
        style={{
          transform: "rotateX(55deg) rotateY(0deg) rotateZ(45deg)",
        }}
      >
        <div className="w-full overflow-hidden scale-90 sm:scale-100">
          <div
            className={`relative grid h-full w-full origin-center 
              grid-cols-2 sm:grid-cols-4 gap-4 transform 
              items-start`}
          >
            {columns.map((itemsInGroup, idx) => {
              const isEvenColumn = idx % 2 === 0;
              const listOneItems = renderItems(itemsInGroup, `col-${idx}-a`);
              const listTwoItems = renderItems(itemsInGroup, `col-${idx}-b`);

              return (
                <motion.div
                  key={`column-${idx}`}
                  animate={{
                    y: isEvenColumn ? ["0%", "-50%"] : ["-50%", "0%"],
                  }}
                  transition={{
                    duration: isEvenColumn ? 120 : 140, // Kept the slow speed
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear",
                  }}
                  className="flex flex-col items-center relative gap-6"
                >
                  <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />
                  {isEvenColumn ? (
                    <>
                      {listOneItems}
                      {listTwoItems}
                    </>
                  ) : (
                    <>
                      {listTwoItems}
                      {listOneItems}
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
};