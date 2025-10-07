// src/app/dashboard/selling/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { User } from '@supabase/supabase-js';

// 1. Define a specific type for your order data
type Order = {
    id: number | string;
    amount: number;
    status: string;
    services: {
        title: string;
    } | null; // The joined services table can be null
};

const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function SellingOrdersPage() {
    const supabase = createClient();
    // 2. Use the new Order type instead of 'any'
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('orders')
                .select(`*, services (title)`)
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error("Error fetching selling orders:", error);
            } else if (data) {
                setOrders(data);
            }
            setLoading(false);
        };
        fetchOrders();
    }, [supabase]);

     if (loading) return <div>Loading your sales...</div>

    return (
        <div>
            <h1 className="text-3xl font-bold">Selling</h1>
            <p className="mt-2 text-muted-foreground mb-8">
                Orders for services you are providing.
            </p>
            {orders.length > 0 ? (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Link href={`/orders/${order.id}`} key={order.id}>
                            <Card className="hover:bg-muted/50 transition-colors">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{order.services?.title || 'Service not found'}</CardTitle>
                                        <Badge variant="secondary">{formatStatus(order.status)}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <p>Order ID: {order.id.toString()}</p>
                                        <p>Profit: ${order.amount.toFixed(2)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-dashed border-2 rounded-lg">
                    <p className="text-muted-foreground">You haven&apos;t sold any services yet.</p>
                </div>
            )}
        </div>
    );
}