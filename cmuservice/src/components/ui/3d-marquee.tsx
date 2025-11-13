"use client";

import { motion } from "framer-motion";
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
  // ... (rest of the padding logic) ...
  if (!items || items.length === 0) {
    return null;
  }
  const minItemsPerColumn = 5;
  const minTotalItems = minItemsPerColumn * cols;
  let paddedItems = [...items];
  while (paddedItems.length < minTotalItems) {
    paddedItems = paddedItems.concat(items);
  }
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
  // ... (end of padding logic) ...

  return (
    <section
      className={`mx-auto block h-[800px] max-sm:h-[500px] 
        overflow-hidden rounded-2xl bg-white dark:bg-black ${className} 
        
        [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex w-full h-full items-center justify-center"
        // --- THIS IS THE FIX ---
        style={{
          transform: "rotateX(55deg) rotateY(0deg) rotateZ(45deg) translateX(25%)", // <-- ADDED translateX
        }}
        // --- END OF FIX ---
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
                    duration: isEvenColumn ? 120 : 140, // Slowed down
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