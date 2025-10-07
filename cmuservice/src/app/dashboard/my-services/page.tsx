// app/dashboard/my-services/page.tsx

import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server"; // Import the new server client
// No longer need to import 'cookies' here
import Link from "next/link";
import { redirect } from "next/navigation";

// 2. Make the component async
export default async function MyServicesPage() {
    const supabase = createClient();

    // 3. Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    // 4. If no user is logged in, redirect to the login page
    if (!user) {
        return redirect('/login');
    }

    // 5. Fetch services where 'user_id' matches the current user's ID
    const { data: services, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id); // The important filter!

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

            {/* 6. Display the services if they exist, otherwise show an empty state */}
            {services && services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <Link href={`/services/${service.id}`} key={service.id}>
                            <ServiceCard
                                title={service.title}
                                price={service.price}
                                sellerName={user.email || "Your Listing"} // We can use the user's email for now
                                imageUrl="https://placehold.co/600x400/e0e7ff/4338ca?text=Service"
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