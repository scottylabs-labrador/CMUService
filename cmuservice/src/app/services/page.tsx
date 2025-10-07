// src/app/services/page.tsx

import { ServiceCard } from "@/components/ServiceCard";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function BrowseServicesPage() {
  const supabase = createClient();

  // First, get the current user. This will be null if no one is logged in.
  const { data: { user } } = await supabase.auth.getUser();

  // Start building the query
  let query = supabase.from('services').select('*');

  // If a user is logged in, add a filter to exclude their own services
  if (user) {
    query = query.not('user_id', 'eq', user.id);
  }

  // Execute the final query
  const { data: services, error } = await query;

  if (error) { /* ... error handling ... */ }
  if (!services || services.length === 0) { /* ... empty state UI ... */ }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Browse Services</h1>
      <p className="mt-2 text-muted-foreground mb-8">
        Here you&apos;ll see a list of all the amazing services offered by CMU students.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services?.map((service) => (
          <Link href={`/services/${service.id}`} key={service.id}>
            <ServiceCard 
              title={service.title}
              price={service.price}
              sellerName="A CMU Student" 
              imageUrl={service.image_url || "https://placehold.co/600x400/e0e7ff/4338ca?text=Service"}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}