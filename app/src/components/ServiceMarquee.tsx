"use client";

import { ThreeDMarquee } from "@/components/ui/3d-marquee";
import { ServiceCard } from "@/components/ServiceCard";
import Link from "next/link";

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
  className?: string;
}

export function ServiceMarquee({
  services,
  className = "",
}: ServiceMarqueeProps) {
  return (
    <ThreeDMarquee
      items={services}
      renderItem={(service) => (
        <Link 
          href={`/services/${service.id}`} 
          key={service.id}
          className="w-full block h-full" // <--- This forces the link to fill the column
        >
          <ServiceCard
            title={service.title}
            price={service.price}
            sellerId={service.user_id}
            sellerName={service.profiles?.full_name || "A CMU Student"}
            sellerAvatarUrl={service.profiles?.avatar_url || null}
            imageUrl={service.image_url || "/favicon.ico"}
            avgRating={service.avg_rating ?? undefined}
            reviewCount={service.review_count}
          />
        </Link>
      )}
      cols={4}
      className={`mx-4 ${className}`}
    />
  );
}