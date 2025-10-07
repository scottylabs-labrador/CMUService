// src/app/services/[serviceId]/page.tsx

import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function ServiceDetailPage({ params }: { params: { serviceId: string } }) {
  const supabase = createClient();

  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', params.serviceId)
    .single();

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
            src={"https://placehold.co/600x400/e0e7ff/4338ca?text=Service"}
            alt={service.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div>
          <h1 className="text-4xl font-bold">{service.title}</h1>
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