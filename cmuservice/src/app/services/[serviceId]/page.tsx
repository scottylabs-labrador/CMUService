// app/services/[serviceId]/page.tsx

import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Edit } from "lucide-react"; // Import the Edit icon

export default async function ServiceDetailPage({ params }: { params: { serviceId: string } }) {
  const supabase = createClient();

  // 1. Fetch the service data
  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', params.serviceId)
    .single();

  // 2. Fetch the current logged-in user
  const { data: { user } } = await supabase.auth.getUser();

  // Handle the case where the service isn't found
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

  // 3. Determine if the current user is the owner
  // The 'user &&' part is a safety check in case no one is logged in.
  const isOwner = user && user.id === service.user_id;

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
            src={service.image_url || "https://placehold.co/600x400/e0e7ff/4338ca?text=Service"}
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
          
          {/* 4. Conditionally render the correct button */}
          <div className="mt-8">
            {isOwner ? (
              <Button size="lg" asChild>
                {/* This link doesn't go anywhere yet, but we're setting it up */}
                <Link href={`/dashboard/my-services/edit/${service.id}`}>
                  <Edit className="mr-2 h-5 w-5" />
                  Edit Service
                </Link>
              </Button>
            ) : (
              <Button size="lg">
                Order Now
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}