// src/app/page.tsx

import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Marquee } from "@/components/layout/Marquee";

type Service = {
  id: string;
  user_id: string;
  title: string;
  price: number;
  image_url: string | null;
  avg_rating: number;
  review_count: number;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export default async function HomePage() {
  const supabase = createClient();

  const { data: services, error } = await supabase
    .from('services_with_ratings')
    .select(`*, profiles (full_name, avatar_url)`)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching featured services:", error);
  }

  return (
    <>
      <section className="text-center py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            The Tartan Marketplace
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
            Find peer-to-peer services from the CMU community, or offer your own
            skills to make some extra cash.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/services">Find a Service</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
               <Link href="/requests">Post a Request</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Services</h2>
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
                    sellerName={service.profiles?.full_name || 'A CMU Student'}
                    sellerAvatarUrl={service.profiles?.avatar_url || null}
                    imageUrl={service.image_url || "https://placehold.co/600x400/e0e7ff/4338ca?text=Service"}
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