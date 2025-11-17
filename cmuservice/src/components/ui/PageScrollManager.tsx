"use client";

import { useEffect, useState } from "react";

export function PageScrollManager() {
  // This state acts as a lock to prevent the event from
  // firing multiple times while an auto-scroll is in progress.
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    // We will target the ID of the div you already have
    // that marks the top of the white section.
    const targetElement = document.getElementById("white-bg-sentinel");

    if (!targetElement) {
      console.warn("PageScrollManager: Could not find target element");
      return;
    }

    const handleWheel = (e: WheelEvent) => {
      // Check if the user is scrolling DOWN
      if (e.deltaY > 0) {
        // Check if we're at the top of the page AND not already auto-scrolling
        if (window.scrollY < 10 && !isScrolling) {
          // 1. Stop the browser's default scroll
          e.preventDefault();
          
          // 2. Set the lock
          setIsScrolling(true);

          // 3. Command the browser to smoothly scroll to the target
          targetElement.scrollIntoView({ behavior: "smooth" });

          // 4. Release the lock after 1 second (1000ms)
          // This gives the smooth scroll time to finish.
          setTimeout(() => {
            setIsScrolling(false);
          }, 1000);
        }
      }
    };

    // Add the event listener. 
    // 'passive: false' is REQUIRED to allow e.preventDefault()
    window.addEventListener("wheel", handleWheel, { passive: false });

    // Clean up the listener when the component unmounts
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [isScrolling]); // Re-run the effect setup if the 'isScrolling' lock changes

  // This component renders no visible HTML
  return null;
}