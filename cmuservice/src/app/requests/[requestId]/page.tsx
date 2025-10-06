// src/app/requests/[requestId]/page.tsx

'use client';

import { mockRequests } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from 'next/navigation'; // 👈 1. Import useParams
import { ChevronLeft } from "lucide-react";

// 👇 2. Remove params from the function signature
export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams(); // 👈 3. Get params using the hook

  // 👇 4. Access the id from the params object
  const request = mockRequests.find(
    (r) => r.id === parseInt(params.requestId as string)
  );

  if (!request) {
    return (
      <div className="container mx-auto p-4">
        <Button variant="outline" onClick={() => router.back()} className="mb-8">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Requests
        </Button>
        <h1 className="text-3xl font-bold">Request not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="outline" onClick={() => router.back()} className="mb-8">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Requests
      </Button>

      <p className="text-sm text-muted-foreground">Posted by {request.buyerName}</p>
      <h1 className="text-4xl font-bold mt-2">{request.title}</h1>
      <p className="text-3xl font-bold mt-6">Budget: ${request.budget}</p>
      <Button size="lg" className="mt-8">
        Make an Offer
      </Button>
    </div>
  );
}