// src/app/requests/page.tsx

import { RequestCard } from "@/components/RequestCard";
import { mockRequests } from "@/lib/mockData";
import Link from "next/link"; // 👈 Import Link

export default function BrowseRequestsPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Browse Requests</h1>
      <p className="mt-2 text-muted-foreground mb-8">
        Here you&apos;ll see a list of jobs that students need help with.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockRequests.map((request) => (
          // 👇 Wrap the RequestCard with a Link
          <Link href={`/requests/${request.id}`} key={request.id}>
            <RequestCard 
              title={request.title}
              budget={request.budget}
              buyerName={request.buyerName}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}