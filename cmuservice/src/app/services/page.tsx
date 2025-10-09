// src/app/services/page.tsx

'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ServiceCard } from "@/components/ServiceCard";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

export default function BrowseServicesPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        let query;
        if (searchQuery) {
            query = supabase
                .from('services_with_ratings')
                .select('*, profiles (full_name, avatar_url)')
                .ilike('title', `%${searchQuery}%`);
        } else {
            query = supabase
                .from('services_with_ratings')
                .select('*, profiles (full_name, avatar_url)');
        }

        const { data, error } = await query;

        // --- THIS IS THE DEBUGGING LOG ---
        console.log("Fetched services data:", data);

        if (error) {
            console.error("Error fetching services:", error);
        } else if (data) {
            let filteredData = data;
            if (user) {
                filteredData = data.filter((service: Service) => service.user_id !== user.id);
            }
            setServices(filteredData as Service[]);
        }
        setLoading(false);
    };
    fetchServices();
  }, [searchQuery, supabase]);
  
  if (loading) return <div className="p-4 container mx-auto">Loading services...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Browse Services</h1>
      <p className="mt-2 text-muted-foreground mb-8">
        Find amazing services offered by other CMU students.
      </p>

      <form className="mb-8 flex gap-2">
        <Input name="q" placeholder="Search by title or description..." defaultValue={searchQuery} />
        <Button type="submit">Search</Button>
      </form>
      
      {services.length === 0 ? (
        <p className="text-muted-foreground">
          {searchQuery ? `No services found for "${searchQuery}".` : "No services have been listed yet."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link href={`/services/${service.id}`} key={service.id}>
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
          ))}
        </div>
      )}
    </div>
  );
}