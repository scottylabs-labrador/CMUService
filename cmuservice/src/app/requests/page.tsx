// src/app/requests/page.tsx

import { RequestCard } from "@/components/RequestCard";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function BrowseRequestsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: requests, error } = await supabase
    .from('requests')
    .select('*');

  if (error) {
    console.error("Error fetching requests:", error);
    return <p>Sorry, something went wrong. Please try again later.</p>;
  }
  
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
        {requests.map((request) => (
          <Link href={`/requests/${request.id}`} key={request.id}>
            <RequestCard 
              title={request.title}
              budget={request.budget}
              buyerName="A CMU Student"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}