// src/app/checkout/[serviceId]/page.tsx

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { CheckoutForm } from "@/components/forms/CheckoutForm";
import { auth } from "@clerk/nextjs/server";

// The fix is to await params in Next.js 15+
export default async function CheckoutPage({ params }: { params: Promise<{ serviceId: string }> }) {
    const { serviceId } = await params;
    const supabase = await createClient();

    const { userId } = await auth();
    if (!userId) {
        return redirect('/login');
    }

    // Fetch service details
    const { data: service, error: serviceFetchError } = await supabase
        .from('services')
        .select('id, user_id, title, price, image_url')
        .eq('id', serviceId)
        .single();
        
    // Handle case where service isn't found
    if (serviceFetchError || !service) {
        console.error("Checkout Error - Service not found:", serviceFetchError);
        // Redirect back to services page with an error indicator
        return redirect('/services?error=not_found'); 
    }

    // Prevent user from buying their own service
    if (service.user_id === userId) {
        return redirect(`/services/${service.id}`);
    }

    // Ensure price is treated as a number, default to 0 if not
    const priceAsNumber = typeof service.price === 'number' ? service.price : 0;

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">Confirm Service Request</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Service Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative h-16 w-24 rounded-md overflow-hidden border">
                            <Image 
                                src={service.image_url || "https://placehold.co/600x400/e0e7ff/4338ca?text=Service"}
                                alt={service.title}
                                fill
                                className="object-cover"
                                unoptimized // Keep this if using placehold.co or SVG placeholders
                            />
                        </div>
                        <p className="font-semibold flex-1">{service.title}</p>
                        <p className="font-bold text-lg">${priceAsNumber.toFixed(2)}</p>
                    </div>
                    <Separator />
                     <div className="flex justify-between font-bold text-lg">
                        <p>Agreed Price</p>
                        <p>${priceAsNumber.toFixed(2)}</p>
                    </div>
                </CardContent>
                <CardFooter>
                    {/* Ensure service and user are passed correctly */}
                    <CheckoutForm service={service} user={{ id: userId } as any} />
                </CardFooter>
            </Card>
            <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                    By confirming, you agree to arrange payment with the seller off-platform.
                </p>
            </div>
        </div>
    );
}