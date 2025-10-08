// src/app/services/[serviceId]/page.tsx

'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Edit, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { User } from "@supabase/supabase-js";

// Define types for our data
type Service = {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    price: number;
    image_url: string | null;
    avg_rating: number;
    review_count: number;
};
type Review = { 
    id: string; 
    rating: number; 
    comment: string | null; 
};

export default function ServiceDetailPage() {
    const supabase = createClient();
    const params = useParams();
    const router = useRouter();
    const serviceId = params.serviceId as string;

    const [service, setService] = useState<Service | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            const { data: serviceData, error: serviceError } = await supabase
                .from('services_with_ratings')
                .select('*')
                .eq('id', serviceId)
                .single();
            
            if (serviceError) {
                console.error("Error fetching service:", serviceError);
                setLoading(false);
                return;
            }
            setService(serviceData);

            const { data: reviewsData, error: reviewsError } = await supabase
                .from('reviews')
                .select('*')
                .eq('service_id', serviceId)
                .order('created_at', { ascending: false });

            if (reviewsError) console.error("Error fetching reviews:", reviewsError);
            else if (reviewsData) setReviews(reviewsData);

            setLoading(false);
        };
        
        if (serviceId) {
            fetchData();
        }
    }, [serviceId, supabase]);

    if (loading) return <div className="p-4 container mx-auto">Loading service...</div>;
    if (!service) return <div className="p-4 container mx-auto">Service not found.</div>;

    const isOwner = user && user.id === service.user_id;
    const backPath = isOwner ? "/dashboard/my-services" : "/services";

    return (
        <div className="container mx-auto p-4">
            <Button asChild variant="outline" className="mb-8">
                <Link href={backPath}><ChevronLeft className="mr-2 h-4 w-4" />Back</Link>
            </Button>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <div className="aspect-video relative rounded-lg overflow-hidden border">
                        <Image 
                            src={service.image_url || "https://placehold.co/600x400/e0e7ff/4338ca?text=Service"} 
                            alt={service.title} 
                            fill 
                            className="object-cover" 
                            unoptimized 
                            priority 
                        />
                    </div>
                    {service.description && (
                        <div className="mt-8">
                            <h2 className="text-2xl font-bold">About this service</h2>
                            <p className="text-muted-foreground mt-4 whitespace-pre-wrap break-words">{service.description}</p>
                        </div>
                    )}
                    <Separator className="my-8" />
                    <h2 className="text-2xl font-bold">Reviews ({service.review_count})</h2>
                    {reviews.length > 0 ? (
                        <div className="space-y-6 mt-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="flex gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center font-semibold">U</div>
                                    <div>
                                        <p className="font-semibold">A CMU User</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                                            ))}
                                        </div>
                                        {review.comment && <p className="text-muted-foreground mt-2 break-words">{review.comment}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground mt-4">No reviews yet.</p>
                    )}
                </div>
                <div className="md:col-span-1">
                    <div className="sticky top-8 p-6 border rounded-lg">
                        <h1 className="text-2xl font-bold">{service.title}</h1>
                        <p className="text-md text-muted-foreground mt-2">by A CMU User</p>
                         {service.review_count > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="font-semibold">{service.avg_rating.toFixed(1)}</span>
                                <span className="text-sm text-muted-foreground">({service.review_count} reviews)</span>
                            </div>
                         )}
                        <Separator className="my-4" />
                        <p className="text-2xl font-bold">Starting at ${service.price}</p>
                        <div className="mt-6">
                            {isOwner ? ( 
                                <Button size="lg" className="w-full" asChild>
                                    <Link href={`/dashboard/my-services/edit/${service.id}`}>
                                        <Edit className="mr-2 h-5 w-5" />Edit Service
                                    </Link>
                                </Button>
                            ) : ( user ? 
                                <Button size="lg" className="w-full" asChild>
                                    <Link href={`/checkout/${service.id}`}>Order Now</Link>
                                </Button> : 
                                <Button size="lg" className="w-full" asChild>
                                    <Link href="/login">Login to Order</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}