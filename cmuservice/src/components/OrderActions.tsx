// src/components/OrderActions.tsx

'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ConfirmationDialog } from "./ui/ConfirmationDialog";
import { User } from "@supabase/supabase-js";

type Order = {
    id: string;
    status: string;
    buyer_id: string;
};

interface OrderActionsProps {
    order: Order;
    user: User;
}

export function OrderActions({ order, user }: OrderActionsProps) {
    const supabase = createClient();
    const router = useRouter();
    const [requirements, setRequirements] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCanceling, setIsCanceling] = useState(false);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    console.log("--- Checking Ownership ---");
    console.log("Logged-in User ID:", user.id);
    console.log("Order's Buyer ID: ", order.buyer_id);

    const isBuyer = user.id === order.buyer_id;

    const handleSubmitRequirements = async () => {
        if (!requirements.trim()) {
            alert("Please provide the requirements for your order.");
            return;
        }
        setIsSubmitting(true);

        // Step 1: Insert the requirements into the new table
        const { error: reqError } = await supabase
            .from('order_requirements')
            .insert({
                order_id: order.id,
                requirements_text: requirements,
            });

        if (reqError) {
            alert("Failed to submit requirements: " + reqError.message);
            setIsSubmitting(false);
            return;
        }

        // Step 2: Update the order status to 'in_progress'
        const { error: orderUpdateError } = await supabase
            .from('orders')
            .update({ status: 'in_progress' })
            .eq('id', order.id);
        
        if (orderUpdateError) {
            alert("Failed to update order status: " + orderUpdateError.message);
        } else {
            // Refresh the page to show the new status and hide the form
            router.refresh();
        }
        setIsSubmitting(false);
    };

    const handleCancelOrder = async () => {
        setIsCanceling(true);
        
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', order.id);

        if (error) {
            alert("Failed to cancel order: " + error.message);
        } else {
            router.push('/dashboard/buying'); // Redirect to buying dashboard after cancel
        }
        setIsCanceling(false);
        setIsCancelDialogOpen(false);
    };

    // Only the buyer can see these actions
    if (!isBuyer) {
        return null;
    }

    return (
        <>
            <ConfirmationDialog
                isOpen={isCancelDialogOpen}
                onClose={() => setIsCancelDialogOpen(false)}
                onConfirm={handleCancelOrder}
                title="Are you sure you want to cancel?"
                description="This action cannot be undone. This will permanently cancel this order."
            />
        
            {/* Show requirements form only if status is 'awaiting_requirements' */}
            {order.status === 'awaiting_requirements' && (
                <Card className="mb-6">
                    <CardHeader><CardTitle>Submit Requirements</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Provide the necessary information for the seller to begin working. The delivery timer will start once you submit.
                        </p>
                        <Textarea 
                            placeholder="e.g., Please proofread the attached document for grammar mistakes..." 
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            className="mb-4"
                            rows={5}
                        />
                        <Button onClick={handleSubmitRequirements} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Requirements'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Allow canceling only before the work is in progress */}
            {order.status === 'awaiting_requirements' && (
                <div className="mt-8">
                     <Button 
                        variant="destructive" 
                        onClick={() => setIsCancelDialogOpen(true)}
                        disabled={isCanceling}
                     >
                        {isCanceling ? 'Canceling...' : 'Cancel Order'}
                    </Button>
                </div>
            )}
        </>
    );
}