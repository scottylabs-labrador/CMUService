import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { ServiceMarquee } from "@/components/ServiceMarquee";
import LiquidEther from '@/components/ui/LiquidEther';

export default async function HomePage() {
  const supabase = await createClient();

  const { data: services, error } = await supabase
    .from("services_with_ratings")
    .select(`*, profiles (full_name, avatar_url)`)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching featured services:", error);
  }

  return (
    <div className="relative w-full"> 
      <div style={{ 
        width: '100%', 
        height: 750, // Extended height
        position: 'fixed', 
        top: 0, 
        left: 0,
        zIndex: 0, // Sits behind the content
        backgroundColor: 'black' // Added black background here
      }}>
        <LiquidEther
          // Using the bright red, pink, and cyan colors
          colors={[ '#FF004C', '#FF33CC', '#00FFFF' ]} 
          mouseForce={20}
          cursorSize={100}
          isViscous={false}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.5}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>

      {/* This div has relative z-10, so it will stack on top of the fixed background */}
      <div className="relative z-10">
        {/* Taller hero area: compact top, a bit more bottom space to extend gradient section */}
        <section className="relative flex-grow text-center flex items-center justify-center pt-4 pb-20 sm:pb-24">
          <div className="w-full max-w-screen-xl mx-auto relative z-10 px-4">
            <div className="animate-fade-in-up">
              {/* Slightly wider than the container using small negative margins */}
              <div className="-mx-2 sm:-mx-4 bg-white/20 backdrop-blur-lg rounded-[3rem] p-16 md:p-24 border border-white/30 shadow-2xl">
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-6 leading-tight relative text-gray-900">
                  <span>The Tartan</span>
                  <span className="block plaid-text-animation mt-2">
                    Marketplace
                  </span>
                </h1>
                <p className="text-xl md:text-2xl max-w-4xl mx-auto text-white mb-10 leading-relaxed relative">
                  Find peer-to-peer services from the CMU community, or offer
                  your own skills to make some extra cash
                </p>
                <div className="mt-10 flex flex-col sm:flex-row justify-center gap-6">
                  {/* Red-tinted glass button (stronger red) */}
                  <Button
                    asChild
                    size="lg"
                    className="shine-hover rounded-2xl px-10 py-5 text-xl font-semibold border border-white/30 bg-red-600/60 hover:bg-red-600/70 text-white backdrop-blur-lg backdrop-saturate-150 shadow-xl transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-red-300/40 transform hover:scale-105"
                  >
                    <Link href="/services">Find a Service</Link>
                  </Button>
                  {/* White-tinted glass button */}
                  <Button
                    asChild
                    size="lg"
                    className="shine-hover rounded-2xl px-10 py-5 text-xl font-semibold border border-white/40 bg-white/25 hover:bg-white/35 text-gray-900 backdrop-blur-lg shadow-xl transition-all duration-300 hover:shadow-2xl transform hover:scale-105"
                  >
                    <Link href="/requests">Post a Request</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Smooth transition section */}
        <div id="white-bg-sentinel" className="h-0" />
        <div className="h-16 bg-white" />

        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
                Featured Services
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover amazing services offered by your fellow CMU students
              </p>
            </div>
          </div>
          {services && services.length > 0 && (
            <ServiceMarquee services={services} />
          )}

        </section>
      </div>
    </div>
  );
}