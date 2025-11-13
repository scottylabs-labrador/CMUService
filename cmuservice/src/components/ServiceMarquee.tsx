"use client";

import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { ServiceCard } from "@/components/ServiceCard";

interface Profile {
  full_name: string;
  avatar_url: string | null;
}

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  user_id: string;
  created_at: string;
  avg_rating: number | null;
  review_count: number;
  profiles: Profile;
}

interface ServiceMarqueeProps {
  services: Service[];
}

export function ServiceMarquee({ services }: ServiceMarqueeProps) {
  return (
    <ThreeDMarquee
      items={services}
      renderItem={(service) => (
        <ServiceCard
          key={service.id}
          title={service.title}
          price={service.price}
          sellerId={service.user_id}
          sellerName={service.profiles?.full_name || "A CMU Student"}
          sellerAvatarUrl={service.profiles?.avatar_url || null}
          imageUrl={service.image_url || "/favicon.ico"}
          avgRating={service.avg_rating ?? undefined}
          reviewCount={service.review_count}
        />
      )}
      cols={4} // <--- This is the fix
      className="mx-4"
    />
  );
}