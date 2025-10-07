// src/app/requests/page.tsx

import { RequestCard } from "@/components/RequestCard";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function BrowseRequestsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase.from('requests').select('*');

  if (user) {
    query = query.not('user_id', 'eq', user.id);
  }

  const { data: requests, error } = await query;

  if (error) { /* ... error handling ... */ }
  if (!requests || requests.length === 0) { /* ... empty state UI ... */ }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Browse Requests</h1>
      <p className="mt-2 text-muted-foreground mb-8">
        Here you&apos;ll see a list of jobs that students need help with.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests?.map((request) => (
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