"use client";

export default function AnimatedTrail() {
  const cards = Array.from({ length: 6 });

  return (
    <div className="relative w-full h-full overflow-visible flex items-center justify-center opacity-20">
      <div className="relative w-full h-full flex items-center justify-center">
        {cards.map((_, i) => {
          return (
            <div
              key={i}
              className={`absolute w-64 h-96 rounded-3xl backdrop-blur-sm border border-white/10 shadow-2xl card-flourish-${i}`}
              style={{
                background: `linear-gradient(135deg, 
                                    rgba(255, 87, 51, ${0.05 + (i / cards.length) * 0.15}), 
                                    rgba(255, 105, 180, ${0.05 + (i / cards.length) * 0.15}))`,
                animationDelay: `${i * 0.2}s`,
                zIndex: 6 - Math.abs(i - 2.5),
              }}
            >
              <div className="w-full h-full p-6 flex flex-col gap-3 opacity-40">
                <div className="w-2/3 h-3 bg-white/20 rounded-full" />
                <div className="w-1/2 h-3 bg-white/15 rounded-full" />
                <div className="mt-auto w-full h-24 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
