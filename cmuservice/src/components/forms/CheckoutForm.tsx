// src/components/forms/CheckoutForm.tsx

'use client';

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Define the shape of the service object this component will receive
type Service = {
    id: string;
    user_id: string;
    price: number;
};

interface CheckoutFormProps {
    service: Service;
    user: User;
}

export function CheckoutForm({ service, user }: CheckoutFormProps) {
    const supabase = createClient();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        setIsSubmitting(true);
        setError(null);

        // 1. Insert a new row into the 'orders' table
        const { data: newOrder, error: insertError } = await supabase
            .from('orders')
            .insert({
                service_id: service.id,
                buyer_id: user.id,
                seller_id: service.user_id,
                amount: service.price,
                // The 'status' defaults to 'awaiting_requirements'
            })
            .select() // Ask Supabase to return the newly created row
            .single(); // We expect only one row to be returned

        if (insertError) {
            setError("Failed to create order. Please try again.");
            console.error("Order creation error:", insertError);
            setIsSubmitting(false);
            return;
        }

        // 2. If successful, redirect to the new order's page
        if (newOrder) {
            router.push(`/orders/${newOrder.id}`);
        }
    };

    return (
        <div className="w-full">
            <div className="p-4 bg-muted rounded-lg text-center mb-4">
                <p className="text-sm font-semibold">Payment Method Section (Mock)</p>
            </div>
            {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
            <Button 
                className="w-full" 
                size="lg" 
                onClick={handleConfirm}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Confirming...' : 'Confirm & Pay'}
            </Button>
        </div>
    );
}