// src/app/checkout/[serviceId]/page.tsx

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { CheckoutForm } from "@/components/forms/CheckoutForm"; // Import the new component

export default async function CheckoutPage({ params }: { params: { serviceId: string } }) {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return redirect('/login');
    }

    const { data: service, error } = await supabase
        .from('services')
        .select('id, user_id, title, price, image_url') // Select only the needed columns
        .eq('id', params.serviceId)
        .single();
        
    if (error || !service) {
        return <div>Error: Service not found.</div>;
    }

    if (service.user_id === user.id) {
        return redirect(`/services/${service.id}`);
    }

    const serviceFee = (service.price * 0.05).toFixed(2);
    const total = (service.price + parseFloat(serviceFee));

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">Confirm and Pay</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="relative h-16 w-24 rounded-md overflow-hidden border">
                            <Image 
                                src={service.image_url || "https://placehold.co/600x400/e0e7ff/4338ca?text=Service"}
                                alt={service.title}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                        <p className="font-semibold flex-1">{service.title}</p>
                        <p className="font-bold text-lg">${service.price.toFixed(2)}</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <p className="text-muted-foreground">Service price</p>
                            <p>${service.price.toFixed(2)}</p>
                        </div>
                         <div className="flex justify-between">
                            <p className="text-muted-foreground">Service fee</p>
                            <p>${serviceFee}</p>
                        </div>
                    </div>
                    <Separator />
                     <div className="flex justify-between font-bold text-lg">
                        <p>Total</p>
                        <p>${total.toFixed(2)}</p>
                    </div>
                </CardContent>
                <CardFooter>
                    {/* Render the new interactive component, passing the data it needs */}
                    <CheckoutForm service={service} user={user} />
                </CardFooter>
            </Card>
        </div>
    );
}