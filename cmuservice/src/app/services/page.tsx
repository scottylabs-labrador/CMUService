// src/app/services/page.tsx

import { ServiceCard } from "@/components/ServiceCard";
import { createClient } from "@/utils/supabase/server"; // Use the new server client
import { cookies } from "next/headers"; // Import cookies
import Link from "next/link";

export default async function BrowseServicesPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore); // Create the server client

  const { data: services, error } = await supabase
    .from('services')
    .select('*');

  if (error) {
    console.error("Error fetching services:", error);
    return <p>Sorry, something went wrong. Please try again later.</p>;
  }
  
  if (!services || services.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold">Browse Services</h1>
        <p className="mt-2 text-muted-foreground mb-8">
          No services have been listed yet. Be the first!
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Browse Services</h1>
      <p className="mt-2 text-muted-foreground mb-8">
        Here you&apos;ll see a list of all the amazing services offered by CMU students.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Link href={`/services/${service.id}`} key={service.id}>
            <ServiceCard 
              title={service.title}
              price={service.price}
              sellerName="A CMU Student" 
              imageUrl="https://placehold.co/600x400/e0e7ff/4338ca?text=Service"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}