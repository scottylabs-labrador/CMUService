"use client";

import { Navbar } from "@/components/layout/Navbar";
import { ServiceMarquee } from "@/components/ServiceMarquee";
import { FeaturedTextFadeIn } from "@/components/ui/FeaturedTextFadeIn";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import ScrollJourney from "@/components/ScrollJourney";
import SmoothScroll from "@/components/SmoothScroll";

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
  image_urls?: string[];
  user_id: string;
  created_at: string;
  avg_rating: number | null;
  review_count: number;
  profiles: Profile;
}

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("services_with_ratings")
          .select(`*, profiles (full_name, avatar_url)`)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!error && data) {
          setServices(data);
        }
      } catch (error) {
        console.warn("Failed to fetch services:", error);
      }
    };
    fetchServices();
  }, []);

  return (
    <SmoothScroll>
      <main className="min-h-screen bg-background selection:bg-primary/20">
        {/* Navbar */}
        <Navbar />

        {/* Hero Section */}
        <Hero />

        {/* Scroll Journey Section */}
        <ScrollJourney />

        {/* Featured Services Section */}
        <section className="relative bg-background py-24 overflow-hidden">
          <div className="relative">
            <FeaturedTextFadeIn />
            {services && services.length > 0 && (
              <ServiceMarquee services={services} />
            )}
          </div>
        </section>
      </main>
    </SmoothScroll>
  );
}
