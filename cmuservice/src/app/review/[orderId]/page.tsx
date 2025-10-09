// src/app/review/[orderId]/page.tsx

'use client';

import { useState, MouseEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReviewPage() {
    const supabase = createClient();
    const router = useRouter();
    const params = useParams();
    const orderId = params.orderId as string;

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleMouseMove = (starIndex: number, event: MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const half = rect.width / 2;
        const x = event.clientX - rect.left;
        setHoverRating(x > half ? starIndex + 1 : starIndex + 0.5);
    };

    const handleClick = (starIndex: number, event: MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const half = rect.width / 2;
        const x = event.clientX - rect.left;
        setRating(x > half ? starIndex + 1 : starIndex + 0.5);
    };

    const handleSubmitReview = async () => {
        if (rating === 0) {
            setError("Please select a star rating.");
            return;
        }
        setError(null);
        setIsSubmitting(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('seller_id, service_id, request_id')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            setError("Could not find the associated order.");
            setIsSubmitting(false);
            return;
        }

        let insertError;

        if (order.service_id) {
            // This was an order for a service
            const { error } = await supabase.from('reviews').insert({
                order_id: orderId,
                service_id: order.service_id,
                reviewer_id: user.id,
                seller_id: order.seller_id,
                rating: rating,
                comment: comment.trim() || null,
            });
            insertError = error;
        } else if (order.request_id) {
            // This was an order for a request
            const { error } = await supabase.from('request_reviews').insert({
                order_id: orderId,
                request_id: order.request_id,
                reviewer_id: user.id,
                provider_id: order.seller_id,
                rating: rating,
                comment: comment.trim() || null,
            });
            insertError = error;
        } else {
            setError("Cannot determine order type. Contact support.");
            setIsSubmitting(false);
            return;
        }

        if (insertError) {
            setError("Error submitting review: " + insertError.message);
        } else {
            // Redirect to the provider's profile page after review
            router.push(`/profile/${order.seller_id}`);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Leave a Review</CardTitle>
                    <CardDescription>
                        Your feedback helps other students make informed decisions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <p className="font-medium mb-2">Rating</p>
                        <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} onMouseMove={(e) => handleMouseMove(i, e)} onClick={(e) => handleClick(i, e)} className="cursor-pointer">
                                    <Star className={cn("h-8 w-8 transition-colors", (hoverRating > i || rating > i) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50")} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="font-medium mb-2">Comment (Optional)</p>
                        <Textarea placeholder="Describe your experience..." value={comment} onChange={(e) => setComment(e.target.value)} />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button onClick={handleSubmitReview} disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Review"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}