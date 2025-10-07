// app/requests/[requestId]/page.tsx

import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// This is a Server Component that receives 'params' from the URL
export default async function RequestDetailPage({ params }: { params: { requestId: string } }) {

  // Fetch a single request where the 'id' column matches params.requestId
  const { data: request, error } = await supabase
    .from('requests')
    .select('*')
    .eq('id', params.requestId) // Find the row where 'id' is equal to the URL's id
    .single(); // We expect only one result

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

  return (
    <div className="container mx-auto p-4">
        <Button asChild variant="outline" className="mb-8">
            <Link href="/requests">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Requests
            </Link>
        </Button>

      {/* We'll fetch the real buyer's name in a future step */}
      <p className="text-sm text-muted-foreground">Posted by A CMU Student</p>
      <h1 className="text-4xl font-bold mt-2">{request.title}</h1>
      <p className="text-3xl font-bold mt-6">Budget: ${request.budget}</p>
      <Button size="lg" className="mt-8">
        Make an Offer
      </Button>
    </div>
  );
}