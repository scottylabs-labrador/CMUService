// src/components/OrderActions.tsx

'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ConfirmationDialog } from "./ui/ConfirmationDialog";
import { RevisionRequestDialog } from "./ui/RevisionRequestDialog";
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
    const [isRevisionDialogOpen, setIsRevisionDialogOpen] = useState(false);

    const isBuyer = user.id === order.buyer_id;

    const handleSubmitRequirements = async () => {
        if (!requirements.trim()) {
            alert("Please provide the requirements for your order.");
            return;
        }
        setIsSubmitting(true);
        const { error: reqError } = await supabase.from('order_requirements').insert({ order_id: order.id, requirements_text: requirements });
        if (reqError) {
            alert("Failed to submit requirements: " + reqError.message);
            setIsSubmitting(false);
            return;
        }
        const { error: orderUpdateError } = await supabase.from('orders').update({ status: 'in_progress' }).eq('id', order.id);
        if (orderUpdateError) {
            alert("Failed to update order status: " + orderUpdateError.message);
        }
        setIsSubmitting(false);
    };

    const handleCancelOrder = async () => {
        setIsCanceling(true);
        const { error } = await supabase.from('orders').delete().eq('id', order.id);
        if (error) {
            alert("Failed to cancel order: " + error.message);
        } else {
            router.push('/dashboard/buying');
        }
        setIsCanceling(false);
        setIsCancelDialogOpen(false);
    };

    const handleDeliverOrder = async () => {
        const { error } = await supabase.from('orders').update({ status: 'delivered' }).eq('id', order.id);
        if (error) {
            alert("Error delivering order: " + error.message);
        } else {
            const messageText = order.status === 'in_revision'
                ? 'The seller has delivered the revised work.'
                : 'The seller has delivered the order.';
            await supabase.from('messages').insert({ order_id: order.id, sender_id: user.id, message_text: messageText, message_type: 'event_delivered' });
        }
    };

    const handleCompleteOrder = async () => {
        const { error } = await supabase.from('orders').update({ status: 'completed' }).eq('id', order.id);
        if (error) {
            alert("Error completing order: " + error.message);
        } else {
            await supabase.from('messages').insert({ order_id: order.id, sender_id: user.id, message_text: 'The buyer has accepted the delivery and completed this order.', message_type: 'event_completed' });
            router.push(`/review/${order.id}`);
        }
    };

    const handleRequestRevision = async (comment: string) => {
        const { error: updateError } = await supabase.from('orders').update({ status: 'in_revision' }).eq('id', order.id);
        if (updateError) {
            alert("Error requesting revision: " + updateError.message);
            return;
        }
        await supabase.from('messages').insert({ order_id: order.id, sender_id: user.id, message_text: `Revision requested: "${comment}"`, message_type: 'event_revision_request' });
        setIsRevisionDialogOpen(false);
    };

    // Buyer's view when requirements are needed
    if (isBuyer && order.status === 'awaiting_requirements') {
        return (
            <>
                <ConfirmationDialog isOpen={isCancelDialogOpen} onClose={() => setIsCancelDialogOpen(false)} onConfirm={handleCancelOrder} title="Are you sure you want to cancel?" description="This action cannot be undone. This will permanently cancel this order." />
                <Card className="mb-6">
                    <CardHeader><CardTitle>Submit Requirements</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Provide the necessary information for the seller to begin working.</p>
                        <Textarea placeholder="e.g., Please proofread the attached document for grammar mistakes..." value={requirements} onChange={(e) => setRequirements(e.target.value)} className="mb-4" rows={5} />
                        <Button onClick={handleSubmitRequirements} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Requirements'}</Button>
                    </CardContent>
                </Card>
                <div className="mt-8">
                    <Button variant="destructive" onClick={() => setIsCancelDialogOpen(true)} disabled={isCanceling}>{isCanceling ? 'Canceling...' : 'Cancel Order'}</Button>
                </div>
            </>
        );
    }

    // Seller's view when the order is in progress or revision
    if (!isBuyer && (order.status === 'in_progress' || order.status === 'in_revision')) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{order.status === 'in_revision' ? 'Deliver Revised Work' : 'Deliver Your Work'}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">
                        {order.status === 'in_revision'
                            ? "The buyer has requested revisions. When you have completed the changes, deliver the work again."
                            : "You have received the requirements. When you have completed the work, click the button below to deliver it to the buyer."
                        }
                    </p>
                    <Button onClick={handleDeliverOrder}>{order.status === 'in_revision' ? 'Deliver Again' : 'Deliver Work'}</Button>
                </CardContent>
            </Card>
        );
    }
    
    // --- NEW SECTION FOR SELLER ---
    // Seller's view when waiting for buyer's acceptance
    if (!isBuyer && order.status === 'delivered') {
        return (
            <Card>
                <CardHeader><CardTitle>Pending Buyer&apos;s Acceptance</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You have delivered the order. Please wait for the buyer to review and accept the delivery.</p>
                </CardContent>
            </Card>
        );
    }

    // Buyer's view when the order has been delivered
    if (isBuyer && order.status === 'delivered') {
        return (
            <>
                <RevisionRequestDialog isOpen={isRevisionDialogOpen} onClose={() => setIsRevisionDialogOpen(false)} onSubmit={handleRequestRevision} />
                <Card>
                    <CardHeader><CardTitle>Order Delivered</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">The seller has delivered your order. Please review the work and either accept it or request a revision.</p>
                        <div className="flex gap-4">
                            <Button onClick={handleCompleteOrder}>Accept & Complete</Button>
                            <Button variant="outline" onClick={() => setIsRevisionDialogOpen(true)}>Request Revision</Button>
                        </div>
                    </CardContent>
                </Card>
            </>
        );
    }

    // Buyer's view when the order is IN REVISION (no action buttons)
    if (isBuyer && order.status === 'in_revision') {
        return (
            <Card>
                <CardHeader><CardTitle>Revision in Progress</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">The seller is working on your requested changes. You will be notified when they deliver again.</p>
                </CardContent>
            </Card>
        );
    }

    return null;
}