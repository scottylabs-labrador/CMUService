// src/app/requests/[requestId]/page.tsx

'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Edit } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MakeOfferDialog } from "@/components/ui/MakeOfferDialog";
import { useNotification } from "@/context/NotificationContext";

type Request = { id: string; user_id: string; title: string; description: string | null; budget: number; profiles: { full_name: string | null; avatar_url: string | null; } | null; };

export default function RequestDetailPage() {
    const supabase = createClient();
    const params = useParams();
    const router = useRouter();
    const { showNotification } = useNotification();
    const requestId = params.requestId as string;

    const [request, setRequest] = useState<Request | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            const { data: requestData, error } = await supabase.from('requests').select(`*, profiles (full_name, avatar_url)`).eq('id', requestId).single();
            
            if (requestData && user && requestData.user_id === user.id) {
                // If the viewer is the owner, redirect them to the offers page
                router.replace(`/requests/${requestId}/offers`);
                return;
            }

            if (error) {
                console.error("Error fetching request:", error);
                setLoading(false);
                return;
            }
            setRequest(requestData as Request);
            setLoading(false);
        };

        if (requestId) fetchData();
    }, [requestId, supabase, router]);

    const handleSubmitOffer = async (price: number, description: string) => {
        if (!user) { router.push('/login'); return; }

        const { error } = await supabase.from('offers').insert({
            request_id: requestId,
            provider_id: user.id,
            offer_price: price,
            offer_description: description,
        });

        if (error) {
            showNotification({ title: "Error", description: "Failed to submit offer: " + error.message });
        } else {
            showNotification({ title: "Success!", description: "Your offer has been submitted." });
            setIsOfferDialogOpen(false);
        }
    };

    if (loading || !request) return <div className="p-4 container mx-auto">Loading request...</div>;
    
    return (
        <>
            <MakeOfferDialog isOpen={isOfferDialogOpen} onClose={() => setIsOfferDialogOpen(false)} onSubmit={handleSubmitOffer} />
            <div className="container mx-auto p-4">
                <Button asChild variant="outline" className="mb-8"><Link href="/requests"><ChevronLeft className="mr-2 h-4 w-4" />Back to Requests</Link></Button>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <Link href={`/profile/${request.user_id}`} className="inline-block group mb-2">
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground group-hover:text-primary">Posted by</p>
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={request.profiles?.avatar_url || undefined} />
                                    <AvatarFallback>{request.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                                <p className="text-sm font-medium group-hover:underline">{request.profiles?.full_name || 'A CMU Student'}</p>
                            </div>
                        </Link>
                        <h1 className="text-4xl font-bold mt-1">{request.title}</h1>
                        {request.description && (
                            <div className="mt-8">
                                <h2 className="text-2xl font-bold">Description</h2>
                                <p className="text-muted-foreground mt-4 whitespace-pre-wrap break-words">{request.description}</p>
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-1">
                         <div className="sticky top-8 p-6 border rounded-lg">
                            <p className="text-lg">Budget</p>
                            <p className="text-3xl font-bold">${request.budget}</p>
                            <div className="mt-6">
                                {user ? 
                                    <Button size="lg" className="w-full" onClick={() => setIsOfferDialogOpen(true)}>Make an Offer</Button> 
                                    : <Button size="lg" className="w-full" asChild><Link href="/login">Login to Make Offer</Link></Button>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}