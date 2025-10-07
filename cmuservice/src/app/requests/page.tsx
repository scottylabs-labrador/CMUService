// app/requests/page.tsx

import { RequestCard } from "@/components/RequestCard";
import { supabase } from "@/lib/supabaseClient"; // 1. Import the Supabase client
import Link from "next/link";

// 2. Make the component async so we can use 'await'
export default async function BrowseRequestsPage() {

  // 3. Fetch data directly from the 'requests' table in Supabase
  const { data: requests, error } = await supabase
    .from('requests')
    .select('*'); // '*' means we want all columns

  // A good practice is to handle potential errors
  if (error) {
    console.error("Error fetching requests:", error);
    return <p>Sorry, something went wrong. Please try again later.</p>;
  }
  
  // Another good practice is to handle the case where no requests are found
  if (!requests || requests.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold">Browse Requests</h1>
        <p className="mt-2 text-muted-foreground mb-8">
          No one has requested a service yet.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Browse Requests</h1>
      <p className="mt-2 text-muted-foreground mb-8">
        Here you&apos;ll see a list of jobs that students need help with.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 4. Map over the 'requests' data from Supabase instead of mockRequests */}
        {requests.map((request) => (
          <Link href={`/requests/${request.id}`} key={request.id}>
            <RequestCard 
              title={request.title}
              budget={request.budget}
              // Note: We don't have the buyer's name in this table yet.
              // We will add this feature when we implement user profiles.
              buyerName="A CMU Student"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}