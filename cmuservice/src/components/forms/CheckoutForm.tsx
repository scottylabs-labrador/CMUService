// src/components/forms/CheckoutForm.tsx

'use client';

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

        const { data: newOrder, error: insertError } = await supabase
            .from('orders')
            .insert({
                service_id: service.id,
                buyer_id: user.id,
                seller_id: service.user_id,
                amount: service.price,
            })
            .select()
            .single();

        if (insertError) {
            setError("Failed to create order. Please try again.");
            console.error("Order creation error:", insertError);
            setIsSubmitting(false);
            return;
        }

        if (newOrder) {
            router.push(`/orders/${newOrder.id}`);
        }
    };

    return (
        <div className="w-full">
            {error && <p className="text-sm text-red-600 mb-4 text-center">{error}</p>}
            <Button 
                className="w-full" 
                size="lg" 
                onClick={handleConfirm}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Confirming...' : 'Request Service'}
            </Button>
        </div>
    );
}