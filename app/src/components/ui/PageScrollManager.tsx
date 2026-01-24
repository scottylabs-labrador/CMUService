"use client";

import { useEffect, useRef } from "react";

// --- 1. New Easing Function ---
// We add an easing function for a much smoother feel.
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// --- 2. New Custom Smooth Scroll Function ---
// This replaces the native 'behavior: "smooth"'
function customSmoothScroll(targetPosition: number, duration: number) {
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;

  function scrollAnimation(currentTime: number) {
    if (startTime === null) {
      startTime = currentTime;
    }

    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1); // 0 to 1
    const easedProgress = easeInOutCubic(progress); // Apply easing

    window.scrollTo(0, startPosition + distance * easedProgress);

    if (timeElapsed < duration) {
      requestAnimationFrame(scrollAnimation);
    }
  }

  requestAnimationFrame(scrollAnimation);
}


export function PageScrollManager() {
  const isScrollingRef = useRef(false);
  const downTargetRef = useRef<HTMLElement | null>(null);
  const downTargetTopRef = useRef(0);

  // --- 3. Set the desired scroll speed ---
  const scrollDuration = 1500; // 1.5 seconds (was 1.0s lock)

  useEffect(() => {
    downTargetRef.current = document.getElementById("white-bg-sentinel");

    if (!downTargetRef.current) {
      console.warn("PageScrollManager: Could not find target element");
      return;
    }

    downTargetTopRef.current = downTargetRef.current.offsetTop;

    const handleWheel = (e: WheelEvent) => {
      if (isScrollingRef.current) {
        e.preventDefault();
        return;
      }

      // 1. User is scrolling DOWN
      if (e.deltaY > 0) {
        if (window.scrollY < 10) {
          e.preventDefault();
          isScrollingRef.current = true;
          
          // --- 4. Use Custom Scroll Function ---
          customSmoothScroll(downTargetTopRef.current, scrollDuration);

          setTimeout(() => {
            isScrollingRef.current = false;
          }, scrollDuration); // Use the same duration for the lock
        }
      } 
      // 2. User is scrolling UP
      else if (e.deltaY < 0) {
        if (Math.abs(window.scrollY - downTargetTopRef.current) < 10) {
          e.preventDefault();
          isScrollingRef.current = true;

          // --- 5. Use Custom Scroll Function ---
          customSmoothScroll(0, scrollDuration); // Scroll to top (0)

          setTimeout(() => {
            isScrollingRef.current = false;
          }, scrollDuration); // Use the same duration for the lock
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
    
  }, []); // We don't need scrollDuration here, it's a constant.

  return null;
}