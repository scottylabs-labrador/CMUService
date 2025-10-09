// src/app/requests/[requestId]/offers/page.tsx

'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    const requestId = params.requestId as string;
    const [offers, setOffers] = useState<Offer[]>([]);

    useEffect(() => {
        const fetchOffers = async () => {
            const { data, error } = await supabase
                .from('offers')
                .select(`*, profiles (full_name, avatar_url)`)
                .eq('request_id', requestId);
            
            if (data) setOffers(data as Offer[]);
        };
        if (requestId) fetchOffers();
    }, [requestId, supabase]);

    const handleAcceptOffer = async (offerId: string) => {
        // We will call an Edge Function here in the next step to make this transactional
        alert("Accepting offer... (functionality to be fully added)");
        // The edge function will create the order and redirect.
    };

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
                                <Button onClick={() => handleAcceptOffer(offer.id)}>Accept Offer</Button>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{offer.offer_description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <p>You have not received any offers yet.</p>
            )}
        </div>
    );
}