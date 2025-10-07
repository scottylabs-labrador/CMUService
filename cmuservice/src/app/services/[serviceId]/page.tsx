// app/services/[serviceId]/page.tsx

import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// This is a Server Component, so we can fetch data directly
// It receives 'params' which contains the dynamic part of the URL
export default async function ServiceDetailPage({ params }: { params: { serviceId: string } }) {

  // Fetch a single service where the 'id' column matches params.serviceId
  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', params.serviceId) // Find the row where 'id' is equal to the URL's id
    .single(); // We expect only one result

  if (error || !service) {
    return (
      <div className="container mx-auto p-4">
        <Button asChild variant="outline" className="mb-8">
            <Link href="/services">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Services
            </Link>
        </Button>
        <h1 className="text-3xl font-bold">Service not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
        <Button asChild variant="outline" className="mb-8">
            <Link href="/services">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Services
            </Link>
        </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-video relative rounded-lg overflow-hidden">
          <Image
            // We'll add a real image upload feature later
            src={"https://placehold.co/600x400/e0e7ff/4338ca?text=Service"}
            alt={service.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div>
          <h1 className="text-4xl font-bold">{service.title}</h1>
          {/* We'll fetch the real seller's name in a future step */}
          <p className="text-lg text-muted-foreground mt-2">by A CMU Student</p> 
          <p className="text-3xl font-bold mt-6">Starting at ${service.price}</p>
          <Button size="lg" className="mt-8">
            Order Now
          </Button>
        </div>
      </div>
    </div>
  );
}