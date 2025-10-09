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
import { Star } from "lucide-react";

// Update the Profile type to include both rating types
type Profile = {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    avg_service_rating: number;
    service_review_count: number;
    avg_request_rating: number;
    request_review_count: number;
};

type Service = {
    id: string;
    user_id: string;
    title: string;
    price: number;
    image_url: string | null;
    avg_rating: number;
    review_count: number;
    profiles: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
};

type Request = {
    id: string;
    title: string;
    budget: number;
};

type RequestReview = {
    id: string;
    rating: number;
    comment: string | null;
    profiles: { full_name: string | null; avatar_url: string | null; } | null;
};


export default function ProfilePage() {
    const supabase = createClient();
    const params = useParams();
    const userId = params.userId as string;

    const [profile, setProfile] = useState<Profile | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [requests, setRequests] = useState<Request[]>([]);
    const [requestReviews, setRequestReviews] = useState<RequestReview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!userId) return;

            // Fetch from the new 'profiles_with_ratings' view
            const { data: profileData, error: profileError } = await supabase
                .from('profiles_with_ratings')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (profileError) {
                console.error("Error fetching profile:", profileError);
                setLoading(false);
                return;
            }
            setProfile(profileData as Profile);

            const { data: servicesData } = await supabase
                .from('services_with_ratings')
                .select('*, profiles (full_name, avatar_url)')
                .eq('user_id', userId);
            
            if (servicesData) setServices(servicesData as Service[]);

            const { data: requestsData } = await supabase
                .from('requests')
                .select('*')
                .eq('user_id', userId);
            
            if (requestsData) setRequests(requestsData as Request[]);

            const { data: requestReviewsData } = await supabase
                .from('request_reviews')
                .select(`*, profiles!reviewer_id (full_name, avatar_url)`)
                .eq('provider_id', userId);

            if (requestReviewsData) setRequestReviews(requestReviewsData as RequestReview[]);
            
            setLoading(false);
        };

        fetchProfileData();
    }, [userId, supabase]);

    if (loading) return <div className="p-4 container mx-auto">Loading profile...</div>;
    if (!profile) return <div className="p-4 container mx-auto">User profile not found.</div>;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <Avatar className="h-24 w-24 md:h-32 md:w-32">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="text-3xl">{profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold">{profile.full_name || 'A CMU User'}</h1>
                    
                    {/* --- THIS IS THE NEW RATINGS SECTION --- */}
                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-x-4 gap-y-2 mt-2">
                        {profile.service_review_count > 0 && (
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="font-semibold">{profile.avg_service_rating.toFixed(1)}</span>
                                <span className="text-sm text-muted-foreground">({profile.service_review_count} service reviews)</span>
                            </div>
                        )}
                        {profile.request_review_count > 0 && (
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="font-semibold">{profile.avg_request_rating.toFixed(1)}</span>
                                <span className="text-sm text-muted-foreground">({profile.request_review_count} request reviews)</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {profile.bio && (
                <>
                    <Separator className="my-8" />
                    <div>
                        <h2 className="text-2xl font-semibold">Bio</h2>
                        <p className="mt-4 text-muted-foreground break-words">{profile.bio}</p>
                    </div>
                </>
            )}

            <Separator className="my-8" />

            <div>
                <h2 className="text-2xl font-semibold mb-4">{profile.full_name}&apos;s Services</h2>
                {services.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <Link href={`/services/${service.id}`} key={service.id}>
                                <ServiceCard 
                                    title={service.title}
                                    price={service.price}
                                    sellerId={service.user_id}
                                    sellerName={service.profiles?.full_name || ''}
                                    sellerAvatarUrl={service.profiles?.avatar_url || null}
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
            
            <Separator className="my-8" />
             <div>
                <h2 className="text-2xl font-semibold mb-4">Reviews for Completed Requests</h2>
                {requestReviews.length > 0 ? (
                    <div className="space-y-6">
                        {requestReviews.map((review) => (
                             <div key={review.id} className="flex gap-4">
                                <Avatar>
                                    <AvatarImage src={review.profiles?.avatar_url || undefined} />
                                    <AvatarFallback>{review.profiles?.full_name ? review.profiles.full_name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{review.profiles?.full_name || 'A CMU User'}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (<Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />))}
                                    </div>
                                    {review.comment && <p className="text-muted-foreground mt-2 break-words">{review.comment}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">This user has not received any reviews for completed requests yet.</p>
                )}
            </div>
        </div>
    );
}