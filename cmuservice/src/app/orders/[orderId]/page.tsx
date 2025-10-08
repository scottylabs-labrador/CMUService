// src/app/orders/[orderId]/page.tsx

'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderActions } from "@/components/OrderActions";
import { OrderChat } from "@/components/OrderChat";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type OrderWithService = {
  id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  amount: number;
  services: { title: string; } | null;
};

const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function OrderPage() {
    const supabase = createClient();
    const params = useParams();
    const router = useRouter();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<OrderWithService | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [requirements, setRequirements] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            const { data: orderData, error: orderError } = await supabase.from('orders').select(`*, services (title)`).eq('id', orderId).single();

            if (orderError || !orderData) {
                setError("Order not found or you do not have permission to view it.");
                setLoading(false);
                return;
            }
            
            setOrder(orderData as OrderWithService);

            if (orderData.status !== 'awaiting_requirements') {
                const { data: reqData, error: reqError } = await supabase.from('order_requirements').select('requirements_text').eq('order_id', orderId).order('created_at', { ascending: false }).limit(1).single();
                if (reqError) {
                    console.error("Error fetching requirements:", reqError);
                } else if (reqData) {
                    setRequirements(reqData.requirements_text);
                }
            }
            setLoading(false);
        };
        fetchData();
    }, [orderId, router, supabase]);
    
    useEffect(() => {
        const markAsRead = async () => {
            if (orderId && user) {
                await supabase.from('notifications').update({ is_read: true }).eq('order_id', orderId).eq('recipient_id', user.id);
            }
        };
        if (user && orderId) markAsRead();
    }, [orderId, user, supabase]);
    
    useEffect(() => {
        if (!orderId) return;
        const channel = supabase.channel(`orders:${orderId}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` }, (payload) => {
            setOrder(prevOrder => ({ ...prevOrder, ...payload.new } as OrderWithService));
        }).subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, orderId]);

    if (loading) { return <div className="p-4 container mx-auto">Loading order details...</div>; }
    if (error || !order || !user) { return <div className="p-4 container mx-auto">{error || "Could not load order details."}</div>; }

    const backPath = user.id === order.buyer_id ? '/dashboard/buying' : '/dashboard/selling';

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <Button asChild variant="outline" className="mb-8"><Link href={backPath}><ChevronLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link></Button>
            <h1 className="text-3xl font-bold mb-2">Order Details</h1>
            <p className="text-muted-foreground text-sm mb-8">Order ID: {order.id}</p>
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-center"><CardTitle>Order Summary</CardTitle><Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>{formatStatus(order.status)}</Badge></div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 space-y-1"><p className="text-sm text-muted-foreground">You purchased:</p><p className="font-semibold text-lg">{order.services?.title || 'Service Title Not Found'}</p></div>
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
            {order.status !== 'awaiting_requirements' && (<div className="mt-6"><OrderChat order={order} user={user} /></div>)}
        </div>
    );
}