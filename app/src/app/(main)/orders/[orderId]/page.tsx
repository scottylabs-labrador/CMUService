// src/app/orders/[orderId]/page.tsx

'use client';

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import { createClient } from "@/utils/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderActions } from "@/components/OrderActions";
import { OrderChat } from "@/components/OrderChat";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, CheckCircle2, Loader2 } from "lucide-react"; // Added icons

type OrderWithDetails = {
  id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  amount: number;
  services: { title: string; } | null;
  requests: { title: string; } | null;
};

const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function OrderPage() {
    const supabase = createClient();
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams(); // Hook to read URL params
    const orderId = params.orderId as string;

    const { user } = useAuth();
    const [order, setOrder] = useState<OrderWithDetails | null>(null);
    const [requirements, setRequirements] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State for payment feedback
    const paymentStatus = searchParams.get('payment');

    const markNotificationsAsRead = useCallback(async () => {
        if (user && orderId) {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('recipient_id', user.id)
                .eq('order_id', orderId);
            if (error) console.error("Error marking notifications:", error);
        }
    }, [user, orderId, supabase]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select(`*, services(title), requests(title)`)
                .eq('id', orderId)
                .single();

            if (orderError || !orderData) {
                setError("Order not found or you do not have permission to view it.");
                setLoading(false);
                return;
            }
            
            setOrder(orderData as OrderWithDetails);

            if (orderData.status !== 'awaiting_requirements') {
                const { data: reqData, error: reqError } = await supabase
                    .from('order_requirements')
                    .select('requirements_text')
                    .eq('order_id', orderId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();
                
                if (reqError && reqError.code !== 'PGRST116') console.error("Error fetching requirements:", reqError);
                else if (reqData) setRequirements(reqData.requirements_text);
            }
            setLoading(false);
        };
        fetchData();
    }, [orderId, router, supabase, user]);

    useEffect(() => {
        markNotificationsAsRead();
        return () => { markNotificationsAsRead(); };
    }, [markNotificationsAsRead]);

    // Realtime Subscription
    // This is CRITICAL for Stripe: The webhook updates the DB, this listener updates the UI automatically
    useEffect(() => {
        if (!orderId) return;
        const channel = supabase.channel(`orders:${orderId}`)
            .on(
                'postgres_changes', 
                { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, 
                (payload) => {
                    setOrder(prevOrder => prevOrder ? ({ ...prevOrder, ...payload.new } as OrderWithDetails) : null);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, orderId]);

    if (loading) { return <div className="p-4 container mx-auto">Loading order details...</div>; }
    if (error || !order || !user) { return <div className="p-4 container mx-auto">{error || "Could not load order details."}</div>; }

    const backPath = user.id === order.buyer_id ? '/dashboard/buying' : '/dashboard/selling';
    const orderTitle = order.services?.title || `Service for "${order.requests?.title}"`;

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <Button asChild variant="outline" className="mb-8">
                <Link href={backPath}><ChevronLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
            </Button>

            {/* PAYMENT FEEDBACK BANNER */}
            {paymentStatus === 'success' && order.status !== 'completed' && (
                 <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3 text-blue-700">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <p><strong>Payment Successful!</strong> We are confirming your payment with Stripe. The order status will update automatically in a moment...</p>
                 </div>
            )}
            
            {paymentStatus === 'success' && order.status === 'completed' && (
                 <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <p><strong>Order Completed!</strong> Payment received successfully.</p>
                 </div>
            )}

            <h1 className="text-3xl font-bold mb-2">Order Details</h1>
            <p className="text-muted-foreground text-sm mb-8">Order ID: {order.id}</p>

            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Order Summary</CardTitle>
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                            {formatStatus(order.status)}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-1">
                            <p className="text-sm text-muted-foreground">You purchased:</p>
                            <p className="font-semibold text-lg">{orderTitle}</p>
                        </div>
                        <p className="font-bold text-xl">${order.amount.toFixed(2)}</p>
                    </div>
                </CardContent>
            </Card>

            {requirements && (
                <Card className="mb-6">
                    <CardHeader><CardTitle>Submitted Requirements</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground whitespace-pre-wrap break-words">{requirements}</p></CardContent>
                </Card>
            )}

            <OrderActions order={order} user={user} />

            {order.status !== 'awaiting_requirements' && (
                <div className="mt-6">
                    <OrderChat order={order} user={user} />
                </div>
            )}
        </div>
    );
}