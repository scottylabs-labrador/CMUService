import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full bg-[#F5F5F5] dark:bg-[#0A0A0A] overflow-hidden">
      {/* Animated Gradient Orb - matching home screen */}
      <div className="absolute top-[30%] right-[-15%] md:right-[-5%] w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-0 animate-[move-in-circle_8s_linear_infinite]">
        <div
          className="w-full h-full animate-[pulse-glow_8s_ease-in-out_infinite]"
          style={{
            background:
              "radial-gradient(circle at center, #FF8800 0%, #FF6600 15%, #FF7700 30%, #FF5500 45%, #FF6699 65%, #FF88AA 80%, transparent 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 sm:px-12 lg:px-24 py-8">
        <SignIn />
      </div>
    </div>
  );
}
