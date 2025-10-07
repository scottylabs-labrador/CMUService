// src/app/services/page.tsx

import { ServiceCard } from "@/components/ServiceCard";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Define a type that matches the shape of your 'services' table data
type Service = {
  id: string;
  user_id: string;
  title: string;
  price: number;
  image_url: string | null;
  // Add other fields from your table here if needed
};

export default async function BrowseServicesPage({ 
    searchParams 
}: { 
    searchParams: { q: string } 
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const searchQuery = searchParams.q || '';

  // Apply the new type to your 'services' variable
  let services: Service[] | null;
  let error;

  if (searchQuery) {
    ({ data: services, error } = await supabase
      .rpc('search_services', { search_term: searchQuery }));
  } else {
    ({ data: services, error } = await supabase
      .from('services')
      .select('*'));
  }
  
  if (user && services) {
    // TypeScript now knows that 'service' is of type 'Service'
    services = services.filter(service => service.user_id !== user.id);
  }

  if (error) {
    console.error("Error fetching services:", error);
    return <p>Sorry, something went wrong. Please try again later.</p>;
  }
  
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