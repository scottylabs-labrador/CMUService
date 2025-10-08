// src/app/review/[orderId]/page.tsx

'use client';

import { useState, useEffect, MouseEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReviewPage() {
    const supabase = createClient();
    const router = useRouter();
    const params = useParams();
    const orderId = params.orderId as string;

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleMouseMove = (starIndex: number, event: MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const percentage = mouseX / rect.width;
        setHoverRating(starIndex - (percentage < 0.5 ? 0.5 : 0));
    };

    const handleClick = (starIndex: number, event: MouseEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const percentage = mouseX / rect.width;
        setRating(starIndex - (percentage < 0.5 ? 0.5 : 0));
    };

    const handleSubmitReview = async () => {
        if (rating === 0) {
            setError("Please select a star rating.");
            return;
        }
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('seller_id, service_id')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            setError("Could not find the associated order.");
            return;
        }

        const { error: insertError } = await supabase.from('reviews').insert({
            order_id: orderId,
            service_id: order.service_id,
            reviewer_id: user.id,
            seller_id: order.seller_id,
            rating: rating,
            comment: comment.trim() || null,
        });

        if (insertError) {
            setError("Error submitting review: " + insertError.message);
        } else {
            router.push('/dashboard/buying');
        }
    };
    
    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <Card>
                <CardHeader>
                    <CardTitle>Leave a Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <p className="font-medium mb-2">Overall Rating</p>
                        <div className="flex items-center" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => {
                                const displayRating = hoverRating || rating;
                                let fillPercentage = 0;
                                if (displayRating >= star) {
                                    fillPercentage = 100;
                                } else if (displayRating >= star - 0.5) {
                                    fillPercentage = 50;
                                }

                                return (
                                    <div
                                        key={star}
                                        className="relative cursor-pointer"
                                        onMouseMove={(e) => handleMouseMove(star, e)}
                                        onClick={(e) => handleClick(star, e)}
                                    >
                                        <Star className="h-8 w-8 text-muted-foreground" />
                                        <div 
                                            className="absolute top-0 left-0 h-full overflow-hidden"
                                            style={{ width: `${fillPercentage}%` }}
                                        >
                                            <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <p className="font-medium mb-2">Add a Written Review (Optional)</p>
                        <Textarea 
                            placeholder="Share your experience with this seller..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <Button onClick={handleSubmitReview}>Submit Review</Button>
                </CardContent>
            </Card>
        </div>
    );
}