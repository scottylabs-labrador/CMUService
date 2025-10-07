// app/requests/[requestId]/page.tsx

import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Edit } from "lucide-react"; // Import the Edit icon

export default async function RequestDetailPage({ params }: { params: { requestId: string } }) {
  const supabase = createClient();

  // 1. Fetch the request data
  const { data: request, error } = await supabase
    .from('requests')
    .select('*')
    .eq('id', params.requestId)
    .single();

  // 2. Fetch the current logged-in user
  const { data: { user } } = await supabase.auth.getUser();

  // Handle the case where the request isn't found
  if (error || !request) {
    return (
      <div className="container mx-auto p-4">
        <Button asChild variant="outline" className="mb-8">
            <Link href="/requests">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Requests
            </Link>
        </Button>
        <h1 className="text-3xl font-bold">Request not found</h1>
      </div>
    );
  }
  
  // 3. Determine if the current user is the owner
  const isOwner = user && user.id === request.user_id;

  return (
    <div className="container mx-auto p-4">
        <Button asChild variant="outline" className="mb-8">
            <Link href="/requests">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Requests
            </Link>
        </Button>

      <p className="text-sm text-muted-foreground">Posted by A CMU Student</p>
      <h1 className="text-4xl font-bold mt-2">{request.title}</h1>
      <p className="text-3xl font-bold mt-6">Budget: ${request.budget}</p>
      
      {/* 4. Conditionally render the correct button */}
      <div className="mt-8">
        {isOwner ? (
            <Button size="lg" asChild>
                {/* This link doesn't go anywhere yet, but we're setting it up */}
                <Link href={`/dashboard/my-requests/edit/${request.id}`}>
                    <Edit className="mr-2 h-5 w-5" />
                    Edit Request
                </Link>
            </Button>
        ) : (
            <Button size="lg">
                Make an Offer
            </Button>
        )}
      </div>
    </div>
  );
}