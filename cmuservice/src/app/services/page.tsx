// app/services/page.tsx

import { ServiceCard } from "@/components/ServiceCard";
import { supabase } from "@/lib/supabaseClient"; // 1. Import the Supabase client
import Link from "next/link";

// 2. Make the component async so we can use 'await'
export default async function BrowseServicesPage() {

  // 3. Fetch data directly from the 'services' table in Supabase
  const { data: services, error } = await supabase
    .from('services')
    .select('*'); // '*' means we want all columns

  // A good practice is to handle potential errors
  if (error) {
    console.error("Error fetching services:", error);
    return <p>Sorry, something went wrong. Please try again later.</p>;
  }
  
  // Another good practice is to handle the case where no services are found
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
        {/* 4. Map over the 'services' data from Supabase instead of mockServices */}
        {services.map((service) => (
          <Link href={`/services/${service.id}`} key={service.id}>
            <ServiceCard 
              title={service.title}
              price={service.price}
              // Note: We don't have sellerName or imageUrl in our table yet.
              // We'll add this feature in a later step!
              sellerName="A CMU Student" 
              imageUrl="https://placehold.co/600x400/e0e7ff/4338ca?text=Service"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}