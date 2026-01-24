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
import Link from "next/link";
// NEW IMPORTS
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { createCheckoutSession } from "@/app/actions/stripe";

type Order = {
    id: string;
    status: string;
    buyer_id: string;
    seller_id: string;
    amount: number;
    services: { title: string } | null;
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
    
    // Dialog States
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [isRevisionDialogOpen, setIsRevisionDialogOpen] = useState(false);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false); // NEW

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
        } else {
            await supabase.from('notifications').insert({ recipient_id: order.seller_id, order_id: order.id, notification_type: 'requirements_submitted', content: 'The buyer has submitted the requirements' });
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
            const messageText = order.status === 'in_revision' ? 'The seller has delivered the revised work.' : 'The seller has delivered the order.';
            await supabase.from('messages').insert({ order_id: order.id, sender_id: user.id, message_text: messageText, message_type: 'event_delivered' });
            await supabase.from('notifications').insert({ recipient_id: order.buyer_id, order_id: order.id, notification_type: 'order_delivered', content: 'Your order has been delivered' });
        }
    };

    // --- NEW: Handle logic for accepting delivery ---
    const handleAcceptClick = () => {
        // Instead of updating immediately, open the payment choice dialog
        setIsPaymentDialogOpen(true);
    };

    const handleStripePay = async () => {
        // Calls the Server Action to redirect to Stripe
        const serviceTitle = order.services?.title || "Custom Service";
        await createCheckoutSession(order.id, order.amount, serviceTitle);
    };

    const handleManualPay = async () => {
        setIsPaymentDialogOpen(false);
        const { error } = await supabase.from('orders').update({ status: 'awaiting_payment' }).eq('id', order.id);
        if (error) {
            alert("Error accepting delivery: " + error.message);
        } else {
            await supabase.from('notifications').insert({ recipient_id: order.seller_id, order_id: order.id, notification_type: 'delivery_accepted', content: 'The buyer has accepted your delivery and will pay manually.' });
        }
    };
    // ------------------------------------------------

    const handleConfirmPayment = async () => {
        const { error } = await supabase.from('orders').update({ status: 'completed' }).eq('id', order.id);
        if (error) {
            alert("Error confirming payment: " + error.message);
        } else {
            await supabase.from('messages').insert({ order_id: order.id, sender_id: user.id, message_text: 'The seller has confirmed payment. This order is now complete.', message_type: 'event_completed' });
            await supabase.from('notifications').insert({ recipient_id: order.buyer_id, order_id: order.id, notification_type: 'order_completed', content: 'Your order is now complete. Please leave a review!' });
        }
    };

    const handleRequestRevision = async (comment: string) => {
        const { error: updateError } = await supabase.from('orders').update({ status: 'in_revision' }).eq('id', order.id);
        if (updateError) {
            alert("Error requesting revision: " + updateError.message);
            return;
        }
        await supabase.from('messages').insert({ order_id: order.id, sender_id: user.id, message_text: `Revision requested: "${comment}"`, message_type: 'event_revision_request' });
        await supabase.from('notifications').insert({ recipient_id: order.seller_id, order_id: order.id, notification_type: 'revision_requested', content: 'The buyer has requested a revision' });
        setIsRevisionDialogOpen(false);
    };

    if (isBuyer && order.status === 'awaiting_requirements') {
        return (
            <>
                <ConfirmationDialog isOpen={isCancelDialogOpen} onClose={() => setIsCancelDialogOpen(false)} onConfirm={handleCancelOrder} title="Are you sure you want to cancel?" description="This action cannot be undone. This will permanently cancel this order." />
                <Card className="mb-6">
                    <CardHeader><CardTitle>Submit Requirements</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Provide the necessary information for the seller to begin working.</p>
                        <Textarea placeholder="e.g., Please proofread the attached document..." value={requirements} onChange={(e) => setRequirements(e.target.value)} className="mb-4" rows={5} />
                        <Button onClick={handleSubmitRequirements} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit Requirements'}</Button>
                    </CardContent>
                </Card>
                <div className="mt-8"><Button variant="destructive" onClick={() => setIsCancelDialogOpen(true)} disabled={isCanceling}>{isCanceling ? 'Canceling...' : 'Cancel Order'}</Button></div>
            </>
        );
    }

    if (!isBuyer && (order.status === 'in_progress' || order.status === 'in_revision')) {
        return (
            <Card>
                <CardHeader><CardTitle>{order.status === 'in_revision' ? 'Deliver Revised Work' : 'Deliver Your Work'}</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">{order.status === 'in_revision' ? "The buyer has requested revisions. When you have completed the changes, deliver the work again." : "You have received the requirements. When you have completed the work, click the button below to deliver it to the buyer."}</p>
                    <Button onClick={handleDeliverOrder}>{order.status === 'in_revision' ? 'Deliver Again' : 'Deliver Work'}</Button>
                </CardContent>
            </Card>
        );
    }
    
    if (isBuyer && order.status === 'delivered') {
        return (
            <>
                <RevisionRequestDialog isOpen={isRevisionDialogOpen} onClose={() => setIsRevisionDialogOpen(false)} onSubmit={handleRequestRevision} />
                
                {/* NEW PAYMENT METHOD DIALOG */}
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Accept Delivery & Pay</DialogTitle>
                            <DialogDescription>
                                How would you like to pay for this service?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-3 py-4">
                            <Button onClick={handleStripePay} className="w-full bg-[#635bff] hover:bg-[#4b45c6] text-white">
                                Pay securely with Card (Stripe)
                            </Button>
                            <div className="relative text-center">
                                <span className="bg-background px-2 text-xs text-muted-foreground uppercase">Or</span>
                            </div>
                            <Button variant="outline" onClick={handleManualPay} className="w-full">
                                Pay Manually (Cash/Zelle/Venmo)
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Card>
                    <CardHeader><CardTitle>Order Delivered</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">The seller has delivered your order. Please review the work and either accept it or request a revision.</p>
                        <div className="flex gap-4">
                            <Button onClick={handleAcceptClick}>Accept Delivery</Button>
                            <Button variant="outline" onClick={() => setIsRevisionDialogOpen(true)}>Request Revision</Button>
                        </div>
                    </CardContent>
                </Card>
            </>
        );
    }

    if (isBuyer && order.status === 'in_revision') {
        return (
            <Card>
                <CardHeader><CardTitle>Revision in Progress</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">The seller is working on your requested changes. You will be notified when they deliver again.</p></CardContent>
            </Card>
        );
    }

    if (isBuyer && order.status === 'awaiting_payment') {
        return (
            <Card>
                <CardHeader><CardTitle>Awaiting Payment Confirmation</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Please arrange payment with the seller off-platform (e.g., Zelle, cash). Once you have paid, the seller will confirm receipt to complete the order.</p></CardContent>
            </Card>
        );
    }

    if (!isBuyer && order.status === 'awaiting_payment') {
        return (
            <Card>
                <CardHeader><CardTitle>Confirm Payment</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">The buyer has accepted the delivery. Please confirm that you have received payment to complete this order.</p>
                    <Button onClick={handleConfirmPayment}>Confirm Payment Received</Button>
                </CardContent>
            </Card>
        );
    }

    if (!isBuyer && order.status === 'delivered') {
        return (
            <Card>
                <CardHeader><CardTitle>Pending Buyer&apos;s Acceptance</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">You have delivered the order. Please wait for the buyer to review and accept the delivery.</p></CardContent>
            </Card>
        );
    }

    if (isBuyer && order.status === 'completed') {
        return (
            <Card>
                <CardHeader><CardTitle>Order Complete</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">This order is complete. Please leave a review to help other students.</p>
                    <Button asChild><Link href={`/review/${order.id}`}>Leave a Review</Link></Button>
                </CardContent>
            </Card>
        );
    }

    return null;
}