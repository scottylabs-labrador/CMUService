// src/app/requests/[requestId]/offers/page.tsx

'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNotification } from "@/context/NotificationContext";

type Offer = {
    id: string;
    offer_price: number;
    offer_description: string;
    profiles: { full_name: string | null; avatar_url: string | null; } | null;
};

export default function RequestOffersPage() {
    const supabase = createClient();
    const params = useParams();
    const router = useRouter();
    const { showNotification } = useNotification();
    const requestId = params.requestId as string;
    
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchOffers = async () => {
            const { data, error } = await supabase
                .from('offers')
                .select(`*, profiles (full_name, avatar_url)`)
                .eq('request_id', requestId)
                .eq('status', 'pending'); // Only show pending offers
            
            if (data) setOffers(data as Offer[]);
            setLoading(false);
        };
        if (requestId) fetchOffers();
    }, [requestId, supabase]);

    const handleAcceptOffer = async (offerId: string) => {
        setAcceptingId(offerId);

        const { data, error } = await supabase.functions.invoke('accept-offer', {
            body: { offer_id: offerId },
        });

        if (error) {
            showNotification({ title: "Error", description: "Failed to accept offer: " + error.message });
            setAcceptingId(null);
        } else {
            // On success, redirect to the newly created order page
            router.push(`/orders/${data.new_order_id}`);
        }
    };

    if (loading) return <div>Loading offers...</div>;

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <h1 className="text-3xl font-bold mb-4">Offers for Your Request</h1>
            {offers.length > 0 ? (
                <div className="space-y-4">
                    {offers.map((offer) => (
                        <Card key={offer.id}>
                            <CardHeader className="flex flex-row justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={offer.profiles?.avatar_url || undefined} />
                                        <AvatarFallback>{offer.profiles?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-lg">{offer.profiles?.full_name || 'A Provider'}</CardTitle>
                                        <CardDescription>${offer.offer_price}</CardDescription>
                                    </div>
                                </div>
                                <Button 
                                    onClick={() => handleAcceptOffer(offer.id)}
                                    disabled={!!acceptingId}
                                >
                                    {acceptingId === offer.id ? 'Accepting...' : 'Accept Offer'}
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{offer.offer_description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-muted-foreground">You have not received any offers yet.</p>
            )}
        </div>
    );
}