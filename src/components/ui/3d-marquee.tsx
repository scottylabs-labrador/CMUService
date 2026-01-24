"use client";

import { motion, useInView } from "framer-motion";
import React, { useRef, useState, useLayoutEffect } from "react";

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
  if (!items || items.length === 0) {
    return null;
  }

  const minItemsPerColumn = 6;
  const minTotalItems = minItemsPerColumn * cols;
  let paddedItems = [...items];
  while (paddedItems.length < minTotalItems) {
    paddedItems = paddedItems.concat(items);
  }
  const columns: T[][] = Array.from({ length: cols }, () => []);
  paddedItems.forEach((item, i) => {
    columns[i % cols].push(item);
  });

  const listRef = useRef<HTMLDivElement>(null);
  const [listHeight, setListHeight] = useState(0);

  useLayoutEffect(() => {
    if (listRef.current) {
      const height = listRef.current.offsetHeight;
      setListHeight(height);
    }
  }, [items]);

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { amount: 0.1 });

  const gridContainerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const evenColumnVariants = {
    hidden: { opacity: 0, y: 100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.2, ease: "easeOut" },
    },
  };

  const oddColumnVariants = {
    hidden: { opacity: 0, y: -100 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.2, ease: "easeOut" },
    },
  };

  const renderItems = (itemsInGroup: T[], keyPrefix: string) => {
    return itemsInGroup.map((item, itemIdx) => (
      <motion.div
        key={`${keyPrefix}-${itemIdx}`}
        whileHover={{ y: -10 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative w-full" // <--- Added w-full to fill column width
      >
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700" />
        {renderItem(item, itemIdx)}
      </motion.div>
    ));
  };

  return (
    <motion.section
      ref={sectionRef}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className={`mx-auto block h-[800px] max-sm:h-[500px] 
        overflow-hidden rounded-2xl bg-white dark:bg-black ${className} 
        [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_85%,transparent_100%)]`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex w-full h-full items-center justify-center"
        style={{
          transform: "rotateX(55deg) rotateY(0deg) rotateZ(45deg) translateX(25%)",
        }}
      >
        <div className="w-full overflow-hidden scale-90 sm:scale-100">
          <motion.div
            className={`relative grid w-full origin-center 
              grid-cols-2 sm:grid-cols-4 gap-4 transform 
              items-start`}
            variants={gridContainerVariants}
          >
            {columns.map((itemsInGroup, idx) => {
              const isEvenColumn = idx % 2 === 0;
              const listOneItems = renderItems(itemsInGroup, `col-${idx}-a`);
              const listTwoItems = renderItems(itemsInGroup, `col-${idx}-b`);

              const evenColAnimation = {
                y: listHeight > 0 ? ["0%", `-${listHeight}px`] : ["0%", "-50%"],
              };
              const oddColAnimation = {
                y: listHeight > 0 ? [`-2${listHeight}px`, "50%"] : ["-50%", "0%"],
              };

              return (
                <motion.div
                  key={`column-wrapper-${idx}`}
                  variants={isEvenColumn ? evenColumnVariants : oddColumnVariants}
                  className="relative w-full" // <--- Added w-full here
                >
                  <div className="absolute left-0 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700" />

                  <motion.div
                    key={`column-looper-${idx}`}
                    animate={
                      isInView
                        ? isEvenColumn
                          ? evenColAnimation
                          : oddColAnimation
                        : undefined
                    }
                    transition={{
                      duration: isEvenColumn ? 120 : 140,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "linear",
                    }}
                    className="flex flex-col w-full" // <--- Removed items-center, added w-full
                  >
                    {isEvenColumn ? (
                      <>
                        <div
                          ref={idx === 0 ? listRef : null}
                          className="flex flex-col w-full gap-6" // <--- Removed items-center, added w-full
                        >
                          {listOneItems}
                        </div>
                        <div className="flex flex-col w-full gap-6"> {/* <--- Removed items-center, added w-full */}
                          {listTwoItems}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col w-full gap-6"> {/* <--- Removed items-center, added w-full */}
                          {listTwoItems}
                        </div>
                        <div className="flex flex-col w-full gap-6"> {/* <--- Removed items-center, added w-full */}
                          {listOneItems}
                        </div>
                      </>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
};