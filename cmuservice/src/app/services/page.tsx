// src/app/services/page.tsx

import { ServiceCard } from "@/components/ServiceCard";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function BrowseServicesPage({ 
    searchParams 
}: { 
    searchParams: { q: string } 
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const searchQuery = searchParams.q || '';

  let services;
  let error;

  if (searchQuery) {
    // If there is a search query, call the database function
    ({ data: services, error } = await supabase
      .rpc('search_services', { search_term: searchQuery }));
  } else {
    // If there is no search, just get all services
    ({ data: services, error } = await supabase
      .from('services')
      .select('*'));
  }

  // Exclude the user's own services from the final results
  if (user && services) {
    services = services.filter(service => service.user_id !== user.id);
  }

  if (error) { /* ... error handling ... */ }

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
      
      {(!services || services.length === 0) ? (
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
                sellerName="A CMU Student" 
                imageUrl={service.image_url || "https://placehold.co/600x400/e0e7ff/4338ca?text=Service"}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}