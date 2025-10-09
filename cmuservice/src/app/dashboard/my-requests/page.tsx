// src/app/dashboard/my-requests/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// 1. Update the type to include the 'id' for each order
type Request = {
    id: string;
    title: string;
    budget: number;
    status: string;
    orders: { id: string; status: string }[];
};

export default function MyRequestsPage() {
    const supabase = createClient();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // 2. Update the query to also select the 'id' from the orders table
            const { data, error } = await supabase
                .from('requests')
                .select(`
                    *,
                    orders ( id, status )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching requests:", error);
            } else if (data) {
                setRequests(data as Request[]);
            }
            setLoading(false);
        };
        fetchRequests();
    }, [supabase]);

    const openRequests = requests.filter(req => req.status === 'open' && req.orders.length === 0);
    const inProgressRequests = requests.filter(req => req.status === 'closed' && req.orders.some(o => o.status !== 'completed'));
    const completedRequests = requests.filter(req => req.status === 'closed' && req.orders.some(o => o.status === 'completed'));

    if (loading) return <div>Loading your requests...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">My Requests</h1>
                <Button asChild>
                    <Link href="/dashboard/my-requests/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Request
                    </Link>
                </Button>
            </div>

            <h2 className="text-2xl font-semibold mb-4">Open for Offers</h2>
            {openRequests.length > 0 ? (
                <div className="space-y-4">
                    {openRequests.map((request) => (
                        <Link href={`/requests/${request.id}`} key={request.id}>
                            <Card className="hover:bg-muted/50 transition-colors">
                                <CardHeader>
                                    <CardTitle className="text-lg">{request.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-semibold">Budget: ${request.budget}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">You have no open requests.</p>
            )}

            <Separator className="my-8" />

            <h2 className="text-2xl font-semibold mb-4">In Progress</h2>
            {inProgressRequests.length > 0 ? (
                <div className="space-y-4">
                    {inProgressRequests.map((request) => (
                        <Link href={`/orders/${request.orders[0]?.id}`} key={request.id}>
                            <Card className="hover:bg-muted/50 transition-colors">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{request.title}</CardTitle>
                                        <Badge variant="secondary">In Progress</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent><p className="font-semibold">Budget: ${request.budget}</p></CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">You have no requests in progress.</p>
            )}

            <Separator className="my-8" />

            <h2 className="text-2xl font-semibold mb-4">Completed</h2>
            {completedRequests.length > 0 ? (
                <div className="space-y-4">
                    {completedRequests.map((request) => (
                        <Link href={`/orders/${request.orders[0]?.id}`} key={request.id}>
                            <Card className="hover:bg-muted/50 transition-colors opacity-70">
                                <CardHeader>
                                     <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{request.title}</CardTitle>
                                        <Badge>Completed</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent><p className="font-semibold">Budget: ${request.budget}</p></CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">You have no completed requests.</p>
            )}
        </div>
    );
}