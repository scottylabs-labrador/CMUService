import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { ServiceMarquee } from "@/components/ServiceMarquee";
import LiquidEther from "@/components/ui/LiquidEther";
import { Navbar } from "@/components/layout/Navbar";
import { FeaturedTextFadeIn } from "@/components/ui/FeaturedTextFadeIn";
// We no longer import PageScrollManager

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
    // The <PageScrollManager /> is GONE.
    // The outer wrapper <div> is GONE.
    <div className="relative w-full">
      
      {/* --- HERO SECTION (Snap Item 1) --- */}
      {/* Added the 'snap-start' class */}
      <section className="h-screen relative overflow-hidden snap-start">
        
        {/* 1. LiquidEther Background (z-0) */}
        <div className="absolute top-0 left-0 w-full h-full z-0 bg-black">
          <LiquidEther
            colors={["#FF004C", "#FF33CC", "#00FFFF"]}
            mouseForce={20}
            cursorSize={30}
            isViscous={false}
            viscous={30}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.5}
            autoIntensity={2.2}
            takeoverDuration={0.25}
            autoResumeDelay={3000}
            autoRampDuration={0.6}
            // Your performance props
            resolution={0.1}
            iterationsPoisson={6}
            iterationsViscous={6}
          />
        </div>

        {/* 2. Navbar (z-20, absolute) */}
        <div className="absolute top-0 left-0 w-full z-20">
          <Navbar />
        </div>

        {/* 3. Hero Content (z-10, centered) */}
        {/* Changed 'pt-30' (invalid) to 'pt-32' (valid) */}
        <div className="relative h-full z-10 flex items-center justify-center text-center pt-32 pb-20 sm:pb-24">
          <div className="w-full max-w-screen-xl mx-auto px-4">
            <div className="animate-fade-in-up">
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
                  <Button
                    asChild
                    size="lg"
                    className="shine-hover rounded-2xl px-10 py-5 text-xl font-semibold border border-white/30 bg-red-600/60 hover:bg-red-600/70 text-white backdrop-blur-lg backdrop-saturate-150 shadow-xl transition-all duration-300 hover:shadow-2xl hover:ring-2 hover:ring-red-300/40 transform hover:scale-105"
                  >
                    <Link href="/services">Find a Service</Link>
                  </Button>
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
        </div>
      </section>
      {/* --- END OF HERO SECTION --- */}


      {/* --- FEATURED SERVICES SECTION (Snap Item 2) --- */}
      {/* Added 'h-screen' and 'snap-start' */}
      <section className="h-screen relative bg-white snap-start py-12 overflow-hidden">
        {/* The 'white-bg-sentinel' divs are GONE */}
        <div className="relative">
          <FeaturedTextFadeIn />
          {services && services.length > 0 && (
            <ServiceMarquee services={services} />
          )}
        </div>
      </section>
      {/* --- END OF FEATURED SERVICES SECTION --- */}

    </div>
  );
}