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

// 1. ADD className TO THE INTERFACE
interface ServiceMarqueeProps {
  services: Service[];
  className?: string; // <-- ADDED
}

// 2. ACCEPT className IN THE FUNCTION
export function ServiceMarquee({
  services,
  className = "", // <-- ADDED
}: ServiceMarqueeProps) {
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
      cols={4}
      // 3. MERGE THE CLASSNAMES
      className={`mx-4 ${className}`} // <-- MODIFIED
    />
  );
}