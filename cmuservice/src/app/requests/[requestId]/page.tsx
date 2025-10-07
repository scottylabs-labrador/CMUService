// src/app/requests/[requestId]/page.tsx

import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function RequestDetailPage({ params }: { params: { requestId: string } }) {
  // Correctly create the client with zero arguments
  const supabase = createClient();

  const { data: request, error } = await supabase
    .from('requests')
    .select('*')
    .eq('id', params.requestId)
    .single();

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

      <p className="text-sm text-muted-foreground">Posted by A CMU Student</p>
      <h1 className="text-4xl font-bold mt-2">{request.title}</h1>
      <p className="text-3xl font-bold mt-6">Budget: ${request.budget}</p>
      <Button size="lg" className="mt-8">
        Make an Offer
      </Button>
    </div>
  );
}