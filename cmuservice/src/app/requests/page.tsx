// src/app/requests/page.tsx

import { RequestCard } from "@/components/RequestCard";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Define a type for your 'requests' table data
type Request = {
  id: string;
  user_id: string;
  title: string;
  budget: number;
  description: string | null;
};

export default async function BrowseRequestsPage({ 
    searchParams 
}: { 
    searchParams: { q: string } 
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const searchQuery = searchParams.q || '';

  // Apply the new type to your 'requests' variable
  let requests: Request[] | null;
  let error;

  if (searchQuery) {
    ({ data: requests, error } = await supabase
      .rpc('search_requests', { search_term: searchQuery }));
  } else {
    ({ data: requests, error } = await supabase
      .from('requests')
      .select('*'));
  }

  if (user && requests) {
    // TypeScript now knows that 'request' is of type 'Request'
    requests = requests.filter(request => request.user_id !== user.id);
  }

  if (error) {
    console.error("Error fetching requests:", error);
    return <p>Sorry, something went wrong. Please try again later.</p>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Browse Requests</h1>
      <p className="mt-2 text-muted-foreground mb-8">
        Find jobs that other students need help with.
      </p>

      <form className="mb-8 flex gap-2">
        <Input name="q" placeholder="Search by title or description..." defaultValue={searchQuery} />
        <Button type="submit">Search</Button>
      </form>
      
      {(!requests || requests.length === 0) ? (
        <p className="text-muted-foreground">
          {searchQuery ? `No requests found for "${searchQuery}".` : "No requests have been posted yet."}
        </p>
      ) : (
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
      )}
    </div>
  );
}