// src/app/page.tsx

import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Marquee } from "@/components/layout/Marquee";
import { CMUFuturisticBackground } from "@/components/ui/CMUFuturisticBackground";

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
      <CMUFuturisticBackground />
      <div className="relative z-10">
        <section className="relative flex-grow text-center flex items-center justify-center py-8">
          <div className="w-full max-w-screen-xl mx-auto relative z-10 px-4">
            <div className="animate-fade-in-up">
              <div className="bg-white/20 backdrop-blur-lg rounded-[3rem] p-16 md:p-24 border border-white/30 shadow-2xl">
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
                    className="bg-red-700 hover:bg-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 px-10 py-5 text-xl font-semibold rounded-2xl"
                  >
                    <Link href="/services">Find a Service</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-br from-white to-gray-50 text-gray-900 hover:bg-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 px-10 py-5 text-xl font-semibold rounded-2xl border-0"
                    style={{
                      boxShadow:
                        "0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 12px 24px -6px rgba(0, 0, 0, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <Link href="/requests">Post a Request</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Smooth transition section */}
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
            <Marquee>
              {services.map((service) => (
                <div
                  key={service.id}
                  className="w-80 mx-4 bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-lg"
                >
                  <Link href={`/services/${service.id}`}>
                    <ServiceCard
                      title={service.title}
                      price={service.price}
                      sellerId={service.user_id}
                      sellerName={
                        service.profiles?.full_name || "A CMU Student"
                      }
                      sellerAvatarUrl={service.profiles?.avatar_url || null}
                      imageUrl={service.image_url || "/favicon.ico"}
                      avgRating={service.avg_rating}
                      reviewCount={service.review_count}
                    />
                  </Link>
                </div>
              ))}
            </Marquee>
          )}
        </section>
      </div>
    </div>
  );
}
