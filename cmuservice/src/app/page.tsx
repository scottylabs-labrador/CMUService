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
    <>
      <section
        className="relative text-center pt-4 pb-4 h-screen flex items-center justify-center overflow-hidden"
        style={{ height: "calc(100vh - 5rem)" }}
      >
        <CMUFuturisticBackground />
        <div className="container mx-auto relative z-10 px-4">
          <div className="animate-fade-in-up">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-4 leading-tight relative text-gray-900">
              <span>The Tartan</span>
              <span className="block plaid-text-animation mt-2">
                Marketplace
              </span>
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto text-gray-800 mb-8 leading-relaxed relative">
              Find peer-to-peer services from the CMU community, or offer your
              own skills to make some extra cash.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-red-700 hover:bg-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                <Link href="/services">Find a Service</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-br from-white to-gray-50 text-gray-900 hover:bg-white shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 px-8 py-4 text-lg font-semibold rounded-xl border-0"
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
      </section>

      {/* Smooth transition section */}
      <div className="h-8 bg-gradient-to-b from-transparent via-white/50 to-white relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/20 to-white"></div>
      </div>

      <section className="py-8 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Featured Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing services offered by your fellow CMU students
            </p>
          </div>
        </div>

        {services && services.length > 0 && (
          <Marquee>
            {services.map((service) => (
              <div key={service.id} className="w-80 mx-4">
                <Link href={`/services/${service.id}`}>
                  <ServiceCard
                    title={service.title}
                    price={service.price}
                    sellerId={service.user_id}
                    sellerName={service.profiles?.full_name || "A CMU Student"}
                    sellerAvatarUrl={service.profiles?.avatar_url || null}
                    imageUrl={
                      service.image_url ||
                      "https://placehold.co/600x400/e0e7ff/4338ca?text=Service"
                    }
                    avgRating={service.avg_rating}
                    reviewCount={service.review_count}
                  />
                </Link>
              </div>
            ))}
          </Marquee>
        )}
      </section>
    </>
  );
}
