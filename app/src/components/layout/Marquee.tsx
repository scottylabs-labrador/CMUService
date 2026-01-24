// src/components/layout/Marquee.tsx

import { ReactNode } from 'react';

// Define a simple CSS animation for the scrolling effect
const marqueeStyle = `
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee {
    animation: marquee 60s linear infinite;
  }
`;

interface MarqueeProps {
  children: ReactNode;
}

export function Marquee({ children }: MarqueeProps) {
  return (
    <div className="relative flex w-full overflow-x-hidden">
      <style>{marqueeStyle}</style>
      <div className="flex w-max animate-marquee">
        {/* We render the children twice to create a seamless loop */}
        {children}
        {children}
      </div>
    </div>
  );
}