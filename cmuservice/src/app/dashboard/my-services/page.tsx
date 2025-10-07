// app/dashboard/my-services/page.tsx

import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyServicesPage() {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login');
    }

    const { data: services, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id);

    if (error) {
        console.error("Error fetching services:", error);
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">My Services</h1>
                    <p className="mt-2 text-muted-foreground">
                        Services you are currently offering.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/my-services/create">Create New Service</Link>
                </Button>
            </div>

            {services && services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <Link href={`/services/${service.id}`} key={service.id}>
                            <ServiceCard
                                title={service.title}
                                price={service.price}
                                sellerName={user.email || "Your Listing"}
                                // Use the real image_url, or fall back to the placeholder
                                imageUrl={service.image_url || "https://placehold.co/600x400/e0e7ff/4338ca?text=Service"}
                            />
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-dashed border-2 rounded-lg">
                    <p className="text-muted-foreground">You haven&apos;t created any services yet.</p>
                </div>
            )}
        </div>
    );
}