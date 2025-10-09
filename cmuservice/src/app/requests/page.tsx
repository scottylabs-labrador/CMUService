// src/app/requests/page.tsx

'use client';

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { RequestCard } from "@/components/RequestCard";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Request = {
  id: string;
  user_id: string;
  title: string;
  budget: number;
  status: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export default function BrowseRequestsPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        let query;
        if (searchQuery) {
            query = supabase.from('requests').select('*, profiles (full_name, avatar_url)').ilike('title', `%${searchQuery}%`);
        } else {
            query = supabase.from('requests').select('*, profiles (full_name, avatar_url)');
        }

        const { data, error } = await query.eq('status', 'open');

        if (error) {
            console.error("Error fetching requests:", error);
        } else if (data) {
            let filteredData = data;
            if (user) {
                filteredData = data.filter((req: Request) => req.user_id !== user.id);
            }
            setRequests(filteredData as Request[]);
        }
        setLoading(false);
    };
    fetchRequests();
  }, [searchQuery, supabase]);

  if (loading) return <div className="p-4 container mx-auto">Loading requests...</div>;
  
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
      
      {requests.length === 0 ? (
        <p className="text-muted-foreground">
          {searchQuery ? `No open requests found for "${searchQuery}".` : "No open requests have been posted yet."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <Link href={`/requests/${request.id}`} key={request.id}>
              <RequestCard 
                title={request.title}
                budget={request.budget}
                buyerId={request.user_id}
                buyerName={request.profiles?.full_name || 'A CMU Student'}
                buyerAvatarUrl={request.profiles?.avatar_url || null}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}