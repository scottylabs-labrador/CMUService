// src/app/services/[serviceId]/page.tsx

import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Edit } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default async function ServiceDetailPage({ params }: { params: { serviceId: string } }) {
    const supabase = createClient();
    const { data: service, error } = await supabase.from('services').select('*').eq('id', params.serviceId).single();
    const { data: { user } } = await supabase.auth.getUser();

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

    const isOwner = user && user.id === service.user_id;
    const backPath = isOwner ? "/dashboard/my-services" : "/services";

    return (
        <div className="container mx-auto p-4">
            <Button asChild variant="outline" className="mb-8">
                <Link href={backPath}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Link>
            </Button>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <div className="aspect-video relative rounded-lg overflow-hidden border">
                        <Image src={service.image_url || "https://placehold.co/600x400/e0e7ff/4338ca?text=Service"} alt={service.title} fill className="object-cover" unoptimized />
                    </div>
                    {service.description && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold">About this service</h2>
                            <p className="text-muted-foreground mt-4 whitespace-pre-wrap break-words">{service.description}</p>
                        </div>
                    )}
                </div>
                <div className="md:col-span-1">
                    <div className="p-6 border rounded-lg">
                        <h1 className="text-2xl font-bold">{service.title}</h1>
                        <p className="text-md text-muted-foreground mt-2">by A CMU Student</p> 
                        <Separator className="my-4" />
                        <p className="text-2xl font-bold">Starting at ${service.price}</p>
                        <div className="mt-6">
                            {isOwner ? ( <Button size="lg" className="w-full" asChild><Link href={`/dashboard/my-services/edit/${service.id}`}><Edit className="mr-2 h-5 w-5" />Edit Service</Link></Button>
                            ) : ( <Button size="lg" className="w-full" asChild><Link href={`/checkout/${service.id}`}>Order Now</Link></Button> )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}