// app/dashboard/my-requests/page.tsx

import { RequestCard } from "@/components/RequestCard";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server"; // 1. Import the server client

import Link from "next/link";
import { redirect } from "next/navigation";

// 2. Make the component async
export default async function MyRequestsPage() {
    const supabase = createClient();

    // 3. Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    // 4. If no user is logged in, redirect to the login page
    if (!user) {
        return redirect('/login');
    }

    // 5. Fetch requests where 'user_id' matches the current user's ID
    const { data: requests, error } = await supabase
        .from('requests')
        .select('*')
        .eq('user_id', user.id); // The important filter!

    if (error) {
        console.error("Error fetching requests:", error);
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">My Requests</h1>
                    <p className="mt-2 text-muted-foreground">
                        Jobs you are currently requesting help for.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/my-requests/create">Create New Request</Link>
                </Button>
            </div>

            {/* 6. Display the requests if they exist, otherwise show an empty state */}
            {requests && requests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map((request) => (
                        <Link href={`/requests/${request.id}`} key={request.id}>
                            <RequestCard
                                title={request.title}
                                budget={request.budget}
                                buyerName={user.email || "Your Listing"}
                            />
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-dashed border-2 rounded-lg">
                    <p className="text-muted-foreground">You haven&apos;t created any requests yet.</p>
                </div>
            )}
        </div>
    );
}