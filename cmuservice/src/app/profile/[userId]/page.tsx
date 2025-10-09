// src/app/profile/[userId]/page.tsx

'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ServiceCard } from "@/components/ServiceCard";
import { RequestCard } from "@/components/RequestCard";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

type Profile = {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
};
type Service = {
    id: string;
    title: string;
    price: number;
    image_url: string | null;
    avg_rating: number;
    review_count: number;
};
type Request = {
    id: string;
    title: string;
    budget: number;
};

export default function ProfilePage() {
    const supabase = createClient();
    const params = useParams();
    const userId = params.userId as string;

    const [profile, setProfile] = useState<Profile | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!userId) return;

            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (profileError) {
                console.error("Error fetching profile:", profileError);
                setLoading(false);
                return;
            }
            setProfile(profileData);

            const { data: servicesData } = await supabase
                .from('services_with_ratings')
                .select('*')
                .eq('user_id', userId);
            
            if (servicesData) setServices(servicesData as Service[]);

            const { data: requestsData } = await supabase
                .from('requests')
                .select('*')
                .eq('user_id', userId);
            
            if (requestsData) setRequests(requestsData as Request[]);
            
            setLoading(false);
        };

        fetchProfileData();
    }, [userId, supabase]);

    if (loading) return <div className="p-4 container mx-auto">Loading profile...</div>;
    if (!profile) return <div className="p-4 container mx-auto">User profile not found.</div>;

    return (
        <div className="container mx-auto p-4 md:p-8">
            {/* --- Profile Header --- */}
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <Avatar className="h-24 w-24 md:h-32 md:w-32">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="text-3xl">
                        {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold">{profile.full_name || 'A CMUService User'}</h1>
                </div>
            </div>

            {/* --- Bio Section --- */}
            {profile.bio && (
                <>
                    <Separator className="my-8" />
                    <div>
                        <h2 className="text-2xl font-semibold">Bio</h2>
                        {/* The 'max-w-2xl' class has been removed from here */}
                        <p className="mt-4 text-muted-foreground break-words">{profile.bio}</p>
                    </div>
                </>
            )}

            <Separator className="my-8" />

            {/* --- User's Services Section --- */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">{profile.full_name}&apos;s Services</h2>
                {services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <Link href={`/services/${service.id}`} key={service.id}>
                                <ServiceCard 
                                    title={service.title}
                                    price={service.price}
                                    sellerName={profile.full_name || ''}
                                    imageUrl={service.image_url || "https://placehold.co/600x400/e0e7ff/4338ca?text=Service"}
                                    avgRating={service.avg_rating}
                                    reviewCount={service.review_count}
                                />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">This user is not offering any services yet.</p>
                )}
            </div>

            <Separator className="my-8" />

            {/* --- User's Requests Section --- */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">{profile.full_name}&apos;s Requests</h2>
                {requests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requests.map((request) => (
                             <Link href={`/requests/${request.id}`} key={request.id}>
                                <RequestCard 
                                    title={request.title}
                                    budget={request.budget}
                                    buyerName={profile.full_name || ''}
                                />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">This user has not posted any requests yet.</p>
                )}
            </div>
        </div>
    );
}