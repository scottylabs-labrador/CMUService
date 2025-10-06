// src/app/services/[serviceId]/page.tsx

'use client';

import { mockServices } from "@/lib/mockData";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from 'next/navigation'; // 👈 1. Import useParams
import { ChevronLeft } from "lucide-react";

// 👇 2. Remove params from the function signature
export default function ServiceDetailPage() {
  const router = useRouter(); 
  const params = useParams(); // 👈 3. Get params using the hook

  // 👇 4. Access the id from the params object
  const service = mockServices.find(
    (s) => s.id === parseInt(params.serviceId as string)
  );

  if (!service) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold">Service not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="outline" onClick={() => router.back()} className="mb-8">
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Services
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-video relative rounded-lg overflow-hidden">
          <Image
            src={service.imageUrl}
            alt={service.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        <div>
          <h1 className="text-4xl font-bold">{service.title}</h1>
          <p className="text-lg text-muted-foreground mt-2">by {service.sellerName}</p>
          <p className="text-3xl font-bold mt-6">Starting at ${service.price}</p>
          <Button size="lg" className="mt-8">
            Order Now
          </Button>
        </div>
      </div>
    </div>
  );
}